export function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a ?? ''));
  const right = new TextEncoder().encode(String(b ?? ''));
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left[i] ^ right[i];
  return diff === 0;
}

export async function sha256Hex(input) {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function base64UrlEncode(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecode(value) {
  let str = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function hmacSha256Base64Url(data, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(String(secret || '')), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(String(data || '')));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function hashIP(ip, salt = '') {
  const value = `${String(ip || '')}_apex_ip_${String(salt || '')}`;
  return (await sha256Hex(value)).slice(0, 32);
}

export function getClientIP(request) {
  const direct = request.headers.get('CF-Connecting-IP');
  if (direct) return direct.trim();
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

// P11-F: CSPRNG + rejection sampling，消除 modulo bias
// 参数 length 限制为 1..9，避免 10**length 超出 Uint32 范围
export function generateNumericCode(length = 6) {
  if (!Number.isInteger(length) || length < 1 || length > 9) {
    throw new RangeError('generateNumericCode: length must be integer in [1, 9]');
  }
  const max = 10 ** length;
  // 4294967296 是 Uint32 上限 + 1；limit 是 max 的整数倍，用于拒绝采样
  const limit = Math.floor(4294967296 / max) * max;
  const buf = new Uint32Array(1);
  let v;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return String(v % max).padStart(length, '0');
}

export function randomToken(bytes = 32) {
  const random = new Uint8Array(bytes);
  crypto.getRandomValues(random);
  return Array.from(random).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function redactSensitive(input) {
  return String(input || '')
    .replace(/password["']?\s*[=:]\s*[^\s,;}"]+/gi, 'password=[REDACTED]')
    .replace(/token["']?\s*[=:]\s*[^\s,;}"]+/gi, 'token=[REDACTED]')
    .replace(/api[_-]?key["']?\s*[=:]\s*[^\s,;}"]+/gi, 'api_key=[REDACTED]')
    .replace(/access[_-]?token["']?\s*[=:]\s*[^\s,;}"]+/gi, 'access_token=[REDACTED]')
    .replace(/refresh[_-]?token["']?\s*[=:]\s*[^\s,;}"]+/gi, 'refresh_token=[REDACTED]')
    .replace(/authorization["']?\s*[=:]\s*[^\s,;}"]+/gi, 'authorization=[REDACTED]')
    .replace(/secret["']?\s*[=:]\s*[^\s,;}"]+/gi, 'secret=[REDACTED]')
    .replace(/cookie["']?\s*[=:]\s*[^\s,;}"]+/gi, 'cookie=[REDACTED]')
    .replace(/code["']?\s*[=:]\s*[^\s,;}"]+/gi, 'code=[REDACTED]')
    .replace(/"password"\s*:\s*"[^"]*"/gi, '"password":"[REDACTED]"')
    .replace(/"token"\s*:\s*"[^"]*"/gi, '"token":"[REDACTED]"')
    .replace(/"api[_-]?key"\s*:\s*"[^"]*"/gi, '"api_key":"[REDACTED]"')
    .replace(/"access[_-]?token"\s*:\s*"[^"]*"/gi, '"access_token":"[REDACTED]"')
    .replace(/"refresh[_-]?token"\s*:\s*"[^"]*"/gi, '"refresh_token":"[REDACTED]"')
    .replace(/"authorization"\s*:\s*"[^"]*"/gi, '"authorization":"[REDACTED]"')
    .replace(/"secret"\s*:\s*"[^"]*"/gi, '"secret":"[REDACTED]"')
    .replace(/"cookie"\s*:\s*"[^"]*"/gi, '"cookie":"[REDACTED]"')
    .replace(/Bearer\s+[A-Za-z0-9_.\-]+/g, 'Bearer [REDACTED]')
    .replace(/\bsk-[A-Za-z0-9_\-]{16,}/g, 'sk-[REDACTED]')
    .replace(/\bpk-[A-Za-z0-9_\-]{16,}/g, 'pk-[REDACTED]')
    .replace(/\bre_[A-Za-z0-9_]{16,}/g, 're_[REDACTED]')
    .replace(/\bam_us_[A-Za-z0-9_]+/g, 'am_us_[REDACTED]');
}

// P11-E: 移除控制字符，防止日志注入 / 伪造多行
export function stripControlChars(input, maxLen = 500) {
  const s = String(input == null ? '' : input)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

// P11-E: 日志用 URL 白名单（仅 http/https/相对路径）
export function sanitizeLogUrl(input, maxLen = 300) {
  const s = stripControlChars(input, maxLen);
  if (!s) return '';
  if (s.startsWith('/')) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return '[invalid-url]';
}

export function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
