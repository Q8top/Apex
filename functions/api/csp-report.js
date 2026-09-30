// POST /api/csp-report
// 接收浏览器发送的 CSP 违规报告
//
// 安全要点：
//   - 该端点由浏览器自动调用，无 CSRF（属预检类请求，允许跨站）
//   - Body 截断至 8KB，防止内存/存储滥用
//   - 限流：每 IP 60/min
//   - 仅记录最小字段：violated-directive, blocked-uri(截断), document-uri(去 query)
//   - 绝不保存 Cookie / Authorization / Referer / UA 原始串
//   - 返回 204 无 body

import { optionsResponse } from '../_response.js';
import { getClientIP, hashIP, stripControlChars, sanitizeLogUrl } from '../_security.js';
import { enforceIpRateLimit } from '../_rateLimit.js';

const MAX_BODY_BYTES = 8 * 1024;   // 8KB
const MAX_URI_LEN = 200;
const MAX_DIRECTIVE_LEN = 100;

// 从 document-uri 中剥离 query 和 fragment，仅保留 scheme://host/path
function stripUrl(url) {
  const s = String(url || '');
  if (!s) return '';
  try {
    const u = new URL(s);
    return u.origin + u.pathname;
  } catch {
    // 相对路径或非法 URL：直接返回脱敏后的短串
    return stripControlChars(s, MAX_URI_LEN);
  }
}

// 从 blocked-uri 中剥离敏感信息
function sanitizeBlockedUri(uri) {
  const s = String(uri || '');
  if (!s) return '';
  // 内联脚本 / eval 等特殊值直接返回
  if (s === 'inline' || s === 'eval' || s === 'self' || s === 'data' || s === 'blob') return s;
  // http(s)://... 剥离 query
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      return stripControlChars(u.origin + u.pathname, MAX_URI_LEN);
    } catch {
      return stripControlChars(s, MAX_URI_LEN);
    }
  }
  return stripControlChars(s, MAX_URI_LEN);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  // 限流：60/min per IP
  const limited = await enforceIpRateLimit(env, request, 'csp-report', 60, 60);
  if (limited) return limited;

  // Content-Type 只接受 CSP report 类型
  const ct = String(request.headers.get('Content-Type') || '').toLowerCase();
  const okCt = ct.startsWith('application/csp-report')
            || ct.startsWith('application/reports+json')
            || ct.startsWith('application/json'); // 兼容部分浏览器
  if (!okCt) {
    return new Response(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // 读取 body，截断至 MAX_BODY_BYTES
  let raw = '';
  try {
    const text = await request.text();
    raw = text.length > MAX_BODY_BYTES ? text.slice(0, MAX_BODY_BYTES) : text;
  } catch {
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  }

  // 解析：兼容 3 种格式
  //  1) { "csp-report": {...} }              (report-uri 老式)
  //  2) [{ type: "csp-violation", body:{} }] (report-to 新式)
  //  3) { violated-directive: ..., ... }    (直接对象)
  let report = null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed)) {
        const found = parsed.find((x) => x && x.type === 'csp-violation' && x.body);
        report = found ? found.body : null;
      } else if (parsed['csp-report']) {
        report = parsed['csp-report'];
      } else if (parsed.body && parsed.type) {
        report = parsed.body;
      } else {
        report = parsed;
      }
    }
  } catch {
    // JSON 解析失败：丢弃
    report = null;
  }

  // 无论如何都返回 204（CSP 报告不期望响应体）
  const noContent = new Response(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  });

  if (!report || typeof report !== 'object') return noContent;

  // 提取最小字段
  const violatedDirective = stripControlChars(
    report['violated-directive'] || report['effective-directive'] || '',
    MAX_DIRECTIVE_LEN
  );
  const blockedUri = sanitizeBlockedUri(
    report['blocked-uri'] || ''
  );
  const documentUri = stripUrl(
    report['document-uri'] || ''
  );

  // 组装极简 message（无法反推用户身份 / 页面上下文）
  const message = [
    `directive=${violatedDirective || 'unknown'}`,
    `blocked=${blockedUri || 'unknown'}`,
    `doc=${documentUri || 'unknown'}`,
  ].join(' ').slice(0, 500);

  // 存储
  try {
    const ip = getClientIP(request);
    const ipHash = await hashIP(ip, env.AUDIT_SALT || (env.CAPTCHA_SECRET ? env.CAPTCHA_SECRET + ':audit' : '') || '');
    const environment = env.ENVIRONMENT || 'production';
    // 不记录 UA 原文（避免指纹）：用固定标记
    const uaMarker = 'csp-report';

    await env.apex_db.prepare(
      `INSERT INTO logs (type, message, url, user_agent, ip, request_id, environment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      'csp_violation',
      message,
      '',                 // url 字段留空（已在 message 内脱敏）
      uaMarker,
      ipHash,
      requestId,
      environment
    ).run();
  } catch (error) {
    // 记录失败不影响对浏览器的响应
    console.error('[CSP-Report] insert failed:', error && error.message ? error.message : error);
  }

  return noContent;
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
