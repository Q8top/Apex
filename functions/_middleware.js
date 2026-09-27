import { generateCsrfToken, buildCsrfCookie, verifyCsrf, getCsrfCookie } from './_csrf.js';
import { assertProductionConfig } from './_config.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// 统一 API 响应安全头（防御纵深：即使脱离 Cloudflare Pages 的 _headers 也生效）
// CORS 部分动态生成：优先使用 ALLOWED_ORIGINS，其次 PUBLIC_BASE_URL
// 不再硬编码域名，避免与 wrangler.toml [vars] 不一致
function buildCorsHeaders(env) {
  const origins = new Set();
  const rawAllowed = String(env.ALLOWED_ORIGINS || '');
  for (const o of rawAllowed.split(',')) {
    const t = o.trim();
    if (t) origins.add(t);
  }
  const base = String(env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  if (base) origins.add(base);

  const header = { 'Vary': 'Origin' };
  if (origins.size === 1) {
    header['Access-Control-Allow-Origin'] = [...origins][0];
  } else if (origins.size > 1) {
    // 多域名：不设置 ACAO（仅靠 Vary: Origin 告诉缓存按 Origin 分桶）
    // 实际跨域判断由 applyCors 按 request Origin 动态匹配
    header['Access-Control-Allow-Origin'] = [...origins].join('|'); // 占位，会被 applyCors 覆盖
  } else {
    // 无配置：不设 ACAO（同源请求无需 CORS 头）
  }
  return header;
}

const API_SECURITY_HEADERS_STATIC = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

function jsonError(status, message, requestId, extra) {
  return new Response(JSON.stringify({
    success: false,
    message,
    request_id: requestId,
    ...(extra || {}),
  }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Request-ID': requestId,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function onRequest(context) {
  // requestId 用于日志关联，使用 CSPRNG 避免可预测序列被用于日志投毒
  const requestId = 'apx_' + Date.now().toString(36) + '_' +
    crypto.randomUUID().replace(/-/g, '').slice(0, 12);

  context.data = context.data || {};
  context.data.requestId = requestId;

  try {
    const url = new URL(context.request.url);
    const isApi = url.pathname.startsWith('/api/');

    // ---------- 生产环境配置断言（仅 API 路由） ----------
    if (isApi) {
      const check = assertProductionConfig(context.env);
      if (!check.ok) {
        console.error('[Apex][config] 生产环境缺少必需配置:', check.missing.join(', '));
        return jsonError(503, '服务暂时不可用，请稍后重试', requestId, {
          code: 'config_invalid',
        });
      }
    }

    // ---------- CSRF 校验 ----------
    if (!SAFE_METHODS.has(context.request.method.toUpperCase())) {
      const csrfOk = verifyCsrf(context.request);
      if (!csrfOk) {
        const headers = new Headers();
        headers.set('Content-Type', 'application/json; charset=utf-8');
        headers.set('X-Request-ID', requestId);
        headers.set('X-Content-Type-Options', 'nosniff');
        if (!getCsrfCookie(context.request)) {
          // P11-J: buildCsrfCookie 返回数组（__Host- 主 + legacy 兼容）
          for (const c of buildCsrfCookie(generateCsrfToken())) {
            headers.append('Set-Cookie', c);
          }
        }
        return new Response(JSON.stringify({
          success: false,
          message: 'CSRF 校验失败，请刷新页面后重试',
          code: 'csrf_invalid',
          request_id: requestId,
        }), {
          status: 403,
          headers,
        });
      }
    }

    const response = await context.next();
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Request-ID', requestId);
    // buildCorsHeaders 保留供未来按 request.Origin 动态匹配使用
    void buildCorsHeaders;
      for (const [k, v] of Object.entries(API_SECURITY_HEADERS_STATIC)) {
        newHeaders.set(k, v);
      }
      // 只设置单 origin 的 CORS（多 origin 场景由 applyCors 动态处理）
      const uniqueOrigins = String((context.env && context.env.ALLOWED_ORIGINS) || '').split(',').map(s => s.trim()).filter(Boolean);
      const baseOrigin = String((context.env && context.env.PUBLIC_BASE_URL) || '').replace(/\/+$/, '');
      if (baseOrigin && !uniqueOrigins.includes(baseOrigin)) uniqueOrigins.push(baseOrigin);
      if (uniqueOrigins.length === 1) {
        newHeaders.set('Access-Control-Allow-Origin', uniqueOrigins[0]);
      }
      newHeaders.set('Vary', 'Origin');

    if (!getCsrfCookie(context.request)) {
      // P11-J: buildCsrfCookie 返回数组（__Host- 主 + legacy 兼容）
      for (const c of buildCsrfCookie(generateCsrfToken())) {
        newHeaders.append('Set-Cookie', c);
      }
    }

    if (response.status === 204 || response.status === 304) {
      return new Response(null, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (err) {
    console.error('[Apex][middleware]', requestId, err && err.stack ? err.stack : err);
    return jsonError(500, '服务器内部错误', requestId);
  }
}
