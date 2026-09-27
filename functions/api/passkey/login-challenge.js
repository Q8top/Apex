// POST /api/passkey/login-challenge
// 未登录也能调用。生成登录挑战（不绑定 user）
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody, sanitize } from '../../_validation.js';
import { storeChallenge, getCredentialIdsForUser } from '../../_passkey.js';
import { getConfig } from '../../_config.js';
import { enforceIpRateLimit } from '../../_rateLimit.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  // 无 IP 限流：challenge 是一次性随机数，不敏感
  const limited = await enforceIpRateLimit(env, request, 'passkey-login-challenge', 30, 60);
  if (limited) return limited;

  const parsed = await parseJsonBody(request, 2048);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const account = sanitize((parsed.data || {}).account, 200);

  const config = getConfig(env);
  const rpId = config.publicBaseUrl ? new URL(config.publicBaseUrl).hostname : '';
  if (!rpId) return errorResponse('服务器配置错误', 500, 'config_error', requestId);

  // 生成 challenge（不绑定 user——登录时用户未知）
  const { challengeId, challenge } = await storeChallenge(env, {
    type: 'authentication',
    userId: null,
  });

  // 消除账号枚举：不再返回 allowCredentials
  // passkey 通常为 discoverable credential（resident key），浏览器可直接弹出选择
  // 若账号确实需要 allowCredentials，应改为返回固定长度的随机 ID，避免"存在/不存在"信息泄露
  // 见 https://w3c.github.io/webauthn/#sctn-discoverable-credentials
  const allowCredentials = [];

  return jsonResponse({
    success: true,
    challengeId,
    hasCredentials: allowCredentials.length > 0,
    publicKey: {
      challenge,
      rpId,
      timeout: 60000,
      userVerification: 'preferred',
      allowCredentials,
    },
  }, 200, requestId);
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
