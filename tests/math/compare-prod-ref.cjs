'use strict';
/* Apex · B-3 生产 vs 参考 对比
 *
 * 生产：tests/math/simulator-v2.cjs（走 src/engine/*）
 * 参考：tools/reference-sim/sim.cjs（独立实现）
 *
 * 判定：|RTP_prod - RTP_ref| < 1 绝对百分点
 *       并且 hitRate 差异 < 5 绝对百分点
 *
 * 用不同 seed（两边种子机制不同，不应期待同序列）
 */
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof global.window === 'undefined') global.window = {};

const prodSim = require(ROOT + '/tests/math/simulator-v2.cjs');
const refSim = require(ROOT + '/tools/reference-sim/sim.cjs');

const SPINS = parseInt(process.argv[2] || '1000000', 10);
const MODES = ['real', 'demo'];

function pad(s, n) { return String(s).padStart(n); }

console.log('============================================');
console.log('B-3 · 生产 vs 参考 对比');
console.log('  spins/mode =', SPINS.toLocaleString());
console.log('  prod seed  = prod-' + SPINS);
console.log('  ref seed   = ref-' + SPINS);
console.log('============================================');

let totalFail = 0;

for (const mode of MODES) {
  console.log();
  console.log('=== ' + mode + ' ===');
  const t0 = Date.now();
  const p = prodSim.simulate({ mode, spins: SPINS, betMinor: 100, seed: 'prod-' + SPINS });
  const t1 = Date.now();
  const r = refSim.simulate({ mode, spins: SPINS, betMinor: 100, seed: 'ref-' + SPINS });
  const t2 = Date.now();

  const dRtp = Math.abs(p.rtp - r.rtp);
  const dHit = Math.abs(p.hitRate - r.hitRate);
  const dBonus = Math.abs(p.bonusRate - r.bonusRate);

  console.log('  指标          生产        参考      差异');
  console.log('  RTP        ' + pad(p.rtp.toFixed(4), 10) + '  ' + pad(r.rtp.toFixed(4), 10) + '  ' + dRtp.toFixed(4));
  console.log('  hitRate    ' + pad(p.hitRate.toFixed(4), 10) + '  ' + pad(r.hitRate.toFixed(4), 10) + '  ' + dHit.toFixed(4));
  console.log('  bonusRate  ' + pad(p.bonusRate.toFixed(4), 10) + '  ' + pad(r.bonusRate.toFixed(4), 10) + '  ' + dBonus.toFixed(4));
  console.log('  maxWin     ' + pad(p.maxWinUnits.toFixed(2), 10) + '  ' + pad(r.maxWinUnits.toFixed(2), 10));
  console.log('  p95        ' + pad(p.p95.toFixed(2), 10) + '  ' + pad(r.p95.toFixed(2), 10));
  console.log('  p99        ' + pad(p.p99.toFixed(2), 10) + '  ' + pad(r.p99.toFixed(2), 10));
  console.log('  耗时: 生产 ' + (t1-t0) + 'ms / 参考 ' + (t2-t1) + 'ms');

  let modePass = true;
  if (dRtp > 0.01) { console.log('  [FAIL] RTP 差异 > 1 百分点'); modePass = false; }
  if (dHit > 0.05) { console.log('  [FAIL] hitRate 差异 > 5 百分点'); modePass = false; }
  if (modePass) console.log('  [PASS] ' + mode);
  else totalFail++;
}

console.log();
console.log('============================================');
if (totalFail === 0) {
  console.log('B-3 结论: PASS（生产与参考一致，差异在门禁内）');
  process.exit(0);
} else {
  console.log('B-3 结论: FAIL（' + totalFail + ' 个模式超门禁）');
  console.log('  → 需要定位差异原因（生产 bug 或参考 bug）');
  process.exit(1);
}
