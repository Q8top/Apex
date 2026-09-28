// Apex 邮件发送器
// - 主备 fallback：由 EMAIL_PROVIDER 控制顺序，默认 resend,agentmail
// - 每个 provider 有独立超时
// - Resend 支持 Idempotency-Key
// - AgentMail 使用 inbox_id 端点
// - 生产环境不返回敏感细节

import { getConfig } from './_config.js';

const PER_PROVIDER_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}, timeoutMs = PER_PROVIDER_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function sendViaResend(env, { to, subject, text, html, idempotencyKey }) {
  const config = getConfig(env);
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, provider: 'resend', reason: 'no_api_key' };

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const payload = {
    from: config.emailFrom,
    to: [to],
    subject,
    text,
    html,
  };
  if (config.emailReplyTo) payload.reply_to = config.emailReplyTo;

  try {
    const res = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    let data = {};
    try { data = await res.json(); } catch {}

    if (res.ok) return { ok: true, provider: 'resend', messageId: data.id };

    if (res.status >= 400 && res.status < 500) {
      return { ok: false, provider: 'resend', reason: 'permanent_error', status: res.status };
    }
    return { ok: false, provider: 'resend', reason: 'server_error', status: res.status };
  } catch (error) {
    return {
      ok: false,
      provider: 'resend',
      reason: error.name === 'AbortError' ? 'timeout' : 'network_error',
    };
  }
}

async function sendViaAgentMail(env, { to, subject, text, html }) {
  const config = getConfig(env);
  const apiKey = env.AGENTMAIL_API_KEY;
  const inboxId = config.agentmailInboxId;
  if (!apiKey || !inboxId) return { ok: false, provider: 'agentmail', reason: 'no_config' };

  const url = `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inboxId)}/messages/send`;

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, text, html }),
    });
    let data = {};
    try { data = await res.json(); } catch {}

    if (res.ok) {
      return { ok: true, provider: 'agentmail', messageId: data.id || data.message_id };
    }
    if (res.status >= 400 && res.status < 500) {
      return { ok: false, provider: 'agentmail', reason: 'permanent_error', status: res.status };
    }
    return { ok: false, provider: 'agentmail', reason: 'server_error', status: res.status };
  } catch (error) {
    return {
      ok: false,
      provider: 'agentmail',
      reason: error.name === 'AbortError' ? 'timeout' : 'network_error',
    };
  }
}

function isRecoverable(reason) {
  return reason === 'timeout' || reason === 'network_error' || reason === 'server_error';
}

// 收件人格式校验：防止非法字符注入 JSON / URL
// 拒绝：CR/LF（SMTP 头注入）、控制字符、超长、无 @ 的串
function _validateRecipient(to) {
  if (typeof to !== 'string') return false;
  if (to.length < 3 || to.length > 254) return false;
  // 拒绝 CR/LF/NUL/控制字符
  if (/[\r\n\x00-\x1f\x7f]/.test(to)) return false;
  // 必须是一个 @，且前后非空
  const parts = to.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  // 简单格式校验
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;
  return true;
}

export async function sendEmail(env, to, subject, text, html, idempotencyKey) {
  if (!_validateRecipient(to)) {
    return { ok: false, reason: 'invalid_recipient' };
  }
  if (typeof subject !== 'string' || subject.length > 200 || /[\r\n]/.test(subject)) {
    return { ok: false, reason: 'invalid_subject' };
  }
  const config = getConfig(env);
  const providers = config.emailProviders;
  const attemptsLog = [];
  let lastError = '';

  for (let i = 0; i < providers.length; i += 1) {
    const provider = providers[i];
    const isPrimary = i === 0;
    const maxAttempts = isPrimary ? 2 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const result = provider === 'resend'
        ? await sendViaResend(env, { to, subject, text, html, idempotencyKey })
        : await sendViaAgentMail(env, { to, subject, text, html });

      attemptsLog.push({ provider, attempt, ok: result.ok, reason: result.reason || null });

      if (result.ok) {
        console.log(JSON.stringify({
          tag: 'email_sent',
          provider,
          attempt,
          to_masked: String(to).replace(/^(.{0,2}).*?(@.*)$/, '$1***$2'),
        }));
        return { sent: true, provider, messageId: result.messageId, attempts: attemptsLog };
      }

      lastError = `${provider}:${result.reason}`;

      if (!isRecoverable(result.reason)) {
        // permanent_error / no_api_key / no_config 直接切换下一个 provider
        break;
      }

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }

  console.error(JSON.stringify({
    tag: 'email_all_failed',
    lastError,
    attempts: attemptsLog,
    to,
  }));
  return { sent: false, reason: 'all_providers_failed', error: lastError, attempts: attemptsLog };
}

export function emailTemplate(title, content, code) {
  const safeTitle = String(title || '');
  const safeContent = String(content || '');
  const safeCode = code ? String(code) : '';
  const year = new Date().getFullYear();
  const wrapOpen = '<div style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#0a0a0a;border-radius:12px;overflow:hidden;">';
  const header = '<div style="background:linear-gradient(135deg,#0f0f0f 0%,#050505 100%);padding:28px 24px;border-bottom:1px solid rgba(212,175,55,0.15);">'
    + '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:22px;font-weight:700;letter-spacing:3px;color:#d4af37;text-align:center;">APEX</div>'
    + '<div style="font-size:11px;letter-spacing:2px;color:#8a8a8a;text-align:center;margin-top:6px;text-transform:uppercase;">Global Entertainment</div>'
    + '</div>';
  const bodyOpen = '<div style="padding:32px 28px;">';
  const titleHtml = '<p style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 16px 0;line-height:1.5;">' + safeTitle + '</p>';
  const codeHtml = safeCode
    ? '<div style="font-size:36px;font-weight:800;letter-spacing:12px;color:#4ade80;padding:24px 20px;background:#0f0f0f;border:1px solid rgba(74,222,128,0.2);border-radius:10px;text-align:center;margin:20px 0;font-family:Courier New,monospace;">' + safeCode + '</div>'
    : '';
  const contentHtml = '<p style="color:#a0a0a0;font-size:13.5px;line-height:1.7;margin:16px 0 0 0;">' + safeContent + '</p>';
  const bodyClose = '</div>';
  const footer = '<div style="padding:24px 28px;border-top:1px solid rgba(255,255,255,0.05);background:#050505;">'
    + '<p style="color:#555555;font-size:11px;line-height:1.6;margin:0 0 8px 0;text-align:center;">这是一封系统邮件，请勿直接回复。</p>'
    + '<p style="color:#555555;font-size:11px;line-height:1.6;margin:0 0 8px 0;text-align:center;">如果你不认识这封邮件，请忽略它。</p>'
    + '<p style="color:#444444;font-size:10px;line-height:1.6;margin:16px 0 0 0;text-align:center;">© ' + year + ' Apex Global Entertainment. All rights reserved.</p>'
    + '</div>';
  const wrapClose = '</div>';
  return wrapOpen + header + bodyOpen + titleHtml + codeHtml + contentHtml + bodyClose + footer + wrapClose;
}
