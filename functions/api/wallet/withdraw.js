// Apex POST /api/wallet/withdraw (P3-1 stub)
//
// R4: real money framework is in place, payment channel NOT wired yet.
// This endpoint always returns 501 not_implemented.
//
// When wiring a real provider, replace the body with:
//   1. auth check + status check (not disabled/excluded)
//   2. amount validation (MIN/MAX, balance sufficiency)
//   3. CSRF (middleware)
//   4. AML/KYC gate (if jurisdiction requires)
//   5. create withdrawal_request row + reserve funds in wallet_ledger
//   6. provider transfer + webhook

import { jsonResponse, optionsResponse } from '../../_response.js';

export async function onRequestPost(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return jsonResponse(
    { success: false, code: 'not_implemented', message: '提现通道正在建设中' },
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
