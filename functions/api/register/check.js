// POST /api/register/check
// 实时检查用户名/邮箱是否可用（无敏感信息，仅返回 available）
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody, sanitize, validateEmail, validateUsername } from '../../_validation.js';
import { enforceIpRateLimit, enforceKeyRateLimit } from '../../_rateLimit.js';
import { writeAudit } from '../../_audit.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  // 枚举防护：单 IP 每分钟最多 10 次，且对同一参数每分钟最多 3 次
  const limited = await enforceIpRateLimit(env, request, 'register-check-ip', 10, 60);
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
    const uLimited = await enforceKeyRateLimit(env, 'register-check-key', `u:${username.toLowerCase()}`, 3, 60);
    if (uLimited) return uLimited;
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
    const eLimited = await enforceKeyRateLimit(env, 'register-check-key', `e:${email}`, 3, 60);
    if (eLimited) return eLimited;
    if (!validateEmail(email)) {
      result.email = { available: false, reason: '格式错误' };
    } else {
      const row = await env.apex_db.prepare(
        'SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1'
      ).bind(email).first();
      result.email = { available: !row };
    }
  }

  // 记录枚举行为（不可用于正常业务）
  writeAudit(env, {
    action: 'register_check',
    metadata: {
      hasUsername: Boolean(username),
      hasEmail: Boolean(email),
      usernameAvailable: result.username ? result.username.available : null,
      emailAvailable: result.email ? result.email.available : null,
    },
  }, request).catch(() => {});

  return jsonResponse({ success: true, ...result }, 200, requestId);
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
