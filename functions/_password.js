// Apex 密码哈希/校验单一实现
// 只依赖标准 Web Crypto API（浏览器 / Cloudflare Workers / Node 18+ 均可用）
//
// 重要：Cloudflare Workers 的 Web Crypto PBKDF2 iterations 上限是 100000。
// 超过会在 Workers 运行时抛 NotSupportedError。
// 因此 PBKDF2_ITERATIONS 必须保持 <= 100000。
//
// P11-I: 历史遗留的 v1:600000:... 格式 hash 在 Workers 里无法验证。
// 我们不再静默返回 false（那会导致用户被永久锁出），而是通过
// verifyPasswordDetailed 返回 NEEDS_RESET，由调用方决定如何引导用户重置密码。

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_LEGACY_ITERATIONS = 100000;
const PBKDF2_WORKERS_MAX = 100000;

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

// P11-I: 显式区分 verify 的返回状态，避免"超 iterations 上限"被静默当成
// "密码错误"从而永久锁死账号。verifyPassword 保持布尔兼容（旧调用方不受影响）。
export const VERIFY_RESULT = {
  MATCH: 'match',
  NO_MATCH: 'no_match',
  NEEDS_RESET: 'needs_reset',
  INVALID_INPUT: 'invalid_input',
};

export async function verifyPasswordDetailed(password, stored) {
  if (typeof password !== 'string') return VERIFY_RESULT.INVALID_INPUT;
  if (typeof stored !== 'string' || !stored) return VERIFY_RESULT.INVALID_INPUT;

  const enc = new TextEncoder();
  let iterations;
  let saltHex;
  let hashHex;

  if (stored.startsWith('v1:')) {
    const parts = stored.split(':');
    if (parts.length !== 4) return VERIFY_RESULT.INVALID_INPUT;
    iterations = Number.parseInt(parts[1], 10);
    saltHex = parts[2];
    hashHex = parts[3];
  } else {
    const parts = stored.split(':');
    if (parts.length !== 2) return VERIFY_RESULT.INVALID_INPUT;
    iterations = PBKDF2_LEGACY_ITERATIONS;
    saltHex = parts[0];
    hashHex = parts[1];
  }

  if (!Number.isFinite(iterations) || iterations <= 0) return VERIFY_RESULT.INVALID_INPUT;
  if (!/^[0-9a-f]+$/i.test(saltHex) || saltHex.length % 2 !== 0) return VERIFY_RESULT.INVALID_INPUT;
  if (!/^[0-9a-f]+$/i.test(hashHex) || hashHex.length % 2 !== 0) return VERIFY_RESULT.INVALID_INPUT;

  // P11-I: iterations 超过 Workers 上限 -> 明确告知调用方"需要重置密码"
  if (iterations > PBKDF2_WORKERS_MAX) {
    console.error('[password] iterations exceeds Workers max, requires reset');
    return VERIFY_RESULT.NEEDS_RESET;
  }

  const salt = fromHex(saltHex);
  try {
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    return constantTimeEqual(toHex(bits), hashHex) ? VERIFY_RESULT.MATCH : VERIFY_RESULT.NO_MATCH;
  } catch (err) {
    console.error('[password] deriveBits failed');
    return VERIFY_RESULT.INVALID_INPUT;
  }
}

// 布尔兼容包装：旧调用方继续用 verifyPassword 即可（NO_MATCH/NEEDS_RESET 都是 false）
export async function verifyPassword(password, stored) {
  const r = await verifyPasswordDetailed(password, stored);
  return r === VERIFY_RESULT.MATCH;
}

export function needsRehash(stored) {
  if (typeof stored !== 'string' || !stored) return true;
  if (!stored.startsWith('v1:')) return true;
  const parts = stored.split(':');
  const iterations = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(iterations)) return true;
  return iterations < PBKDF2_ITERATIONS || iterations > PBKDF2_WORKERS_MAX;
}
