// 临时诊断端点：直接调用 sendEmail，返回每个 provider 的详细结果
// 使用后请删除
import { jsonResponse, errorResponse, optionsResponse } from '../_response.js';
import { parseJsonBody, validateEmail, sanitize } from '../_validation.js';
import { sendEmail } from '../_email.js';
import { getConfig } from '../_config.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  const parsed = await parseJsonBody(request, 1024);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const to = sanitize((parsed.data || {}).to, 200).toLowerCase();
  if (!validateEmail(to)) return errorResponse('无效邮箱', 400, 'invalid_email', requestId);

  const config = getConfig(env);
  const startedAt = new Date().toISOString();

  const result = await sendEmail(
    env,
    to,
    '【Apex】邮件通道测试 ' + startedAt,
    '这是一封测试邮件。\n\n发送时间：' + startedAt + '\n\n如果您收到，说明邮件系统正常。',
    '<div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:24px;border-radius:12px;max-width:600px;">'
    + '<h2 style="color:#d4af37;margin:0 0 16px 0;">Apex 邮件通道测试</h2>'
    + '<p style="color:#ccc;">这是一封测试邮件。</p>'
    + '<p style="color:#888;font-size:13px;">发送时间：' + startedAt + '</p>'
    + '<p style="color:#4ade80;">如果您收到，说明邮件系统正常。</p>'
    + '</div>',
    'email-test/' + to + '/' + Date.now()
  );

  return jsonResponse({
    success: result.sent,
    result: result,
    env: {
      providers: config.emailProviders,
      from: config.emailFrom,
      replyTo: config.emailReplyTo,
      isProduction: config.isProduction,
      hasResendKey: Boolean(env.RESEND_API_KEY),
      hasAgentmailKey: Boolean(env.AGENTMAIL_API_KEY),
      agentmailInboxId: config.agentmailInboxId ? config.agentmailInboxId.substring(0, 8) + '...' : null,
    },
  }, 200, requestId);
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
