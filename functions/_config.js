export function getConfig(env = {}) {
  const environment = env.ENVIRONMENT || 'production';
  const isProduction = environment === 'production';
  const isDevelopment = environment === 'development';

  // 生产环境必须由 assertProductionConfig 强制要求 PUBLIC_BASE_URL；
  // 缺失时返回空字符串，由调用方负责判断，不再 fallback 到任何硬编码域名。
  const publicBaseUrl = String(env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');

  const allowedOrigins = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // EMAIL_PROVIDER 控制顺序，默认 resend 主 agentmail 备
  const emailProviders = String(env.EMAIL_PROVIDER || 'resend,agentmail')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s === 'resend' || s === 'agentmail');

  if (emailProviders.length === 0) emailProviders.push('resend');

  return {
    environment,
    isProduction,
    isDevelopment,
    publicBaseUrl,
    allowedOrigins,

    // Cookie 名称
    sessionCookie: '__Host-apex_session',
    legacySessionCookie: 'apex_session',
// Session TTL
    sessionMaxAge: 7 * 24 * 60 * 60,
      // Session 空闲超时（距 last_seen_at 超过此时间则视为无效）
      // 与 sessionMaxAge 叠加：任一超时都强制重新登录
      sessionIdleTimeout: 3 * 24 * 60 * 60,
      // 单用户最多保留的活跃 session 数（超出时撤销最早的，防无限堆积）
      maxSessionsPerUser: 20, // 单用户活跃 session 上限

    // Token TTL
    resetCodeTtlMs: 10 * 60 * 1000,
    emailVerifyTtlMs: 24 * 60 * 60 * 1000,
    captchaTokenTtlMs: 5 * 60 * 1000,
    captchaChallengeTtlMs: 2 * 60 * 1000,

    // 邮件
    emailProviders,
    emailFrom: env.EMAIL_FROM || 'Apex Entertainment <onboarding@resend.dev>',
    emailReplyTo: env.EMAIL_REPLY_TO || '',
    agentmailInboxId: env.AGENTMAIL_INBOX_ID || '',

    requireVerifiedEmailFrom: isProduction,
  };
}

export function assertProductionConfig(env = {}) {
  const config = getConfig(env);
  const missing = [];
  if (config.isProduction) {
    if (!env.CAPTCHA_SECRET) missing.push('CAPTCHA_SECRET');
    if (!env.SESSION_SALT) missing.push('SESSION_SALT');
    if (!env.AUDIT_SALT) missing.push('AUDIT_SALT');
    if (!env.RATE_LIMIT_SALT) missing.push('RATE_LIMIT_SALT');
    if (!env.PUBLIC_BASE_URL) missing.push('PUBLIC_BASE_URL');
    if (!env.EMAIL_FROM) missing.push('EMAIL_FROM');
    // 至少配置一个邮件服务商
    const hasResend = Boolean(env.RESEND_API_KEY);
    const hasAgentmail = Boolean(env.AGENTMAIL_API_KEY && env.AGENTMAIL_INBOX_ID);
    if (!hasResend && !hasAgentmail) missing.push('RESEND_API_KEY_or_AGENTMAIL_API_KEY');
  }
  return { ok: missing.length === 0, missing, config };
}
