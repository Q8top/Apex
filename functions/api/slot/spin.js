// POST /api/slot/spin
// 服务端权威结算：客户端只发 { bet }，服务端跑数学引擎
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody } from '../../_validation.js';
import { getCurrentUser } from '../../_auth.js';
import { enforceIpRateLimit } from '../../_rateLimit.js';
import { writeAudit } from '../../_audit.js';
import { RNG } from '../../_math/olympus/rng.js';
import { spin } from '../../_math/olympus/engine.js';

const MIN_BET = 1;
const MAX_BET = 10000;

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  const _rl = await enforceIpRateLimit(env, request, 'slot-spin', 120, 60);
  if (_rl) return _rl;

  const user = await getCurrentUser(env, request);
  if (!user) return errorResponse('请先登录', 401, 'unauthenticated', requestId);

  const parsed = await parseJsonBody(request, 2048);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const body = parsed.data || {};
  const bet = Number(body.bet);

  if (!Number.isInteger(bet) || bet < MIN_BET || bet > MAX_BET) {
    return errorResponse('无效下注', 400, 'invalid_bet', requestId);
  }

  // 服务端权威：生成 RNG + 跑数学引擎
  let result;
  try {
    const rng = new RNG();
    result = spin(rng, bet, 'real');
  } catch (e) {
    console.error('[slot/spin] math failed:', e && e.message ? e.message : e);
    return errorResponse('生成结果失败', 500, 'math_error', requestId);
  }

  // 安全清洗：移除 seed / mathVersion / scale 等机密字段
  const safeResult = {
    initialGrid: result.initialGrid,
    tumbles: result.tumbles,
    tumbleCount: result.tumbleCount,
    totalWin: result.totalWin,
    capped: result.capped,
  };

  // D1 原子扣注 + 加奖（余额不足时整行不更新）
  try {
    const row = await env.apex_db.prepare(
      `UPDATE users SET wallet_balance = wallet_balance - ? + ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND wallet_balance >= ?
       RETURNING wallet_balance`
    ).bind(bet, result.totalWin, user.userId, bet).first();

    if (!row) {
      await writeAudit(env, {
        action: 'slot_spin_insufficient',
        actorId: user.userId,
        actorType: 'user',
        metadata: { bet },
      }, request);
      return errorResponse('余额不足', 402, 'insufficient_balance', requestId);
    }

    // 注意：audit 不写 seed（可反推后续结果）
    await writeAudit(env, {
      action: 'slot_spin',
      actorId: user.userId,
      actorType: 'user',
      metadata: { bet, totalWin: result.totalWin, tumbles: result.tumbleCount },
    }, request);

    return jsonResponse({
      success: true,
      balanceAfter: Number(row.wallet_balance),
      bet,
      totalWin: result.totalWin,
      mode: 'real',
      result: safeResult,
    }, 200, requestId);
  } catch (e) {
    console.error('[slot/spin] failed:', e && e.message ? e.message : e);
    return errorResponse('结算失败，请稍后重试', 500, 'internal_error', requestId);
  }
}

export async function onRequestOptions() {
  return optionsResponse('');
}
