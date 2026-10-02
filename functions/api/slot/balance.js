// GET /api/slot/balance
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { getCurrentUser } from '../../_auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  const user = await getCurrentUser(env, request);
  if (!user) return errorResponse('请先登录', 401, 'unauthenticated', requestId);
  return jsonResponse({ success: true, balance: user.walletBalance }, 200, requestId);
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
