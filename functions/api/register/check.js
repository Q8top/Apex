// POST /api/register/check
// 实时检查用户名/邮箱是否可用（无敏感信息，仅返回 available）
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody, sanitize, validateEmail, validateUsername } from '../../_validation.js';
import { enforceIpRateLimit } from '../../_rateLimit.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  const limited = await enforceIpRateLimit(env, request, 'register-check-ip', 60, 60);
  if (limited) return limited;

  const parsed = await parseJsonBody(request, 2048);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const body = parsed.data || {};
  const username = sanitize(body.username, 32);
  const email = sanitize(body.email, 200).toLowerCase();

  if (!username && !email) {
    return errorResponse('缺少参数', 400, 'missing_params', requestId);
  }

  const result = {};

  if (username) {
    if (!validateUsername(username)) {
      result.username = { available: false, reason: '格式错误' };
    } else {
      const row = await env.apex_db.prepare(
        'SELECT id FROM users WHERE username = ? LIMIT 1'
      ).bind(username).first();
      result.username = { available: !row };
    }
  }

  if (email) {
    if (!validateEmail(email)) {
      result.email = { available: false, reason: '格式错误' };
    } else {
      const row = await env.apex_db.prepare(
        'SELECT id FROM users WHERE email = ? LIMIT 1'
      ).bind(email).first();
      result.email = { available: !row };
    }
  }

  return jsonResponse({ success: true, ...result }, 200, requestId);
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
