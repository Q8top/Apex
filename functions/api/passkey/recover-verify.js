// POST /api/passkey/recover-verify
// Passkey 找回第二步：验证 6 位码 + 新设备的 attestation
// 成功 → 删除该用户所有旧 passkeys + 保存新 passkey + 建 session
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody, sanitize, validateEmail } from '../../_validation.js';
import { consumeChallenge, savePasskey } from '../../_passkey.js';
import { sha256Hex } from '../../_security.js';
import { buildSessionCookie, createUserSession } from '../../_auth.js';
import { getConfig } from '../../_config.js';
import { enforceIpRateLimit, enforceKeyRateLimit } from '../../_rateLimit.js';
import { writeAudit } from '../../_audit.js';
import {
  b64uDecode, b64uEncode,
  parseAuthenticatorData, coseKeyToJwk,
  verifyClientData, sha256,
} from '../../_webauthn.js';
import { decodeCbor } from '../../_cbor.js';

const MAX_EMAIL_FAILURES = 5;
const FAILURE_WINDOW_SEC = 600;

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  const limited = await enforceIpRateLimit(env, request, 'passkey-recover-verify-ip', 20, FAILURE_WINDOW_SEC);
  if (limited) return limited;

  const parsed = await parseJsonBody(request, 16384);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const body = parsed.data || {};
  const email = sanitize(body.email, 200).toLowerCase();
  const code = sanitize(body.code, 16);
  const challengeId = String(body.challengeId || '');
  const rawId = String(body.rawId || '');
  const response = body.response || {};
  const clientDataJSON = String(response.clientDataJSON || '');
  const attestationObject = String(response.attestationObject || '');
  const transports = Array.isArray(body.transports) ? body.transports.join(',') : (body.transports || null);
  const deviceName = String(body.deviceName || '').substring(0, 80) || null;

  if (!validateEmail(email)) {
    return errorResponse('邮箱格式错误', 400, 'invalid_email', requestId);
  }
  if (!/^\d{6}$/.test(code)) {
    return errorResponse('验证码格式错误', 400, 'invalid_code', requestId);
  }
  if (!challengeId || !rawId || !clientDataJSON || !attestationObject) {
    return errorResponse('缺少必要参数', 400, 'missing_params', requestId);
  }

  const emailLimited = await enforceKeyRateLimit(env, 'passkey-recover-verify-email', `email:${email}`, MAX_EMAIL_FAILURES, FAILURE_WINDOW_SEC);
  if (emailLimited) return emailLimited;

  // ============ 1) 验证 6 位码 ============
  const codeHash = await sha256Hex(`apex_recover_v1_${email}_${code}`);
  const row = await env.apex_db.prepare(
    `SELECT id, user_id, expires_at, used_at, attempts FROM password_resets
     WHERE email = ? AND code_hash = ? ORDER BY id DESC LIMIT 1`
  ).bind(email, codeHash).first();

  if (!row) {
    await writeAudit(env, { action: 'passkey_recover_code_invalid', targetType: 'email' }, request);
    return errorResponse('验证码错误', 400, 'invalid_code', requestId);
  }
  if (row.used_at) {
    return errorResponse('验证码已被使用', 400, 'code_used', requestId);
  }
  if (new Date(row.expires_at) < new Date()) {
    return errorResponse('验证码已过期', 400, 'code_expired', requestId);
  }
  if (Number(row.attempts || 0) >= MAX_EMAIL_FAILURES) {
    return errorResponse('尝试次数过多，请重新发送验证码', 429, 'too_many_attempts', requestId);
  }

  // 递增尝试次数
  await env.apex_db.prepare('UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?').bind(row.id).run();

  const userId = row.user_id;
  if (!userId) {
    return errorResponse('账号不存在', 404, 'not_found', requestId);
  }

  // 确认该用户确实有 passkey（防止密码重置码被误用）
  const hasPasskey = await env.apex_db.prepare(
    'SELECT id FROM passkeys WHERE user_id = ? LIMIT 1'
  ).bind(userId).first();
  if (!hasPasskey) {
    return errorResponse('该账号未绑定 Passkey', 400, 'no_passkey', requestId);
  }

  // ============ 2) 消费 WebAuthn challenge ============
  const stored = await consumeChallenge(env, challengeId, 'registration');
  if (!stored) {
    return errorResponse('挑战已过期或无效', 400, 'invalid_challenge', requestId);
  }
  const expectedChallenge = stored.challenge;

  // ============ 3) 验证 clientDataJSON ============
  const config = getConfig(env);
  const origin = config.publicBaseUrl || '';
  try {
    const jsonStr = new TextDecoder().decode(b64uDecode(clientDataJSON));
    verifyClientData(jsonStr, {
      expectedType: 'webauthn.create',
      expectedChallenge,
      expectedOrigins: [origin],
    });
  } catch (e) {
    return errorResponse('客户端数据验证失败', 400, 'clientdata_invalid', requestId);
  }

  // ============ 4) 解析 attestationObject ============
  let attestation;
  try {
    attestation = decodeCbor(b64uDecode(attestationObject));
  } catch (e) {
    return errorResponse('attestation 解析失败', 400, 'attestation_invalid', requestId);
  }

  const authDataBytes = attestation.authData;
  if (!(authDataBytes instanceof Uint8Array)) {
    return errorResponse('authData 格式错误', 400, 'authdata_invalid', requestId);
  }

  let authData;
  try {
    authData = parseAuthenticatorData(authDataBytes);
  } catch (e) {
    return errorResponse('authData 解析失败', 400, 'authdata_invalid', requestId);
  }
  if (!authData.attestedDataIncluded) {
    return errorResponse('缺少凭证数据', 400, 'no_credential_data', requestId);
  }

  // ============ 5) 验证 rpIdHash ============
  const rpId = origin ? new URL(origin).hostname : '';
  const expectedRpIdHash = await sha256(new TextEncoder().encode(rpId));
  if (!bytesEqual(authData.rpIdHash, expectedRpIdHash)) {
    return errorResponse('rpId 不匹配', 400, 'rp_id_mismatch', requestId);
  }

  // ============ 6) 提取公钥 ============
  let coseKey;
  try {
    coseKey = decodeCbor(authData.credentialPublicKey);
  } catch (e) {
    return errorResponse('公钥解析失败', 400, 'cose_key_invalid', requestId);
  }
  let jwk;
  try {
    jwk = coseKeyToJwk(coseKey);
  } catch (e) {
    return errorResponse('公钥不受支持: ' + e.message, 400, 'cose_key_unsupported', requestId);
  }

  // ============ 7) credentialId 校验 ============
  const credIdFromAuthData = b64uEncode(authData.credentialId);
  if (credIdFromAuthData !== rawId) {
    return errorResponse('credentialId 不匹配', 400, 'credid_mismatch', requestId);
  }

  // 检查这个 credential 是否已被别的用户占用（理论上不可能，但要防）
  const credConflict = await env.apex_db.prepare(
    'SELECT user_id FROM passkeys WHERE credential_id = ? LIMIT 1'
  ).bind(rawId).first();
  if (credConflict && credConflict.user_id !== userId) {
    return errorResponse('该设备已绑定其他账号', 409, 'credential_conflict', requestId);
  }

  // ============ 8) 原子操作：删除旧 passkeys + 保存新 passkey + 标记验证码已用 ============
  const publicKeyJwkEncoded = b64uEncode(new TextEncoder().encode(JSON.stringify(jwk)));
  const aaguidHex = authData.aaguid
    ? Array.from(authData.aaguid).map((b) => b.toString(16).padStart(2, '0')).join('')
    : null;

  try {
    await env.apex_db.batch([
      env.apex_db.prepare('DELETE FROM passkeys WHERE user_id = ?').bind(userId),
      env.apex_db.prepare(
        `INSERT INTO passkeys (user_id, credential_id, public_key, counter, transports, device_name, aaguid)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(userId, rawId, publicKeyJwkEncoded, authData.signCount, transports, deviceName, aaguidHex),
      env.apex_db.prepare('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?').bind(row.id),
      env.apex_db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId),
    ]);
  } catch (e) {
    console.error('[Passkey recover] batch failed:', e && e.message ? e.message : e);
    return errorResponse('找回失败，请稍后重试', 500, 'recover_failed', requestId);
  }

  // ============ 9) 查用户信息 ============
  const user = await env.apex_db.prepare(
    'SELECT id, username, email, email_verified FROM users WHERE id = ?'
  ).bind(userId).first();
  if (!user) {
    return errorResponse('账号不存在', 404, 'user_not_found', requestId);
  }

  // ============ 10) 创建新 session ============
  const session = await createUserSession(env, userId, request);

  await env.apex_db.prepare(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(userId).run();

  await writeAudit(env, {
    action: 'passkey_recover_success',
    actorId: userId,
    actorType: 'user',
    metadata: { deviceName },
  }, request);

  return jsonResponse({
    success: true,
    message: 'Passkey 找回成功',
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

function bytesEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
