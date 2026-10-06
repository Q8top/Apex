#!/usr/bin/env node
// 分析 RTP 来源: base vs freeSpins / 分箱 / FS 贡献
// 用法: node scripts/analyze-rtp.js --mode=real --spins=200000 --seed=1

import { createMathEngine } from '../src/js/engine/math-engine.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = { mode: 'real', spins: 200000, seed: 1, bet: 1 };
  for (const a of argv) {
    if (a.startsWith('--mode='))  out.mode = a.slice(7);
    else if (a.startsWith('--spins=')) out.spins = parseInt(a.slice(8), 10);
    else if (a.startsWith('--seed='))  out.seed = parseInt(a.slice(7), 10);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/game.json'), 'utf8'));
const engine = createMathEngine(config, { seed: args.seed, mode: args.mode });

let totalWin = 0;
let baseWin = 0;
let fsWin = 0;
let hits = 0;
let fsTriggers = 0;
let fsTotalSpins = 0;
let fsTotalWin = 0;
let bombTotal = 0;
let bombCount = 0;
let fsHits = 0;
let fsPlayedSpins = 0;

const bins = { 'lt1': 0, '1to5': 0, '5to10': 0, '10to50': 0, 'gte50': 0 };
const symContrib = new Map();

const t0 = Date.now();
for (let i = 0; i < args.spins; i++) {
  const spin = engine.playSpin(args.bet);
  totalWin += spin.totalWin;
  baseWin += spin.baseWin;
  fsWin += spin.freeSpinsWin;
  if (spin.totalWin > 0) hits++;
  if (spin.freeSpinsAwarded > 0) {
    fsTriggers++;
    fsTotalSpins += spin.freeSpins.spinsPlayed;
    fsTotalWin += spin.freeSpins.totalWin;
    for (const h of spin.freeSpins.history) {
      fsPlayedSpins++;
      if (h.spinWin > 0) fsHits++;
    }
    for (const b of spin.freeSpins.bombList) {
      bombTotal += b.multiplier;
      bombCount++;
    }
  }

  // 分箱
  const r = spin.totalWin / args.bet;
  if (r === 0) {} 
  else if (r < 1) bins.lt1++;
  else if (r < 5) bins['1to5']++;
  else if (r < 10) bins['5to10']++;
  else if (r < 50) bins['10to50']++;
  else bins.gte50++;

  // 符号贡献 (base tumble)
  for (const h of spin.tumble.history) {
    for (const w of h.wins) {
      const cur = symContrib.get(w.id) || { count: 0, payout: 0 };
      cur.count += w.count;
      cur.payout += w.payout;
      symContrib.set(w.id, cur);
    }
  }
}

const elapsed = Date.now() - t0;

console.log('═══════════════════════════════════════');
console.log('RTP 诊断 · ' + args.mode);
console.log('═══════════════════════════════════════');
console.log('spins:       ' + args.spins.toLocaleString());
console.log('seed:        ' + args.seed);
console.log('耗时:        ' + (elapsed/1000).toFixed(2) + 's');
console.log('');

const totalBet = args.spins * args.bet;
const rtp = totalWin / totalBet;
const baseRTP = baseWin / totalBet;
const fsRTP = fsWin / totalBet;

console.log('─── RTP 分解 ───');
console.log('RTP total:   ' + rtp.toFixed(6));
console.log('  base game: ' + baseRTP.toFixed(6) + '  (' + (baseRTP/rtp*100).toFixed(1) + '%)');
console.log('  free spins: ' + fsRTP.toFixed(6) + '  (' + (fsRTP/rtp*100).toFixed(1) + '%)');
console.log('');

console.log('─── 中奖分箱 (占比) ───');
const total = args.spins;
for (const k of Object.keys(bins)) {
  console.log('  ' + k.padEnd(8) + ' ' + (bins[k]/total*100).toFixed(2) + '%  (' + bins[k].toLocaleString() + ')');
}
console.log('');

console.log('─── Free Spins ───');
console.log('触发次数:     ' + fsTriggers);
console.log('触发率:       ' + (fsTriggers/args.spins*100).toFixed(3) + '%');
console.log('FS 内中奖率:  ' + (fsPlayedSpins > 0 ? (fsHits/fsPlayedSpins*100).toFixed(2) + '%' : '0%'));
console.log('平均 FS 长度: ' + (fsTriggers > 0 ? (fsTotalSpins/fsTriggers).toFixed(2) : '0'));
console.log('平均 FS 赢:   ' + (fsTriggers > 0 ? (fsTotalWin/fsTriggers).toFixed(4) : '0'));
console.log('bomb 总数:    ' + bombCount);
console.log('bomb 平均:    ' + (bombCount > 0 ? (bombTotal/bombCount).toFixed(4) : '0'));
console.log('');

console.log('─── 每符号贡献 (base game, 前 8) ───');
const sorted = [...symContrib.entries()].sort((a,b) => b[1].payout - a[1].payout);
for (const [id, v] of sorted.slice(0, 8)) {
  const share = baseWin > 0 ? (v.payout / baseWin * 100).toFixed(2) : '0';
  console.log('  ' + id.padEnd(12) + ' payout=' + v.payout.toFixed(2).padStart(10) + '  占比=' + share + '%');
}
console.log('');

console.log('─── 判定 ───');
const modeCfg = config.modes[args.mode];
console.log('实测 RTP:  ' + rtp.toFixed(4));
console.log('目标:      ' + modeCfg.rtpTarget + '  [' + modeCfg.rtpRange.join(', ') + ']');
console.log('差距:      ' + ((modeCfg.rtpTarget - rtp) / rtp * 100).toFixed(1) + '%');
