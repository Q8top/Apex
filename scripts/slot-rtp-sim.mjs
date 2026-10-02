#!/usr/bin/env node
// 幸运水果 · RTP 模拟器
// 用法：node scripts/slot-rtp-sim.mjs [demo|real] [局数]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

global.window = global;
global.performance = { now: () => Date.now() };

eval(fs.readFileSync(path.join(ROOT, 'src/js/slot/slot-config.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'src/js/slot/slot-engine.js'), 'utf8'));

const E = global.SlotEngine;
const mode = process.argv[2] || 'real';
const spins = Number(process.argv[3]) || 100000;
const bet = 10;

E.setMode(mode);

let totalBet = 0, totalWin = 0, hits = 0;
let maxWin = 0, tier3 = 0, tier2 = 0, tier1 = 0;
const freq = {};

const t0 = Date.now();
for (let i = 0; i < spins; i++) {
  const g = (mode === 'demo') ? E.spinDemo(bet) : E.spin();
  // 统计符号频次
  for (const row of g) for (const s of row) freq[s] = (freq[s] || 0) + 1;
  const r = E.evaluate(g, bet);
  totalBet += bet;
  totalWin += r.totalWin;
  if (r.totalWin > 0) {
    hits++;
    if (r.totalWin > maxWin) maxWin = r.totalWin;
    const ratio = r.totalWin / bet;
    if (ratio >= 10) tier3++;
    else if (ratio >= 2) tier2++;
    else tier1++;
  }
}
const ms = Date.now() - t0;

console.log('=== 模拟报告 ===');
console.log('模式:', mode);
console.log('局数:', spins.toLocaleString());
console.log('总下注:', totalBet.toLocaleString());
console.log('总中奖:', totalWin.toLocaleString());
console.log('RTP:', (totalWin / totalBet * 100).toFixed(2) + '%');
console.log('命中率:', (hits / spins * 100).toFixed(2) + '%');
console.log('平均中奖(命中时):', hits ? (totalWin / hits).toFixed(2) : 0);
console.log('最大单局:', maxWin);
console.log('分级：小/中/大 =', tier1, '/', tier2, '/', tier3);
console.log('耗时:', ms + 'ms (' + (spins / (ms / 1000) / 1000).toFixed(1) + 'k spins/s)');
console.log('');
console.log('=== 符号频次 ===');
for (const k of Object.keys(freq).sort((a,b) => freq[b] - freq[a])) {
  console.log('  ' + k.padEnd(14) + (freq[k] / spins / 9 * 100).toFixed(2) + '%');
}
