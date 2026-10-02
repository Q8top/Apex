// POST /api/slot/spin
// 服务端扣下注 + 加中奖（娱乐阶段信任前端结果，未来真上线需服务端 RNG）
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody } from '../../_validation.js';
import { getCurrentUser } from '../../_auth.js';
import { enforceIpRateLimit } from '../../_rateLimit.js';
import { writeAudit } from '../../_audit.js';

const MAX_BET = 10000;
const MAX_WIN = 1000000;

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  const _rl = await enforceIpRateLimit(env, request, 'slot-spin', 120, 60);
  if (_rl) return _rl;

  const user = await getCurrentUser(env, request);
  if (!user) return errorResponse('请先登录', 401, 'unauthenticated', requestId);

  const parsed = await parseJsonBody(request, 8192);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const body = parsed.data || {};
  const bet = Number(body.bet);
  const totalWin = Number(body.totalWin);

  if (!Number.isFinite(bet) || bet <= 0 || bet > MAX_BET) return errorResponse('无效下注', 400, 'invalid_bet', requestId);
  if (!Number.isFinite(totalWin) || totalWin < 0 || totalWin > MAX_WIN) return errorResponse('无效中奖金额', 400, 'invalid_win', requestId);

  try {
    const row = await env.apex_db.prepare(
      `UPDATE users SET wallet_balance = wallet_balance - ? + ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND wallet_balance >= ?
       RETURNING wallet_balance`
    ).bind(bet, totalWin, user.userId, bet).first();

    if (!row) {
      await writeAudit(env, { action: 'slot_spin_insufficient', actorId: user.userId, actorType: 'user', metadata: { bet } }, request);
      return errorResponse('余额不足', 402, 'insufficient_balance', requestId);
    }

    await writeAudit(env, { action: 'slot_spin', actorId: user.userId, actorType: 'user', metadata: { bet, totalWin } }, request);
    return jsonResponse({ success: true, balanceAfter: Number(row.wallet_balance), bet, totalWin }, 200, requestId);
  } catch (e) {
    console.error('[slot/spin] failed:', e && e.message ? e.message : e);
    return errorResponse('结算失败，请稍后重试', 500, 'internal_error', requestId);
  }
}

export async function onRequestOptions(context) {
  return optionsResponse('');
}
