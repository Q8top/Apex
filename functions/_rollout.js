// Apex D-4 rollout bucketing.
// Stable per-user bucketing for gradual feature rollout.
//
// Design:
//   - Bucket is derived from sha256("<userId>_apex_rollout_<salt>")
//     first 8 hex chars -> uint32 -> modulo 10000 (0..9999).
//   - Same (userId, salt) always yields same bucket -> user experience
//     stays consistent across requests and deployments.
//   - Percent reading: env["ROLLOUT_<FLAG>_PERCENT"] (0..100, integer).
//     Invalid or missing -> 0 (fail-safe: rollout OFF).
//
// Usage:
//   const r = await rolloutCheck(env, userId, 'NEW_SETTLEMENT');
//   if (r.inRollout) { ... } else { ... }

import { sha256Hex } from './_security.js';

const BUCKET_COUNT = 10000;
const SALT_PREFIX = 'apex_rollout_';

function normalizeFlag(flag) {
  return String(flag || '').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
}

export function envKeyFor(flag) {
  return 'ROLLOUT_' + normalizeFlag(flag) + '_PERCENT';
}

export function parsePercent(raw) {
  if (raw === undefined || raw === null || raw === '') return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  const i = Math.floor(n);
  if (i < 0) return 0;
  if (i > 100) return 100;
  return i;
}

export async function bucketOf(userId, salt) {
  if (userId === undefined || userId === null) {
    throw new Error('bucketOf: userId required');
  }
  const uid = String(userId);
  const s = String(salt || 'default');
  const hex = await sha256Hex(uid + '_' + SALT_PREFIX + s);
  // first 8 hex chars -> uint32
  const u32 = parseInt(hex.slice(0, 8), 16);
  return u32 % BUCKET_COUNT;
}

export async function rolloutCheck(env, userId, flag) {
  const flagNorm = normalizeFlag(flag);
  const key = envKeyFor(flagNorm);
  const percent = parsePercent(env ? env[key] : undefined);
  const bucket = await bucketOf(userId, flagNorm);
  const threshold = percent * (BUCKET_COUNT / 100); // percent% of 10000
  const inRollout = bucket < threshold;
  return {
    flag: flagNorm,
    bucket,
    percent,
    threshold,
    inRollout,
  };
}

export function _internals() {
  return { BUCKET_COUNT, SALT_PREFIX, normalizeFlag };
}
