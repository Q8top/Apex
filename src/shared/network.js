// @ts-check
/* Apex · 网络
 * 统一 API 调用：超时 / 重试 / CSRF / 友好错误
 */

import { logger } from './logger.js';

const DEFAULT_TIMEOUT = 15000;

/**
 * @typedef {Object} ApiResult
 * @property {boolean} ok
 * @property {any}    [data]
 * @property {string} [error]
 * @property {number} [status]
 * @property {string} [code]
 */

/**
 * 从 cookie 读取 CSRF token
 * @returns {string|null}
 */
function getCsrf() {
  try {
    const m = document.cookie.match(/(?:^|;\s*)(?:__Host-apex_csrf|apex_csrf)=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch (_) {
    return null;
  }
}

/**
 * 统一 API 请求
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method
 * @param {string} url
 * @param {any} [body]
 * @param {{timeout?:number, retry?:number}} [opts]
 * @returns {Promise<ApiResult>}
 */
export async function apiRequest(method, url, body, opts) {
  const timeout = (opts && opts.timeout) || DEFAULT_TIMEOUT;
  const maxRetry = (opts && opts.retry) || 0;

  let attempt = 0;
  while (attempt <= maxRetry) {
    attempt++;
    const controller = new AbortController();
    const t = setTimeout(function () { controller.abort(); }, timeout);

    try {
      const headers = { 'Content-Type': 'application/json' };
      const csrf = getCsrf();
      if (csrf) headers['X-CSRF-Token'] = csrf;

      const res = await fetch(url, {
        method: method,
        headers: headers,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      clearTimeout(t);

      let json = null;
      try { json = await res.json(); } catch (_) {}

      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          code: (json && json.code) || 'http_' + res.status,
          error: (json && json.message) || ('HTTP ' + res.status)
        };
      }
      return { ok: true, data: json, status: res.status };
    } catch (e) {
      clearTimeout(t);
      const isAbort = e && e.name === 'AbortError';
      if (attempt > maxRetry) {
        logger.warn('network failed', url, e && e.message);
        return {
          ok: false,
          code: isAbort ? 'timeout' : 'network_error',
          error: isAbort ? '请求超时' : '网络异常，请稍后重试'
        };
      }
      // 重试前等待
      await new Promise(function (r) { setTimeout(r, 800 * attempt); });
    }
  }
  return { ok: false, code: 'unknown', error: '未知错误' };
}

/**
 * 是否在线
 * @returns {boolean}
 */
export function isOnline() {
  try { return navigator.onLine !== false; } catch (_) { return true; }
}
