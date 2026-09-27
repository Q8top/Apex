// POST /api/passkey/recover-challenge
// Passkey 找回第一步：输入邮箱 + 人机验证 → 发送 6 位码
// 与密码重置区分：code_hash 前缀用 apex_recover_v1_ 而非 apex_reset_v1_
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody, sanitize, validateEmail } from '../../_validation.js';
import { generateNumericCode, sha256Hex, getClientIP } from '../../_security.js';
import { enforceIpRateLimit, enforceKeyRateLimit } from '../../_rateLimit.js';
import { sendEmail, emailTemplate } from '../../_email.js';
import { getConfig } from '../../_config.js';
import { verifyCaptchaTokenV2 } from '../../_utils.js';
import { writeAudit } from '../../_audit.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  const config = getConfig(env);

  const limited = await enforceIpRateLimit(env, request, 'passkey-recover-challenge-ip', 10, 60);
  if (limited) return limited;

  const parsed = await parseJsonBody(request, 2048);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const body = parsed.data || {};
  const email = sanitize(body.email, 200).toLowerCase();
  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : '';

  if (!validateEmail(email)) {
    return errorResponse('请输入有效的邮箱地址', 400, 'invalid_email', requestId);
  }
  if (!captchaToken) {
    return errorResponse('请先完成人机验证', 400, 'captcha_missing', requestId);
  }

  const captchaIp = getClientIP(request);
  const captcha = await verifyCaptchaTokenV2(env, captchaToken, captchaIp, 'reset-password');
  if (!captcha.valid) {
    return errorResponse('人机验证无效或已过期，请重新验证', 400, 'captcha_invalid', requestId);
  }

  const emailLimited = await enforceKeyRateLimit(env, 'passkey-recover-email', `email:${email}`, 3, 600);
  if (emailLimited) return emailLimited;

  const genericOk = jsonResponse({ success: true, message: '若该邮箱已绑定 Passkey，验证码已发送' }, 200, requestId);

  const user = await env.apex_db.prepare(
    'SELECT u.id FROM users u WHERE u.email = ? AND EXISTS (SELECT 1 FROM passkeys p WHERE p.user_id = u.id) LIMIT 1'
  ).bind(email).first();
  if (!user) return genericOk;

  const code = generateNumericCode(6);
  const codeHash = await sha256Hex(`apex_recover_v1_${email}_${code}`);
  const expiresAt = new Date(Date.now() + config.resetCodeTtlMs).toISOString();

  // 使该邮箱旧的未使用验证码失效
  await env.apex_db.prepare(
    'UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE email = ? AND used_at IS NULL'
  ).bind(email).run();

  await env.apex_db.prepare(
    'INSERT INTO password_resets (user_id, email, code_hash, expires_at, attempts) VALUES (?, ?, ?, ?, 0)'
  ).bind(user.id, email, codeHash, expiresAt).run();

  const idempotencyKey = `passkey-recover/${email}/${code}`;
  const emailRes = await sendEmail(
    env,
    email,
    '【Apex】Passkey 找回验证码',
    `您的 Passkey 找回验证码是：${code}\n\n验证码 10 分钟内有效，请勿泄露给他人。\n\n如果这不是您的操作，请忽略此邮件。`,
    emailTemplate(
      '您的 Passkey 找回验证码是：',
      '验证码 10 分钟内有效。验证通过后，您可以在此设备重新绑定 Passkey，旧设备的 Passkey 将失效。',
      code
    ),
    idempotencyKey
  );

  await writeAudit(env, { action: 'passkey_recover_code_sent', targetType: 'email', metadata: { sent: emailRes.sent } }, request);

  if (!emailRes.sent) {
    if (config.isDevelopment) {
      return jsonResponse({ success: true, message: '邮件发送失败（开发模式）', devCode: code }, 200, requestId);
    }
    return errorResponse('验证码发送失败，请稍后重试', 500, 'email_failed', requestId);
  }

  return genericOk;
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
