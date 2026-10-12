// S2.2: 游戏状态查询端点（用于断线恢复 / pageshow 恢复）
// GET /api/game/state?game=sweet
// 返回：{ success, fs: { sessionId, remaining, total, chainId, marks } | null }
import { jsonResponse, optionsResponse } from '../../_response.js';
import { getCurrentUser } from '../../_auth.js';

export async function onRequestOptions(){ return optionsResponse(); }

export async function onRequestGet({ request, env }){
  const user = await getCurrentUser(env, request);
  if (!user) return jsonResponse({ success: false, code: 'unauthenticated' }, 401);

  const url = new URL(request.url);
  const gameId = url.searchParams.get('game') || 'sweet';
  if (!/^[a-z0-9-]{3,32}$/.test(gameId)){
    return jsonResponse({ success: false, code: 'invalid_game' }, 400);
  }

  const nowIso = new Date().toISOString();
  let walletBalance = null;
  try {
    const u = await env.apex_db.prepare(
      'SELECT wallet_balance FROM users WHERE id = ? LIMIT 1'
    ).bind(user.userId).first();
    if (u) walletBalance = u.wallet_balance;
  } catch (e) {}
  let row = null;
  try {
    row = await env.apex_db.prepare(
      'SELECT id, remaining_spins, total_spins, chain_id, marks_json ' +
      'FROM free_spin_sessions ' +
      'WHERE user_id = ? AND game_id = ? AND status = \'active\' ' +
      '  AND remaining_spins > 0 AND expires_at > ? ' +
      'ORDER BY id DESC LIMIT 1'
    ).bind(user.userId, gameId, nowIso).first();
  } catch (e) {
    return jsonResponse({ success: false, code: 'db_error' }, 500);
  }

  let marks = null;
  if (row && row.marks_json){
    try { marks = JSON.parse(row.marks_json); } catch (e) { marks = null; }
  }

  return jsonResponse({
    success: true,
    balance: walletBalance,
    fs: row ? {
      sessionId: row.id,
      remaining: row.remaining_spins,
      total: row.total_spins,
      chainId: row.chain_id,
      marks: marks
    } : null
  });
}
