#!/usr/bin/env node
/* Gates of Olympus · RTP 模拟器
 * 用法：MODE=real N=30000 node scripts/olympus-rtp-sim.mjs
 *      MODE=demo N=30000 node scripts/olympus-rtp-sim.mjs
 * 输出仅打印到终端，不写入仓库（RTP 为机密信息）
 */

import { spin, spinDemo } from '../functions/_math/olympus/engine.js';
import { RNG } from '../functions/_math/olympus/rng.js';
import { PAYOUT } from '../functions/_math/olympus/config.js';

const MODE = process.env.MODE || 'real';
const N = parseInt(process.env.N || '30000', 10);
const BET = 1;

let totalBet = 0;
let totalWin = 0;
let hits = 0;
let bigWins = 0;   // ≥20x bet
let megaWins = 0;  // ≥50x bet
let maxWin = 0;
let totalTumbles = 0;
let scatterHits = 0;

const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const rng = new RNG();
  const r = (MODE === 'demo') ? spinDemo(rng, BET) : spin(rng, BET, MODE);
  totalBet += BET;
  totalWin += r.totalWin;
  totalTumbles += r.tumbleCount;
  if (r.totalWin > 0) hits++;
  if (r.totalWin >= BET * 20) bigWins++;
  if (r.totalWin >= BET * 50) megaWins++;
  if (r.totalWin > maxWin) maxWin = r.totalWin;
  // 初始网格中 SCATTER 计数
  for (const col of r.initialGrid) for (const s of col) if (s === 'SCATTER') scatterHits++;
}
const dt = Date.now() - t0;

const rtp = totalWin / totalBet;
const hitRate = hits / N;

console.log('════════════════════════════════════════');
console.log('  Olympus RTP Simulation');
console.log('════════════════════════════════════════');
console.log('  Mode:        ' + MODE);
console.log('  Spins:       ' + N);
console.log('  Time:        ' + dt + ' ms (' + (N / dt * 1000 | 0) + ' spins/s)');
console.log('  scale:       ' + (MODE === 'demo' ? PAYOUT.scaleDemo : PAYOUT.scaleReal));
console.log('────────────────────────────────────────');
console.log('  RTP:         ' + (rtp * 100).toFixed(2) + '%');
console.log('  Hit Rate:    ' + (hitRate * 100).toFixed(2) + '%');
console.log('  Avg Tumbles: ' + (totalTumbles / N).toFixed(3));
console.log('  Big Win(≥20x):  ' + (bigWins / N * 100).toFixed(3) + '%');
console.log('  Mega Win(≥50x): ' + (megaWins / N * 100).toFixed(3) + '%');
console.log('  Max Win:     ' + maxWin.toFixed(2) + 'x');
console.log('  Scatter/格:  ' + (scatterHits / (N * 30) * 100).toFixed(3) + '%');
console.log('════════════════════════════════════════');

// 校准建议
if (MODE === 'real') {
  const target = 0.90;
  const cur = PAYOUT.scaleReal;
  const sug = (cur * target / rtp);
  console.log('  ⚠️ 校准建议（仅打印，不修改）：');
  console.log('     当前 scaleReal=' + cur + '  RTP=' + (rtp * 100).toFixed(2) + '%');
  console.log('     目标 RTP=90% → 建议 scaleReal=' + sug.toFixed(2));
  console.log('════════════════════════════════════════');
}
