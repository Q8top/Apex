'use strict';
/* Sugar Rush · commercial tuning knobs (mirrors Apex math-profile.js pattern)
 * Paytable / baseWeights / bonus / bombDist 全部在 spec.cjs 共用。
 * 这里只放 real 与 demo 的差异旋钮。
 * payScale 是占位值，需 sim 校准（糖果 real=2.55 / demo=3.60 是 payline 基底）。
 */

const KNOBS = Object.freeze({
  real: Object.freeze({
    id: 'real',
    payScale: 6.35,
    scatterWeight: 1,
    multiplierWeight: 0,
    fsMultiplierWeight: 1,
    maxWinMultiplier: 5000,
    pityRate: 0.0,
    pitySymbol: null,
    pityMinCount: 5,
    targetRtp: Object.freeze({ min: 0.88, max: 0.93, target: 0.90 }),
    targetHitRate: Object.freeze({ min: 0.20, max: 0.35 }),
  }),
  demo: Object.freeze({
    id: 'demo',
    payScale: 1.37,
    scatterWeight: 3,
    multiplierWeight: 0,
    fsMultiplierWeight: 2,
    maxWinMultiplier: 25000,
    pityRate: 0.35,
    pitySymbol: 'blue_candy',
    pityMinCount: 5,
    pityMin: 0.5,
    pityRange: 150,
    targetRtp: Object.freeze({ min: 1.30, max: 2.50, target: 1.78 }),
    targetHitRate: Object.freeze({ min: 0.45, max: 0.60 }),
  }),
});

function getKnobs(mode) {
  const k = KNOBS[mode];
  if (!k) throw new Error('unknown mode: ' + mode);
  return k;
}

function checkSimResult(mode, result) {
  const k = getKnobs(mode);
  const reasons = [];
  if (result.rtp < k.targetRtp.min) reasons.push('RTP ' + result.rtp.toFixed(4) + ' < min ' + k.targetRtp.min);
  if (result.rtp > k.targetRtp.max) reasons.push('RTP ' + result.rtp.toFixed(4) + ' > max ' + k.targetRtp.max);
  if (k.targetHitRate) {
    if (result.hitRate < k.targetHitRate.min) reasons.push('HitRate ' + result.hitRate.toFixed(4) + ' < min ' + k.targetHitRate.min);
    if (result.hitRate > k.targetHitRate.max) reasons.push('HitRate ' + result.hitRate.toFixed(4) + ' > max ' + k.targetHitRate.max);
  }
  return { ok: reasons.length === 0, reasons: reasons };
}

module.exports = { KNOBS, getKnobs, checkSimResult };
