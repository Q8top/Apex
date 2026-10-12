// Apex - POST /api/game/buy-fs
// Server-authoritative buy free spins (real mode only)
// Cost = BUY_FS_COST_MULT x betMinor, awards BUY_FS_AWARD spins
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { getCurrentUser } from '../../_auth.js';
import { loadConfig } from '../../_config-bridge.js';
import { enforceKeyRateLimit } from '../../_rateLimit.js';
import { sha256Hex } from '../../_security.js';

const MIN_BET_MINOR = 1;
const MAX_BET_MINOR = 10000 * 100;
const SPIN_ID_MIN = 10;
const SPIN_ID_MAX = 64;
const BUY_FS_COST_MULT = 100;
const BUY_FS_AWARD = 10;
const FS_TTL_MS = 24 * 60 * 60 * 1000;

function genEventId(prefix) {
  var rand = Math.floor(Math.random() * 1e12).toString(36);
  return prefix + '-' + Date.now().toString(36) + '-' + rand;
}

function guardStmt(env) {
  return env.apex_db.prepare("SELECT CASE WHEN changes() = 1 THEN 1 ELSE 0 END AS ok");
}

function classifyError(e) {
  var m = (e && e.message) ? String(e.message) : '';
  if (m.indexOf('insufficient_balance') !== -1) return 'insufficient_balance';
  if (m.indexOf('guard_failed') !== -1) return 'guard_failed';
  if (m.indexOf('UNIQUE') !== -1 && m.indexOf('spin_id') !== -1) return 'idempotent_conflict';
  return 'unknown';
}

function validate(body) {
  if (!body || typeof body !== 'object') return 'body_invalid';
  var spinId = body.spinId, betMinor = body.betMinor, mode = body.mode;
  if (typeof spinId !== 'string' || spinId.length < SPIN_ID_MIN || spinId.length > SPIN_ID_MAX) return 'spinId_invalid';
  if (!/^[a-zA-Z0-9_-]+$/.test(spinId)) return 'spinId_charset';
  if (!Number.isSafeInteger(betMinor)) return 'bet_non_integer';
  if (betMinor < MIN_BET_MINOR) return 'bet_below_min';
  if (betMinor > MAX_BET_MINOR) return 'bet_above_max';
  if (mode !== 'real') return 'mode_not_allowed';
  return null;
}

async function executeBuy(env, userId, spinId, betMinor) {
  var nowIso = new Date().toISOString();
  var costMinor = betMinor * BUY_FS_COST_MULT;
  if (!Number.isSafeInteger(costMinor) || costMinor < 0) {
    return { status: 500, body: { success: false, code: 'cost_out_of_safe_range' } };
  }

  var prior = await env.apex_db.prepare(
    "SELECT id FROM spins WHERE spin_id = ? AND user_id = ? LIMIT 1"
  ).bind(spinId, userId).first();
  if (prior) {
    var fsRow0 = await env.apex_db.prepare(
      "SELECT id, remaining_spins, total_spins, chain_id FROM free_spin_sessions " +
      "WHERE trigger_spin_id = ? AND user_id = ? LIMIT 1"
    ).bind(spinId, userId).first();
    if (fsRow0) {
      return { status: 200, body: { success: true, cached: true,
        sessionId: fsRow0.id, remaining: fsRow0.remaining_spins,
        totalSpins: fsRow0.total_spins, chainId: fsRow0.chain_id } };
    }
    return { status: 409, body: { success: false, code: 'idempotent_conflict' } };
  }

  var urow = await env.apex_db.prepare(
    "SELECT wallet_balance FROM users WHERE id = ? AND status = 'active'"
  ).bind(userId).first();
  if (!urow) return { status: 403, body: { success: false, code: 'user_inactive' } };
  var balanceBefore = urow.wallet_balance;
  if (balanceBefore < costMinor) {
    return { status: 400, body: { success: false, code: 'insufficient_balance', balance: balanceBefore } };
  }

  var cfg = await loadConfig();
  var mathVersion = (cfg.Version && cfg.Version.VERSION && cfg.Version.VERSION.math) || '1.0.0';
  var gameVersion = (cfg.Version && cfg.Version.VERSION && cfg.Version.VERSION.game) || '1.0.0';
  var fingerprint = await sha256Hex(JSON.stringify(['v1-buyfs', String(userId), String(spinId), 'sweet', String(betMinor)]));

  var chainId = 'ch-buyfs-' + spinId.slice(0, 20);
  var expiresAt = new Date(Date.now() + FS_TTL_MS).toISOString();
  var balanceAfter = balanceBefore - costMinor;

  var stmts = [];
  stmts.push(env.apex_db.prepare(
    'UPDATE users SET wallet_balance = wallet_balance - ?, updated_at = CURRENT_TIMESTAMP ' +
    'WHERE id = ? AND wallet_balance >= ?'
  ).bind(costMinor, userId, costMinor));
  stmts.push(guardStmt(env));
  stmts.push(env.apex_db.prepare(
    "INSERT INTO wallet_ledger (event_id, user_id, spin_id, delta, change_type, math_version) " +
    "VALUES (?, ?, ?, ?, 'buy_fs', ?)"
  ).bind(genEventId('buyfs'), userId, spinId, -costMinor, mathVersion));

  stmts.push(env.apex_db.prepare(
    "INSERT INTO spins " +
    "(spin_id, user_id, request_fingerprint, mode, is_free, free_round_total, " +
    " bet_minor, win_minor, effective_bet_minor, fs_session_id, chain_id, " +
    " balance_before, balance_after, balance_delta, result_json, game_version, math_version, " +
    " max_win_applied, capped_this_spin) " +
    "VALUES (?, ?, ?, 'real', 0, ?, ?, 0, ?, NULL, ?, ?, ?, ?, ?, ?, ?, 0, 0)"
  ).bind(
    spinId, userId, fingerprint, BUY_FS_AWARD,
    betMinor, betMinor, chainId,
    balanceBefore, balanceAfter, -costMinor,
    JSON.stringify({ kind: 'buy_fs', costMinor: costMinor, award: BUY_FS_AWARD }),
    gameVersion, mathVersion
  ));

  stmts.push(env.apex_db.prepare(
    "INSERT INTO reward_chains " +
    "(chain_id, user_id, base_spin_id, effective_bet_minor, max_win_multiplier, chain_win_minor, math_version) " +
    "VALUES (?, ?, ?, ?, ?, 0, ?)"
  ).bind(chainId, userId, spinId, betMinor, 5000, mathVersion));

  stmts.push(env.apex_db.prepare(
    "INSERT INTO free_spin_sessions " +
    "(user_id, trigger_spin_id, chain_id, mode, bet_minor, pay_scale, " +
    " total_spins, remaining_spins, chain_win_minor, expires_at) " +
    "VALUES (?, ?, ?, 'real', ?, ?, ?, ?, 0, ?)"
  ).bind(userId, spinId, chainId, betMinor, 1.0, BUY_FS_AWARD, BUY_FS_AWARD, expiresAt));

  try {
    await env.apex_db.batch(stmts);
  } catch (e) {
    var reason = classifyError(e);
    if (reason === 'insufficient_balance' || reason === 'guard_failed') {
      return { status: 400, body: { success: false, code: 'insufficient_balance', balance: balanceBefore } };
    }
    if (reason === 'idempotent_conflict') {
      var r2 = await env.apex_db.prepare(
        "SELECT id, remaining_spins, total_spins, chain_id FROM free_spin_sessions " +
        "WHERE trigger_spin_id = ? AND user_id = ? LIMIT 1"
      ).bind(spinId, userId).first();
      if (r2) return { status: 200, body: { success: true, cached: true,
        sessionId: r2.id, remaining: r2.remaining_spins, totalSpins: r2.total_spins, chainId: r2.chain_id } };
      return { status: 500, body: { success: false, code: 'settlement_retry' } };
    }
    return { status: 500, body: { success: false, code: 'internal_error' } };
  }

  var after = await env.apex_db.prepare(
    "SELECT id, remaining_spins, total_spins, chain_id FROM free_spin_sessions " +
    "WHERE trigger_spin_id = ? AND user_id = ? LIMIT 1"
  ).bind(spinId, userId).first();

  return {
    status: 200,
    body: { success: true, cached: false, costMinor: costMinor,
      balanceBefore: balanceBefore, balanceAfter: balanceAfter,
      sessionId: after ? after.id : null,
      remaining: after ? after.remaining_spins : BUY_FS_AWARD,
      totalSpins: after ? after.total_spins : BUY_FS_AWARD,
      chainId: after ? after.chain_id : chainId }
  };
}

export { executeBuy };

export async function onRequestOptions(context) {
  var requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;
  var requestId = context.data && context.data.requestId ? context.data.requestId : '';

  var user = await getCurrentUser(env, request);
  if (!user || !user.userId) {
    return jsonResponse({ success: false, message: '\u672a\u767b\u5f55', code: 'unauthenticated' }, 401, requestId);
  }

  var rl = await enforceKeyRateLimit(env, 'game:buy-fs', 'u:' + user.userId, 20, 1);
  if (rl) return rl;

  var body;
  try { body = await request.json(); } catch (e) {
    return errorResponse('\u8bf7\u6c42\u4f53\u4e0d\u662f\u5408\u6cd5 JSON', 400, 'invalid_json', requestId);
  }

  var invalid = validate(body);
  if (invalid) return errorResponse('invalid request', 400, invalid, requestId);

  try {
    var out = await executeBuy(env, user.userId, body.spinId, body.betMinor);
    return jsonResponse(out.body, out.status, requestId);
  } catch (e) {
    console.error('[buy-fs] failed:', e && e.message);
    return errorResponse('\u670d\u52a1\u5668\u5185\u90e8\u9519\u8bef\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002', 500, 'internal_error', requestId);
  }
}
