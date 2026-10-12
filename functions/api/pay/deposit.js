// Apex - POST /api/pay/deposit (PSP skeleton)
// Creates a deposit intent. No real PSP wired yet.
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { getCurrentUser } from '../../_auth.js';
import { sha256Hex } from '../../_security.js';

const MIN_DEPOSIT = 100;
const MAX_DEPOSIT = 5000000;
const PROVIDER = 'placeholder';

function genIntentId() {
  var rand = Math.floor(Math.random() * 1e12).toString(36);
  return 'dep-' + Date.now().toString(36) + '-' + rand;
}

function validate(body) {
  if (!body || typeof body !== 'object') return 'body_invalid';
  var amount = body.amountMinor;
  if (!Number.isSafeInteger(amount)) return 'amount_non_integer';
  if (amount < MIN_DEPOSIT) return 'amount_below_min';
  if (amount > MAX_DEPOSIT) return 'amount_above_max';
  return null;
}

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

  var body;
  try { body = await request.json(); } catch (e) {
    return errorResponse('invalid json', 400, 'invalid_json', requestId);
  }
  var invalid = validate(body);
  if (invalid) return errorResponse('invalid amount', 400, invalid, requestId);

  var intentId = genIntentId();
  var fingerprint = await sha256Hex(JSON.stringify(
    ['dep', String(user.userId), intentId, String(body.amountMinor)]
  ));

  // Skeleton. Real money moves only after a verified PSP webhook
  // credits wallet_ledger with change_type='deposit'.
  return jsonResponse({
    success: true,
    intentId: intentId,
    amountMinor: body.amountMinor,
    currency: 'CNY',
    provider: PROVIDER,
    fingerprint: fingerprint,
    status: 'pending',
    message: '\u6b64\u4e3a\u9884\u7559\u63a5\u53e3\uff0c\u672a\u63a5\u5165\u771f\u5b9e\u652f\u4ed8'
  }, 200, requestId);
}
