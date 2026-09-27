// Apex 通用工具
// 说明：为了向后兼容，这里保留原有导出名称；
// 但实现已经重写为统一走 _security.js / _response.js / _rateLimit.js。

import {
  constantTimeEqual,
  randomToken,
hashIP as _hashIP,
  safeJsonParse,
} from './_security.js';

import { jsonResponse as _jsonResponse, errorResponse, success as _success } from './_response.js';

import { consumeRateLimit } from './_rateLimit.js';

import { consumeToken as _consumeCaptchaToken } from './_captcha.js';

import { getConfig } from './_config.js';

// 密码哈希/校验：单一实现见 ./_password.js
// 这里只做重导出，保持旧调用点兼容
export { hashPassword, verifyPassword, needsRehash } from './_password.js';

// ---------- 响应 ----------
export function jsonResponse(data, status = 200, requestIdOrExtra = null, maybeExtra = null) {
  let requestId = '';
  let extra = {};
  if (typeof requestIdOrExtra === 'string') {
    requestId = requestIdOrExtra;
    extra = maybeExtra || {};
  } else if (requestIdOrExtra && typeof requestIdOrExtra === 'object') {
    extra = requestIdOrExtra;
  }
  return _jsonResponse(data, status, requestId, extra);
}

export { errorResponse };

// ---------- Token / Code ----------
export function generateToken() {
  return randomToken(32);
}

// ---------- 输入清理 ----------
export function sanitize(value, max = 200) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>"'`;\\]/g, '').trim().substring(0, max);
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function validateUsername(username) {
  return /^[a-zA-Z0-9_]{6,20}$/.test(String(username || '').trim());
}

// ---------- Cookie ----------
export function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  const cookies = {};
  header.split(';').forEach((chunk) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const name = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (name) cookies[name] = value;
  });
  return cookies;
}

export async function checkRateLimit(env, ip, action, maxCount, windowSec) {
  const result = await consumeRateLimit(env, {
    key: `ip:${ip || 'unknown'}`,
    action: String(action),
    max: Number(maxCount),
    windowSec: Number(windowSec),
  });
  return { allowed: Boolean(result.allowed), remaining: result.remaining || 0 };
}

// ---------- CAPTCHA Token 校验（兼容旧接口） ----------
export async function verifyCaptchaTokenV2(env, token, ip, purpose) {
  if (!token) return { valid: false, reason: 'missing_token' };
  const secret = env.CAPTCHA_SECRET;
  if (!secret) return { valid: false, reason: 'no_secret' };
  const ipHash = await _hashIP(ip || '', env.CAPTCHA_SALT || secret);
  // purpose 必须传入，用于绑定 CAPTCHA token 与业务动作（防跨用途重放）
  const result = await _consumeCaptchaToken(env, token, secret, { ipHash, purpose });
  return result;
}

// ---------- 其它工具 ----------
export { _hashIP as hashIP, safeJsonParse };
