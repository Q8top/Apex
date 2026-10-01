// Apex 用户登录 API（账号 + 密码 + 人机验证）
import { jsonResponse, errorResponse, optionsResponse } from '../_response.js';
import { verifyPasswordDetailed, VERIFY_RESULT } from '../_password.js';
import { parseJsonBody, sanitize } from '../_validation.js';
import { hashPassword, needsRehash } from '../_utils.js';
import { getConfig } from '../_config.js';
import { buildSessionCookie, createUserSession } from '../_auth.js';
import { enforceIpRateLimit, enforceKeyRateLimit } from '../_rateLimit.js';
import { verifyCaptchaTokenV2 } from '../_utils.js';
import { writeAudit } from '../_audit.js';
import { getClientIP } from '../_security.js';

async function upgradePasswordHashIfNeeded(env, user, plainPassword) {
  try {
    if (!needsRehash(user.password_hash)) return;
    const newHash = await hashPassword(plainPassword);
    await env.apex_db.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newHash, user.id).run();
  } catch (error) {
    console.error('[Login] hash upgrade failed:', error.message);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  const limited = await enforceIpRateLimit(env, request, 'login-ip', 20, 60);
  if (limited) return limited;

  const parsed = await parseJsonBody(request, 4096);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);
  const body = parsed.data || {};

  const account = sanitize(body.account, 200);
  const password = typeof body.password === 'string' ? body.password : '';
  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : '';

  if (!account || !password) {
    return errorResponse('账号和密码不能为空', 400, 'missing_fields', requestId);
  }
  if (password.length > 256) {
    return errorResponse('密码长度必须在 1-256 字符之间', 400, 'password_length_invalid', requestId);
  }
  if (!captchaToken) {
    return errorResponse('请先完成人机验证', 400, 'captcha_missing', requestId);
  }

  const captchaIp = getClientIP(request);
  const captcha = await verifyCaptchaTokenV2(env, captchaToken, captchaIp, 'login');
  if (!captcha.valid) {
    return errorResponse('人机验证无效或已过期，请重新验证', 400, 'captcha_invalid', requestId);
  }

  const accountLimited = await enforceKeyRateLimit(env, 'login-account', 'acc:' + account.toLowerCase(), 10, 300);
  if (accountLimited) return accountLimited;

  const accountLower = account.toLowerCase();
  const user = await env.apex_db.prepare(
    'SELECT id, username, email, password_hash, email_verified, status FROM users WHERE username = ? OR LOWER(email) = ? LIMIT 1'
  ).bind(account, accountLower).first();

  if (!user) {
    await writeAudit(env, { action: 'login_failed', metadata: { reason: 'no_user' } }, request);
    return errorResponse('账号或密码错误', 401, 'invalid_credentials', requestId);
  }
  if (user.status && user.status !== 'active') {
    await writeAudit(env, { action: 'login_blocked', actorId: user.id, actorType: 'user', metadata: { status: user.status } }, request);
    return errorResponse('账号已被禁用，请联系管理员', 403, 'account_disabled', requestId);
  }

  const vres = await verifyPasswordDetailed(password, user.password_hash);
  if (vres === VERIFY_RESULT.NEEDS_RESET) {
    await writeAudit(env, { action: 'login_needs_reset', actorId: user.id, actorType: 'user' }, request);
    return errorResponse('该账号需要重新设置密码，请通过忘记密码完成重置', 409, 'password_requires_reset', requestId);
  }
  if (vres !== VERIFY_RESULT.MATCH) {
    await writeAudit(env, { action: 'login_failed', actorId: user.id, actorType: 'user', metadata: { reason: 'bad_password' } }, request);
    return errorResponse('账号或密码错误', 401, 'invalid_credentials', requestId);
  }

  const config = getConfig(env);

  // P14-Fix: 密码正确后，若生产环境要求邮箱验证且该用户未验证，拒绝登录
  // 说明：
  //   - config.requireVerifiedEmailFrom 在 _config.js 中定义为 isProduction
  //   - Passkey-only 用户（password_hash = 'passkey-only:no-password'）
  //     本就走 passkey 登录流程，不会进入本端点；此处不特殊处理
  //   - 未验证用户被拒绝后，应引导其使用「重发验证邮件」入口
  //   - 检查放在 hash 升级之前，避免为将被拒绝的账号做无谓 PBKDF2 运算
  if (config.requireVerifiedEmailFrom && !user.email_verified) {
    await writeAudit(env, {
      action: 'login_blocked',
      actorId: user.id,
      actorType: 'user',
      metadata: { reason: 'email_not_verified' },
    }, request);
    return errorResponse(
      '请先验证邮箱后再登录',
      403,
      'email_not_verified',
      requestId
    );
  }

  await upgradePasswordHashIfNeeded(env, user, password);

  const session = await createUserSession(env, user.id, request);

  await env.apex_db.prepare(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(user.id).run();

  await writeAudit(env, { action: 'login_success', actorId: user.id, actorType: 'user' }, request);

  return jsonResponse({
    success: true,
    message: '登录成功',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      emailVerified: Boolean(user.email_verified),
    },
  }, 200, requestId, {
    'Set-Cookie': buildSessionCookie(session.token, config.sessionMaxAge, env),
  });
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
