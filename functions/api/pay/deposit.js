// Apex - POST /api/pay/deposit (PSP skeleton, disabled)
// Real money is OFF. Always returns 501 not_implemented.
// C4 (2.C.4): previously returned 200 with fake intentId.
import { jsonResponse, optionsResponse } from '../../_response.js';

function disabled() {
  return jsonResponse(
    { success: false, code: 'not_implemented', message: 'payment_channel_under_construction' },
    501,
    ''
  );
}

export async function onRequestOptions(context) {
  var requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}

export async function onRequestPost() { return disabled(); }
export async function onRequestGet()  { return disabled(); }
