// Apex POST /api/wallet/deposit (P3-1 stub)
//
// R4: real money framework is in place, payment channel NOT wired yet.
// This endpoint always returns 501 not_implemented. Frontend real-mode
// deposit button already shows 'coming soon' toast; this stub exists so
// the API contract is stable when a payment provider is integrated.
//
// When wiring a real provider, replace the body with:
//   1. auth check (getCurrentUser)
//   2. amount validation (MIN/MAX minor units)
//   3. CSRF (enforced by middleware)
//   4. create payment_intent row + return provider redirect URL
//   5. webhook handler (separate file) credits wallet_ledger on confirm

import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';

export async function onRequestPost(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return jsonResponse(
    { success: false, code: 'not_implemented', message: '支付通道正在建设中' },
    501,
    requestId
  );
}

export async function onRequestGet(context) {
  return onRequestPost(context);
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
