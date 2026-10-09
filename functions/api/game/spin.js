// Apex · POST /api/game/spin
// 服务端权威 spin（real 模式唯一入口）

import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { getCurrentUser } from '../../_auth.js';
import { loadServerEngine } from '../../_game-bridge.js';
import { loadConfig } from '../../_config-bridge.js';
import { enforceKeyRateLimit } from '../../_rateLimit.js';

const MAX_BET_MINOR = 10000 * 100;
const MIN_BET_MINOR = 1;
const SPIN_ID_MIN = 10;
const SPIN_ID_MAX = 64;

function validateRequest(body) {
  if (!body || typeof body !== 'object') return 'body 非法';
  const { spinId, betMinor, mode } = body;
  if (typeof spinId !== 'string' || spinId.length < SPIN_ID_MIN || spinId.length > SPIN_ID_MAX)
    return 'spinId 非法（长度 ' + SPIN_ID_MIN + '~' + SPIN_ID_MAX + '）';
  if (!/^[a-zA-Z0-9_-]+$/.test(spinId)) return 'spinId 含非法字符';
  if (!Number.isSafeInteger(betMinor)) return 'betMinor 必须为整数';
  if (betMinor < MIN_BET_MINOR) return 'betMinor 小于下限';
  if (betMinor > MAX_BET_MINOR) return 'betMinor 超过上限';
  if (mode !== 'real' && mode !== 'demo') return 'mode 必须为 real | demo';
  return null;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  try {
    const user = await getCurrentUser(env, request);
    if (!user) {
      return jsonResponse({ success: false, message: '未登录', code: 'unauthenticated' }, 401, requestId);
    }

    let body;
    try { body = await request.json(); } catch (e) {
      return errorResponse('请求体不是合法 JSON', 400, 'invalid_json', requestId);
    }

    const err = validateRequest(body);
    if (err) return errorResponse(err, 400, 'invalid_request', requestId);

    const rl = await enforceKeyRateLimit(env, 'game:spin', 'u:' + user.userId, 20, 1);
    if (rl) return rl;

    const out = await executeSpin(env, user, body);
    return jsonResponse(out.body, out.status, requestId);
  } catch (e) {
    console.error('[GameSpin] failed:', e && e.message ? e.message : e);
    return errorResponse('服务器内部错误，请稍后重试。', 500, 'internal_error', requestId);
  }
}

export async function executeSpin(env, user, body) {
  const { spinId, betMinor, mode } = body;

  const existing = await env.apex_db.prepare(
    'SELECT result_json, win_minor, balance_after FROM spins WHERE spin_id = ? AND user_id = ?'
  ).bind(spinId, user.userId).first();

  if (existing) {
    let cached = null;
    try { cached = JSON.parse(existing.result_json); } catch (e) {}
    return { status: 200, body: {
      success: true, cached: true, result: cached,
      winMinor: existing.win_minor, balanceAfter: existing.balance_after
    }};
  }

  const nowIso = new Date().toISOString();
  const fsSession = await env.apex_db.prepare(
    "SELECT id, remaining_spins, total_spins, bet_minor FROM free_spin_sessions WHERE user_id = ? AND status = 'active' AND remaining_spins > 0 AND expires_at > ? ORDER BY id DESC LIMIT 1"
  ).bind(user.userId, nowIso).first();

  const isFreeAuthoritative = fsSession !== null && fsSession !== undefined;
  const effectiveBetMinor = isFreeAuthoritative ? fsSession.bet_minor : betMinor;

  const urow = await env.apex_db.prepare(
    "SELECT wallet_balance FROM users WHERE id = ? AND status = 'active'"
  ).bind(user.userId).first();
  if (!urow) return { status: 403, body: { success: false, message: '用户状态异常', code: 'user_inactive' } };
  const balanceBefore = urow.wallet_balance;

  if (!isFreeAuthoritative && balanceBefore < effectiveBetMinor) {
    return { status: 400, body: {
      success: false, message: '余额不足', code: 'insufficient_balance', balance: balanceBefore
    }};
  }

  const cfg = await loadConfig();
  const engineModules = await loadServerEngine();
  const mp = engineModules.MathProfile;
  const profile = mp.getProfile(mode);
  const weights = mp.buildRngWeights(mode);
  const rng = new engineModules.Rng(weights);
  const engine = new engineModules.GameEngine({ rng, maxTumbleSteps: 20 });

  const spinResult = engine.spin({ mode, betMinor: effectiveBetMinor, spinId });
  const payScale = profile.payScale;
  const winMinor = Math.floor(effectiveBetMinor * spinResult.totalMultiplier * payScale);

  const balanceAfter = isFreeAuthoritative
    ? balanceBefore + winMinor
    : balanceBefore - effectiveBetMinor + winMinor;

  const gameVersion = (cfg.Version && cfg.Version.VERSION && cfg.Version.VERSION.game) || '1.0.0';
  const mathVersion = (cfg.Version && cfg.Version.VERSION && cfg.Version.VERSION.math) || '1.0.0';

  const stmts = [];

  if (!isFreeAuthoritative) {
    stmts.push(
      env.apex_db.prepare(
        'UPDATE users SET wallet_balance = wallet_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wallet_balance >= ?'
      ).bind(effectiveBetMinor, user.userId, effectiveBetMinor)
    );
  }

  if (winMinor > 0) {
    stmts.push(
      env.apex_db.prepare(
        'UPDATE users SET wallet_balance = wallet_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(winMinor, user.userId)
    );
  }

  if (isFreeAuthoritative) {
    stmts.push(
      env.apex_db.prepare(
        "UPDATE free_spin_sessions SET remaining_spins = remaining_spins - 1, total_win_minor = total_win_minor + ?, status = CASE WHEN remaining_spins - 1 <= 0 THEN 'completed' ELSE status END, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active' AND remaining_spins > 0"
      ).bind(winMinor, fsSession.id)
    );
  }

  if (!isFreeAuthoritative && spinResult.bonus && spinResult.bonus.triggered) {
    const fsAwarded = spinResult.bonus.awardedSpins || 10;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    stmts.push(
      env.apex_db.prepare(
        'INSERT INTO free_spin_sessions (user_id, trigger_spin_id, mode, bet_minor, pay_scale, total_spins, remaining_spins, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(user.userId, spinId, mode, effectiveBetMinor, payScale, fsAwarded, fsAwarded, expiresAt)
    );
  }

  stmts.push(
    env.apex_db.prepare(
      'INSERT INTO spins (spin_id, user_id, mode, is_free, free_round_total, bet_minor, win_minor, multiplier_sum, balance_before, balance_after, result_json, game_version, math_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      spinId, user.userId, mode, isFreeAuthoritative ? 1 : 0,
      isFreeAuthoritative && fsSession ? fsSession.total_spins : null,
      effectiveBetMinor, winMinor, 0,
      balanceBefore, balanceAfter,
      JSON.stringify(spinResult),
      gameVersion, mathVersion
    )
  );

  const results = await env.apex_db.batch(stmts);

  if (!isFreeAuthoritative) {
    const debitChanges = results[0] && results[0].meta ? results[0].meta.changes : 0;
    if (debitChanges !== 1) {
      return { status: 400, body: {
        success: false, message: '余额不足或并发冲突', code: 'insufficient_balance', balance: balanceBefore
      }};
    }
  }

  return { status: 200, body: {
    success: true, cached: false, result: spinResult,
    winMinor, balanceBefore, balanceAfter
  }};
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
