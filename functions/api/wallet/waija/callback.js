// POST /api/wallet/waija/callback
//
// Universal callback endpoint for Waija game aggregation.
// Waija POSTs game events here (bet / win / rollback / balance).
//
// While the exact Waija callback schema is being confirmed, this
// endpoint accepts any JSON payload, logs it to the audit trail,
// and returns a generic success shape. Once the real schema is
// verified (from the Waija dashboard or a live sandbox hit), this
// handler will be replaced with a strict implementation.
//
// Responds 200 with { balance } so Waija can continue. Never throws
// on unknown fields (Waija docs say: ignore unknown fields).
import { jsonResponse, optionsResponse } from '../../../_response.js';

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  let body = null;
  try { body = await request.json(); } catch (e) {}

  // Diagnostic: log incoming shape so we can reverse-engineer the schema.
  try {
    console.log('[waija/callback] ' + JSON.stringify({
      requestId: requestId,
      keys: body && typeof body === 'object' ? Object.keys(body) : null,
      body: body
    }).slice(0, 4000));
  } catch (e) {}

  // Extract a plausible player id and balance for the response.
  const playerId = (body && (body.player_id || body.playerId || body.user_id || body.userId)) || null;
  let balance = '0.00';
  if (playerId && env && env.apex_db) {
    try {
      const row = await env.apex_db.prepare(
        "SELECT wallet_balance FROM users WHERE id = ? LIMIT 1"
      ).bind(playerId).first();
      if (row && row.wallet_balance != null) {
        balance = String(row.wallet_balance);
      }
    } catch (e) {}
  }

  return jsonResponse({
    success: true,
    balance: balance,
    requestId: requestId
  }, 200, requestId);
}
