// POST /api/passkey/signup-challenge
// 无密码注册第一步：输入 username + email + captchaToken
// 返回 challengeId + publicKey（用于 navigator.credentials.create）
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody, sanitize, validateEmail, validateUsername } from '../../_validation.js';
import { storeChallenge } from '../../_passkey.js';
import { getConfig } from '../../_config.js';
import { enforceIpRateLimit } from '../../_rateLimit.js';
import { verifyCaptchaTokenV2 } from '../../_utils.js';
import { getClientIP } from '../../_security.js';
import { writeAudit } from '../../_audit.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  // 密码学流程虽然本身自保护，但请求也应限流（防 IPC/DB 写放大）
  const limited = await enforceIpRateLimit(env, request, 'passkey-signup-challenge', 30, 60);
  if (limited) return limited;

  // 无 IP 限流：challenge 是一次性随机数，不敏感

  const parsed = await parseJsonBody(request, 4096);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const body = parsed.data || {};
  const username = sanitize(body.username, 32);
  const email = sanitize(body.email, 200).toLowerCase();
  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : '';

  if (!username || !email) {
    return errorResponse('请填写账号和邮箱', 400, 'missing_fields', requestId);
  }
  if (!validateUsername(username)) {
    return errorResponse('账号需 6-20 位，仅限字母、数字、下划线', 400, 'invalid_username', requestId);
  }
  if (!validateEmail(email)) {
    return errorResponse('请输入有效的邮箱地址', 400, 'invalid_email', requestId);
  }
  if (!captchaToken) {
    return errorResponse('请先完成人机验证', 400, 'captcha_missing', requestId);
  }

  const captchaIp = getClientIP(request);
  const captcha = await verifyCaptchaTokenV2(env, captchaToken, captchaIp, 'register');
  if (!captcha.valid) {
    return errorResponse('人机验证无效或已过期，请重新验证', 400, 'captcha_invalid', requestId);
  }

  const existing = await env.apex_db.prepare(
    'SELECT id FROM users WHERE username = ? OR LOWER(email) = ? LIMIT 1'
  ).bind(username, email).first();
  if (existing) {
    return errorResponse('账号或邮箱已被使用', 409, 'user_exists', requestId);
  }

  const config = getConfig(env);
  const rpId = config.publicBaseUrl ? new URL(config.publicBaseUrl).hostname : '';
  if (!rpId) return errorResponse('服务器配置错误', 500, 'config_error', requestId);

  const { challengeId, challenge } = await storeChallenge(env, {
    type: 'registration',
    userId: null,
  });

  await writeAudit(env, {
    action: 'passkey_signup_challenge',
    metadata: {
      username,
      emailDomain: String(email || '').split('@')[1] || '',
      emailRedacted: String(email || '').replace(/^(.{0,2}).*?(@.*)$/, '$1***$2'),
    },
  }, request);

  return jsonResponse({
    success: true,
    challengeId,
    publicKey: {
      challenge,
      rp: { id: rpId, name: 'Apex Entertainment' },
      user: { id: 'new-' + challengeId, name: username, displayName: username },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
      excludeCredentials: [],
    },
  }, 200, requestId);
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
