// Apex · POST /api/game/spin
// 服务端权威 spin（real 模式唯一入口）
// 设计详见 docs/settlement/settlement-transaction-design.md

import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { getCurrentUser } from '../../_auth.js';
import { loadServerEngine } from '../../_game-bridge.js';
import { loadConfig } from '../../_config-bridge.js';
import { enforceKeyRateLimit } from '../../_rateLimit.js';
import { sha256Hex } from '../../_security.js';

const MAX_BET_MINOR = 10000 * 100;
const MIN_BET_MINOR = 1;
const SPIN_ID_MIN = 10;
const SPIN_ID_MAX = 64;
const MAX_RETRIGGERS = 10;
const RETRIGGER_ADD = 10;
const FS_TTL_MS = 24 * 60 * 60 * 1000;

// A-6 BigInt 定点化：10^6 精度
// 赔率（totalMultiplier）和 payScale 都是"带 6 位小数的十进制数"，
// 乘以 1e6 后都是整数，无精度损失。
// 派彩计算 = floor(bet * totalMult * payScale)，避免浮点误差少派 1 分。
const PRECISION_SCALE = 1000000;
const PRECISION_SCALE_BIG = 1000000n;
const PRECISION_DIVISOR = 1000000000000n; // 1e6 * 1e6

function toFixedBig(x) {
  if (!Number.isFinite(x) || x < 0) {
    throw new Error('toFixedBig: invalid input');
  }
  var scaled = Math.round(x * PRECISION_SCALE);
  if (!Number.isSafeInteger(scaled)) {
    throw new Error('toFixedBig: out of safe integer range');
  }
  return BigInt(scaled);
}

function calcWinMinorFixed(betMinor, totalMultiplier, payScale) {
  if (!Number.isSafeInteger(betMinor) || betMinor < 0) {
    throw new Error('calcWinMinorFixed: betMinor invalid');
  }
  var totalFixed = toFixedBig(totalMultiplier);
  var payScaleFixed = toFixedBig(payScale);
  var product = BigInt(betMinor) * totalFixed * payScaleFixed;
  var minor = product / PRECISION_DIVISOR; // 向下取整（保守）
  return Number(minor);
}

function validateRequest(body) {
  if (!body || typeof body !== 'object') return 'body_invalid';
  const { spinId, betMinor, mode } = body;
  if (typeof spinId !== 'string' || spinId.length < SPIN_ID_MIN || spinId.length > SPIN_ID_MAX)
    return 'spinId_invalid';
  if (!/^[a-zA-Z0-9_-]+$/.test(spinId)) return 'spinId_charset';
  if (!Number.isSafeInteger(betMinor)) return 'bet_non_integer';
  if (betMinor < MIN_BET_MINOR) return 'bet_below_min';
  if (betMinor > MAX_BET_MINOR) return 'bet_above_max';
  if (mode !== 'real') return 'mode_not_allowed';
  return null;
}

async function computeRequestFingerprint(input) {
  if (!Number.isSafeInteger(input.betMinor) || input.betMinor < 1) {
    throw new Error('fingerprint: betMinor must be positive safe integer');
  }
  if (typeof input.userId !== 'number' || typeof input.spinId !== 'string') {
    throw new Error('fingerprint: userId/spinId invalid');
  }
  const canonical = JSON.stringify([
    'v1',
    String(input.userId),
    String(input.spinId),
    'sweet',
    input.betMinor.toString(10),
  ]);
  return await sha256Hex(canonical);
}

function classifyError(e) {
  const msg = String(e && e.message ? e.message : '');
  if (msg.indexOf('insufficient_balance') >= 0) return 'insufficient_balance';
  if (msg.indexOf('spins.spin_id') >= 0) return 'idempotent_conflict';
  if (msg.indexOf('idx_chain_base_spin') >= 0) return 'chain_conflict';
  if (msg.indexOf('CHECK constraint failed') >= 0) return 'guard_failed';
  if (msg.indexOf('UNIQUE constraint failed') >= 0) return 'unique_conflict';
  return 'unknown';
}

function genEventId(prefix) {
  const rnd = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return prefix + '-' + Date.now().toString(36) + '-' + rnd;
}

function guardStmt(env) {
  return env.apex_db.prepare(
    "INSERT INTO _settlement_guard (slot, guard_value) " +
    "VALUES (1, CASE WHEN changes() = 1 THEN 1 ELSE 0 END) " +
    "ON CONFLICT(slot) DO UPDATE " +
    "SET guard_value = CASE WHEN changes() = 1 THEN 1 ELSE 0 END"
  );
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  try {
    const user = await getCurrentUser(env, request);
    if (!user) {
      return jsonResponse({ success: false, message: '未登录', code: 'unauthenticated' }, 401, requestId);
    }
    if (user.status === 'self_excluded') {
      return jsonResponse({ success: false, message: '账号已自我排除', code: 'self_excluded' }, 403, requestId);
    }
    if (user.status && user.status !== 'active') {
      return jsonResponse({ success: false, message: '账号已禁用', code: 'account_disabled' }, 403, requestId);
    }

    let body;
    try { body = await request.json(); } catch (e) {
      return errorResponse('请求体不是合法 JSON', 400, 'invalid_json', requestId);
    }

    const err = validateRequest(body);
    if (err) {
      const code = (err === 'mode_not_allowed') ? 'mode_not_allowed' : 'invalid_request';
      return errorResponse(err, 400, code, requestId);
    }

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
  const { spinId, betMinor } = body;
  const mode = 'real';
  const userId = user.userId;

  const fingerprint = await computeRequestFingerprint({ userId, spinId, betMinor });

  const existing = await env.apex_db.prepare(
    'SELECT result_json, win_minor, balance_after, request_fingerprint FROM spins WHERE spin_id = ? AND user_id = ?'
  ).bind(spinId, userId).first();

  if (existing) {
    if (existing.request_fingerprint && existing.request_fingerprint !== fingerprint) {
      return { status: 409, body: { success: false, code: 'idempotency_conflict' } };
    }
    let cached = null;
    try { cached = JSON.parse(existing.result_json); } catch (e) {}
    return {
      status: 200,
      body: {
        success: true,
        cached: true,
        result: cached,
        winMinor: existing.win_minor,
        balanceAfter: existing.balance_after
      }
    };
  }

  const taken = await env.apex_db.prepare(
    'SELECT user_id FROM spins WHERE spin_id = ?'
  ).bind(spinId).first();
  if (taken && taken.user_id !== userId) {
    return { status: 409, body: { success: false, code: 'spin_id_taken' } };
  }

  const nowIso = new Date().toISOString();
  const fsSession = await env.apex_db.prepare(
    "SELECT id, remaining_spins, total_spins, bet_minor, version, retrigger_count, chain_id, chain_win_minor " +
    "FROM free_spin_sessions " +
    "WHERE user_id = ? AND status = 'active' AND remaining_spins > 0 AND expires_at > ? " +
    "ORDER BY id DESC LIMIT 1"
  ).bind(userId, nowIso).first();

  const isFree = fsSession != null;
  const effectiveBetMinor = isFree ? fsSession.bet_minor : betMinor;

  const urow = await env.apex_db.prepare(
    "SELECT wallet_balance FROM users WHERE id = ? AND status = 'active'"
  ).bind(userId).first();
  if (!urow) {
    return { status: 403, body: { success: false, code: 'user_inactive' } };
  }
  const balanceBefore = urow.wallet_balance;

  if (!isFree && balanceBefore < effectiveBetMinor) {
    return {
      status: 400,
      body: { success: false, code: 'insufficient_balance', balance: balanceBefore }
    };
  }

  const cfg = await loadConfig();
  const engineModules = await loadServerEngine();
  const mp = engineModules.MathProfile;
  const profile = mp.getProfile(mode);
  const weights = mp.buildRngWeights(mode);
  const rng = new engineModules.Rng(weights);
  const engine = new engineModules.GameEngine({ rng, maxTumbleSteps: 20 });

  let spinResult;
  try {
    spinResult = engine.spin({ mode, betMinor: effectiveBetMinor, spinId });
  } catch (e) {
    return { status: 500, body: { success: false, code: 'engine_error' } };
  }

  const payScale = profile.payScale;
  // A-6 BigInt 定点计算（避免浮点少派 1 分）
  const theoreticalWinMinor = calcWinMinorFixed(
    effectiveBetMinor,
    spinResult.totalMultiplier,
    payScale
  );

  let actualWinMinor = theoreticalWinMinor;
  let chainId = null;
  let newChainWinMinor = null;

  if (isFree && fsSession.chain_id) {
    chainId = fsSession.chain_id;
    const chainRow = await env.apex_db.prepare(
      "SELECT max_win_multiplier, chain_win_minor, cap_reached, status " +
      "FROM reward_chains WHERE chain_id = ?"
    ).bind(chainId).first();
    if (chainRow) {
      const capMinor = effectiveBetMinor * chainRow.max_win_multiplier;
      const remaining = Math.max(0, capMinor - chainRow.chain_win_minor);
      if (theoreticalWinMinor > remaining) {
        actualWinMinor = remaining;
      }
      newChainWinMinor = chainRow.chain_win_minor + actualWinMinor;
    }
  }

  const balanceAfter = isFree
    ? balanceBefore + actualWinMinor
    : balanceBefore - effectiveBetMinor + actualWinMinor;

  const gameVersion = (cfg.Version && cfg.Version.VERSION && cfg.Version.VERSION.game) || '1.0.0';
  const mathVersion = (cfg.Version && cfg.Version.VERSION && cfg.Version.VERSION.math) || '1.0.0';

  const stmts = [];

  if (!isFree) {
    stmts.push(env.apex_db.prepare(
      'UPDATE users SET wallet_balance = wallet_balance - ?, updated_at = CURRENT_TIMESTAMP ' +
      'WHERE id = ? AND wallet_balance >= ?'
    ).bind(effectiveBetMinor, userId, effectiveBetMinor));
    stmts.push(guardStmt(env));
    stmts.push(env.apex_db.prepare(
      "INSERT INTO wallet_ledger (event_id, user_id, spin_id, delta, change_type, math_version) " +
      "VALUES (?, ?, ?, ?, 'bet', ?)"
    ).bind(genEventId('bet'), userId, spinId, -effectiveBetMinor, mathVersion));
  }

  if (actualWinMinor > 0) {
    stmts.push(env.apex_db.prepare(
      'UPDATE users SET wallet_balance = wallet_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(actualWinMinor, userId));
    stmts.push(guardStmt(env));
    stmts.push(env.apex_db.prepare(
      "INSERT INTO wallet_ledger (event_id, user_id, spin_id, delta, change_type, math_version) " +
      "VALUES (?, ?, ?, ?, 'win', ?)"
    ).bind(genEventId('win'), userId, spinId, actualWinMinor, mathVersion));
  }

  if (isFree) {
    const retriggerAwarded = spinResult.bonus && spinResult.bonus.triggered &&
      fsSession.retrigger_count < MAX_RETRIGGERS;
    const retriggerAdd = retriggerAwarded ? RETRIGGER_ADD : 0;
    const retriggerInc = retriggerAwarded ? 1 : 0;
    stmts.push(env.apex_db.prepare(
      "UPDATE free_spin_sessions " +
      "SET remaining_spins = remaining_spins - 1 + ?, " +
      "    retrigger_count = retrigger_count + ?, " +
      "    total_win_minor = total_win_minor + ?, " +
      "    chain_win_minor = chain_win_minor + ?, " +
      "    status = CASE WHEN remaining_spins - 1 + ? <= 0 THEN 'completed' ELSE status END, " +
      "    version = version + 1, updated_at = CURRENT_TIMESTAMP " +
      "WHERE id = ? AND status = 'active' AND remaining_spins > 0 " +
      "  AND expires_at > ? AND version = ?"
    ).bind(retriggerAdd, retriggerInc, actualWinMinor, actualWinMinor, retriggerAdd,
           fsSession.id, nowIso, fsSession.version));
    stmts.push(guardStmt(env));
    if (newChainWinMinor !== null) {
      stmts.push(env.apex_db.prepare(
        "UPDATE reward_chains " +
        "SET chain_win_minor = ?, " +
        "    cap_reached = CASE WHEN ? >= effective_bet_minor * max_win_multiplier THEN 1 ELSE cap_reached END, " +
        "    updated_at = CURRENT_TIMESTAMP " +
        "WHERE chain_id = ?"
      ).bind(newChainWinMinor, newChainWinMinor, chainId));
    }
  }

  let newChainId = null;
  if (!isFree && spinResult.bonus && spinResult.bonus.triggered) {
    newChainId = 'ch-' + spinId.slice(0, 20);
    const fsAwarded = spinResult.bonus.awardedSpins || 10;
    const maxWinMult = (profile.maxWinMultiplier != null) ? profile.maxWinMultiplier : 5000;
    const expiresAt = new Date(Date.now() + FS_TTL_MS).toISOString();
    stmts.push(env.apex_db.prepare(
      "INSERT INTO reward_chains " +
      "(chain_id, user_id, base_spin_id, effective_bet_minor, max_win_multiplier, chain_win_minor, math_version) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(newChainId, userId, spinId, effectiveBetMinor, maxWinMult, actualWinMinor, mathVersion));
    stmts.push(env.apex_db.prepare(
      "INSERT INTO free_spin_sessions " +
      "(user_id, trigger_spin_id, chain_id, mode, bet_minor, pay_scale, " +
      " total_spins, remaining_spins, chain_win_minor, expires_at) " +
      "VALUES (?, ?, ?, 'real', ?, ?, ?, ?, ?, ?)"
    ).bind(userId, spinId, newChainId, effectiveBetMinor, payScale,
           fsAwarded, fsAwarded, actualWinMinor, expiresAt));
  }

  const balanceDelta = isFree ? actualWinMinor : (actualWinMinor - effectiveBetMinor);
  stmts.push(env.apex_db.prepare(
    "INSERT INTO spins " +
    "(spin_id, user_id, request_fingerprint, mode, is_free, free_round_total, " +
    " bet_minor, win_minor, effective_bet_minor, fs_session_id, chain_id, " +
    " balance_before, balance_after, balance_delta, result_json, game_version, math_version) " +
    "VALUES (?, ?, ?, 'real', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    spinId, userId, fingerprint, isFree ? 1 : 0,
    isFree ? fsSession.total_spins : null,
    effectiveBetMinor, actualWinMinor, effectiveBetMinor,
    isFree ? fsSession.id : null, isFree ? fsSession.chain_id : newChainId,
    balanceBefore, balanceAfter, balanceDelta,
    JSON.stringify(spinResult), gameVersion, mathVersion
  ));

  try {
    await env.apex_db.batch(stmts);
  } catch (e) {
    const reason = classifyError(e);
    if (reason === 'insufficient_balance' || reason === 'guard_failed') {
      return {
        status: 400,
        body: { success: false, code: 'insufficient_balance', balance: balanceBefore }
      };
    }
    if (reason === 'idempotent_conflict') {
      const retry = await env.apex_db.prepare(
        "SELECT result_json, win_minor, balance_after FROM spins WHERE spin_id = ? AND user_id = ?"
      ).bind(spinId, userId).first();
      if (retry) {
        let cached = null;
        try { cached = JSON.parse(retry.result_json); } catch (err) {}
        return {
          status: 200,
          body: {
            success: true, cached: true, result: cached,
            winMinor: retry.win_minor, balanceAfter: retry.balance_after
          }
        };
      }
      return { status: 500, body: { success: false, code: 'settlement_retry' } };
    }
    if (reason === 'chain_conflict') {
      return { status: 409, body: { success: false, code: 'chain_conflict' } };
    }
    console.error('[executeSpin] batch failed:', reason, e && e.message);
    return { status: 500, body: { success: false, code: 'internal_error' } };
  }

  return {
    status: 200,
    body: {
      success: true,
      cached: false,
      result: spinResult,
      winMinor: actualWinMinor,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter
    }
  };
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
