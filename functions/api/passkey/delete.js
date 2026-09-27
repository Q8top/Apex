// POST /api/passkey/delete
// 删除当前用户的某个 passkey
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody } from '../../_validation.js';
import { getCurrentUser } from '../../_auth.js';
import { deletePasskey, listPasskeysForUser } from '../../_passkey.js';
import { enforceIpRateLimit } from '../../_rateLimit.js';
import { writeAudit } from '../../_audit.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  const limited = await enforceIpRateLimit(env, request, 'passkey-delete-ip', 30, 60);
  if (limited) return limited;

  const user = await getCurrentUser(env, request);
  if (!user) return errorResponse('请先登录', 401, 'unauthenticated', requestId);

  const parsed = await parseJsonBody(request, 2048);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const credentialId = String((parsed.data || {}).credentialId || '').trim();
  if (!credentialId) return errorResponse('缺少 credentialId', 400, 'missing_params', requestId);

  // 保护：删除最后一个 passkey 时，必须确保用户仍有可用的其它登录方式
  // 判定条件（任一满足则允许删除）：
  //   1) 用户有真实密码（非 passkey-only 哨兵值）
  //   2) 该 passkey 不是最后一个
  const all = await listPasskeysForUser(env, user.userId);
  const isLastPasskey = Array.isArray(all) && all.length === 1 && all[0].credential_id === credentialId;
  if (isLastPasskey) {
    const u = await env.apex_db.prepare(
      'SELECT password_hash FROM users WHERE id = ? LIMIT 1'
    ).bind(user.userId).first();
    const hasRealPassword = !!(u && u.password_hash && u.password_hash !== 'passkey-only:no-password');
    if (!hasRealPassword) {
      return errorResponse(
        '这是最后一个登录凭证，且账号未设置密码。删除后将无法登录。请先设置密码。',
        409,
        'LAST_PASSKEY_PROTECTED',
        requestId
      );
    }
  }

  const removed = await deletePasskey(env, user.userId, credentialId);
  if (!removed) return errorResponse('凭证不存在或无权删除', 404, 'not_found', requestId);

  await writeAudit(env, {
    action: 'passkey_deleted',
    actorId: user.userId,
    actorType: 'user',
  }, request);

  return jsonResponse({ success: true, message: '已删除' }, 200, requestId);
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
