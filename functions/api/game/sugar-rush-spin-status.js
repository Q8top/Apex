// S4-1a: spin status query (for real gateway reconnection)
import { jsonResponse, optionsResponse } from '../../_response.js';
import { getCurrentUser } from '../../_auth.js';

export async function onRequestOptions(){ return optionsResponse(); }

export async function onRequestGet({ request, env }){
  const user = await getCurrentUser(env, request);
  if (!user) return jsonResponse({ success: false, code: 'unauthenticated' }, 401);

  const url = new URL(request.url);
  const spinId = url.searchParams.get('spinId');
  if (!spinId || spinId.length < 10 || spinId.length > 64) {
    return jsonResponse({ success: false, code: 'invalid_spin_id' }, 400);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(spinId)) {
    return jsonResponse({ success: false, code: 'spin_id_charset' }, 400);
  }

  const row = await env.apex_db.prepare(
    'SELECT result_json, win_minor, balance_after FROM spins ' +
    'WHERE spin_id = ? AND user_id = ? LIMIT 1'
  ).bind(spinId, user.userId).first();

  if (!row) return jsonResponse({ success: false, code: 'not_found' }, 404);

  let result = null;
  try { result = JSON.parse(row.result_json); } catch(e){}
  return jsonResponse({
    success: true,
    result: result,
    winMinor: row.win_minor,
    balanceAfter: row.balance_after
  });
}
