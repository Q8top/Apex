// S3-5 (Day3): Provably Fair helpers.
// 每个 real spin 前：server_seed + server_seed_hash (承诺) 落库。
// server_seed 在下一 spin 或用户请求时揭示（未来 feature）。
import { randomToken, sha256Hex } from './_security.js';

const HEX64_RE = /^[a-f0-9]{64}$/;

export function generateServerSeed() {
  // randomToken(32) -> 64 hex chars (256-bit)
  return randomToken(32);
}

export async function commitServerSeed(seed) {
  if (typeof seed !== 'string' || !HEX64_RE.test(seed)) {
    throw new Error('provably_fair: bad server seed');
  }
  return sha256Hex(seed);
}

export async function getNextNonce(env, userId) {
  const row = await env.apex_db.prepare(
    'SELECT nonce FROM pf_nonces WHERE user_id = ?'
  ).bind(userId).first();
  return row ? (row.nonce | 0) : 0;
}

export async function bumpNonce(env, userId) {
  await env.apex_db.prepare(
    'INSERT INTO pf_nonces (user_id, nonce) VALUES (?, 1) ' +
    'ON CONFLICT(user_id) DO UPDATE SET nonce = nonce + 1'
  ).bind(userId).run();
}

// 高层：为一次 real spin 生成 { serverSeed, serverSeedHash, nonce, clientSeed }
export async function preparePFContext(env, userId, clientSeed) {
  const nonce = await getNextNonce(env, userId);
  const serverSeed = generateServerSeed();
  const serverSeedHash = await commitServerSeed(serverSeed);
  return {
    serverSeed,
    serverSeedHash,
    nonce,
    clientSeed: (typeof clientSeed === 'string' && clientSeed.length <= 128) ? clientSeed : null
  };
}

export function isValidSeed(seed) { return typeof seed === 'string' && HEX64_RE.test(seed); }
