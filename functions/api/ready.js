import { jsonResponse, optionsResponse } from '../_response.js';
import { cleanupOldLogs } from '../_logs.js';
import { cleanupRateLimits } from '../_rateLimit.js';
import { cleanupExpiredSessions } from '../_auth.js';
import { cleanupExpiredChallenges } from '../_passkey.js';
import { cleanupExpiredTokens } from '../_captcha.js';

export async function onRequestGet(context) {
  const { env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  try {
    await context.env.apex_db.prepare('SELECT 1').first();
    // 触发定期清理（幂等、异步、不阻塞健康检查）
  // ready 端点通常由外部 uptime 监控定期调用，作为"心跳"
  // 所有 cleanup 都是幂等 DELETE，重复调用无副作用
  Promise.resolve()
    .then(() => cleanupOldLogs(env))
    .catch(() => {});
  Promise.resolve()
    .then(() => cleanupRateLimits(env))
    .catch(() => {});
  Promise.resolve()
    .then(() => cleanupExpiredSessions(env))
    .catch(() => {});
  Promise.resolve()
    .then(() => cleanupExpiredChallenges(env))
    .catch(() => {});
  Promise.resolve()
    .then(() => cleanupExpiredTokens(env))
    .catch(() => {});

  return jsonResponse({ success: true, ready: true }, 200, requestId);
  } catch {
    return jsonResponse({ success: false, ready: false }, 503, requestId);
  }
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
