// POST /api/passkey/signup-verify
// 无密码注册第二步：验证 attestation，创建用户 + passkey + session
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody, sanitize, validateEmail, validateUsername } from '../../_validation.js';
import { consumeChallenge, savePasskey } from '../../_passkey.js';
import { buildSessionCookie, createUserSession } from '../../_auth.js';
import { getConfig } from '../../_config.js';
import { enforceIpRateLimit } from '../../_rateLimit.js';
import { writeAudit } from '../../_audit.js';
import {
  b64uDecode, b64uEncode,
  parseAuthenticatorData, coseKeyToJwk,
  verifyClientData, sha256,
} from '../../_webauthn.js';
import { decodeCbor } from '../../_cbor.js';

const PASSKEY_ONLY_SENTINEL = 'passkey-only:no-password';

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  const limited = await enforceIpRateLimit(env, request, 'passkey-signup-verify-ip', 10, 60);
  if (limited) return limited;

  const parsed = await parseJsonBody(request, 16384);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const body = parsed.data || {};
  const username = sanitize(body.username, 32);
  const email = sanitize(body.email, 200).toLowerCase();
  const challengeId = String(body.challengeId || '');
  const rawId = String(body.rawId || '');
  const response = body.response || {};
  const clientDataJSON = String(response.clientDataJSON || '');
  const attestationObject = String(response.attestationObject || '');
  const transports = Array.isArray(body.transports) ? body.transports.join(',') : (body.transports || null);
  const deviceName = String(body.deviceName || '').substring(0, 80) || null;

  if (!username || !email || !challengeId || !rawId || !clientDataJSON || !attestationObject) {
    return errorResponse('缺少必要参数', 400, 'missing_params', requestId);
  }
  if (!validateUsername(username)) {
    return errorResponse('账号格式错误', 400, 'invalid_username', requestId);
  }
  if (!validateEmail(email)) {
    return errorResponse('邮箱格式错误', 400, 'invalid_email', requestId);
  }

  // 1) 消费 challenge
  const stored = await consumeChallenge(env, challengeId, 'registration');
  if (!stored) {
    return errorResponse('挑战已过期或无效', 400, 'invalid_challenge', requestId);
  }
  const expectedChallenge = stored.challenge;

  // 2) 唯一性再次检查（防竞态）
  const existing = await env.apex_db.prepare(
    'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1'
  ).bind(username, email).first();
  if (existing) {
    return errorResponse('账号或邮箱已被使用', 409, 'user_exists', requestId);
  }

  // 3) 验证 clientDataJSON
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

  // 4) 解析 attestationObject
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

  // 5) 解析 authData
  let authData;
  try {
    authData = parseAuthenticatorData(authDataBytes);
    // WebAuthn §7.1：User Present 标志必须为 true
    if (!authData.userPresent) {
      return errorResponse('缺少用户在场验证', 400, 'user_present_failed', requestId);
    }
    // P58-Fix: 新账号创建为高风险操作，必须要求用户验证（UV）
    // 认证器需支持指纹/面容/PIN。若认证器不支持则返回明确错误。
    if (!authData.userVerified) {
      return errorResponse('需要设备验证（指纹 / 面容 / PIN）', 400, 'user_verification_required', requestId);
    }
  } catch (e) {
    return errorResponse('authData 解析失败', 400, 'authdata_invalid', requestId);
  }
  if (!authData.attestedDataIncluded) {
    return errorResponse('缺少凭证数据', 400, 'no_credential_data', requestId);
  }

  // 6) 验证 rpIdHash
  const rpId = origin ? new URL(origin).hostname : '';
  const expectedRpIdHash = await sha256(new TextEncoder().encode(rpId));
  if (!bytesEqual(authData.rpIdHash, expectedRpIdHash)) {
    return errorResponse('rpId 不匹配', 400, 'rp_id_mismatch', requestId);
  }

  // 7) 提取公钥
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
    // 不暴露内部 CBOR/COSE 解析错误（避免攻击者探测实现细节）
    console.error('[Passkey] cose parse failed:', e && e.message ? e.message : e);
    return errorResponse('设备公钥格式不受支持', 400, 'cose_key_unsupported', requestId);
  }

  // 8) credentialId 校验
  const credIdFromAuthData = b64uEncode(authData.credentialId);
  if (credIdFromAuthData !== rawId) {
    return errorResponse('credentialId 不匹配', 400, 'credid_mismatch', requestId);
  }

  // 9) 创建用户（password_hash 用哨兵值，无法用密码登录）
  let userId;
  try {
    let result;

    try {

      result = await env.apex_db.prepare(
      `INSERT INTO users (username, email, password_hash, email_verified, status, created_at, updated_at)
       VALUES (?, ?, ?, 0, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).bind(username, email, PASSKEY_ONLY_SENTINEL).run();

    } catch (e) {

      const msg = String(e && e.message || '');

      if (/UNIQUE|constraint/i.test(msg)) {

        return errorResponse('账号或邮箱已被注册', 409, 'already_exists_race', requestId);

      }

      throw e;

    }
    userId = result && result.meta && result.meta.last_row_id;
  } catch (e) {
    if (String(e.message || '').indexOf('UNIQUE') !== -1) {
      return errorResponse('账号或邮箱已被使用', 409, 'user_exists', requestId);
    }
    console.error('[Passkey signup] create user failed:', e && e.message ? e.message : e);
    return errorResponse('创建账号失败', 500, 'user_create_failed', requestId);
  }

  if (!userId) {
    return errorResponse('创建账号失败', 500, 'user_create_failed', requestId);
  }

  // 10) 保存 passkey（失败则回滚用户）
  const publicKeyJwkEncoded = b64uEncode(new TextEncoder().encode(JSON.stringify(jwk)));
  const aaguidHex = authData.aaguid
    ? Array.from(authData.aaguid).map((b) => b.toString(16).padStart(2, '0')).join('')
    : null;

  try {
    await savePasskey(env, {
      userId,
      credentialId: rawId,
      publicKey: publicKeyJwkEncoded,
      counter: authData.signCount,
      transports,
      deviceName,
      aaguid: aaguidHex,
    });
  } catch (e) {
    await env.apex_db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run().catch(() => {});
    console.error('[Passkey signup] save credential failed:', e && e.message ? e.message : e);
    return errorResponse('保存凭证失败', 500, 'save_failed', requestId);
  }

  // 11) 创建 session（自动登录）
  const session = await createUserSession(env, userId, request);

  await env.apex_db.prepare(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(userId).run();

  await writeAudit(env, {
    action: 'passkey_signup_success',
    actorId: userId,
    actorType: 'user',
    metadata: { username, deviceName },
  }, request);

  return jsonResponse({
    success: true,
    message: '注册成功',
    user: { id: userId, username, email, emailVerified: false },
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
