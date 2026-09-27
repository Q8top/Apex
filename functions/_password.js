// Apex 密码哈希/校验单一实现
// 只依赖标准 Web Crypto API（浏览器 / Cloudflare Workers / Node 18+ 均可用）
// 禁止引入任何 env / context / D1 相关依赖，确保 Node 脚本也能直接 import

const PBKDF2_ITERATIONS = 600000;
const PBKDF2_LEGACY_ITERATIONS = 100000;

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

// 恒定时间字符串比较（防时序侧信道）
function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hashPassword(password) {
  if (typeof password !== 'string') throw new TypeError('password must be string');
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return `v1:${PBKDF2_ITERATIONS}:${toHex(salt)}:${toHex(bits)}`;
}

export async function verifyPassword(password, stored) {
  if (typeof password !== 'string') return false;
  if (typeof stored !== 'string' || !stored) return false;

  const enc = new TextEncoder();
  let iterations;
  let saltHex;
  let hashHex;

  if (stored.startsWith('v1:')) {
    const parts = stored.split(':');
    if (parts.length !== 4) return false;
    iterations = Number.parseInt(parts[1], 10);
    saltHex = parts[2];
    hashHex = parts[3];
  } else {
    const parts = stored.split(':');
    if (parts.length !== 2) return false;
    iterations = PBKDF2_LEGACY_ITERATIONS;
    saltHex = parts[0];
    hashHex = parts[1];
  }

  if (!Number.isFinite(iterations) || iterations <= 0) return false;
  if (!/^[0-9a-f]+$/i.test(saltHex) || saltHex.length % 2 !== 0) return false;
  if (!/^[0-9a-f]+$/i.test(hashHex) || hashHex.length % 2 !== 0) return false;

  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return constantTimeEqual(toHex(bits), hashHex);
}

export function needsRehash(stored) {
  if (typeof stored !== 'string' || !stored) return true;
  if (!stored.startsWith('v1:')) return true;
  const parts = stored.split(':');
  const iterations = Number.parseInt(parts[1], 10);
  return !Number.isFinite(iterations) || iterations < PBKDF2_ITERATIONS;
}
