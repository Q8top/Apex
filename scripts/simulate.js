#!/usr/bin/env node
// Apex · Candy Tumble Simulator
// 用法:
//   node scripts/simulate.js --mode=demo --spins=1000000 --seed=1
//   node scripts/simulate.js --mode=real --spins=100000000 --seed=42
// 输出: RTP / hitRate / fsRate / volatility / percentiles / 置信区间
// 依赖: Math Engine + RNG + Symbol System (无外部依赖)

import { createMathEngine } from '../src/js/engine/math-engine.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── CLI 解析 ──
function parseArgs(argv) {
  const out = { mode: 'demo', spins: 1000000, seed: 1, bet: 1, verbose: false };
  for (const a of argv) {
    if (a.startsWith('--mode='))  out.mode = a.slice(7);
    else if (a.startsWith('--spins=')) out.spins = parseInt(a.slice(8), 10);
    else if (a.startsWith('--seed='))  out.seed = parseInt(a.slice(7), 10);
    else if (a.startsWith('--bet='))   out.bet = parseFloat(a.slice(6));
    else if (a === '--verbose')        out.verbose = true;
  }
  if (!['demo', 'real'].includes(out.mode)) {
    console.error('[FATAL] --mode 必须是 demo 或 real');
    process.exit(2);
  }
  if (!Number.isInteger(out.spins) || out.spins < 1) {
    console.error('[FATAL] --spins 必须 >= 1');
    process.exit(2);
  }
  return out;
}

// ── 统计工具 ──
function sum(arr) {
  let s = 0;
  for (const v of arr) s += v;
  return s;
}

function mean(arr) {
  return arr.length ? sum(arr) / arr.length : 0;
}

function variance(arr, m) {
  if (arr.length < 2) return 0;
  const mu = (m == null) ? mean(arr) : m;
  let s = 0;
  for (const v of arr) {
    const d = v - mu;
    s += d * d;
  }
  return s / (arr.length - 1);
}

function percentile(sortedArr, p) {
  if (!sortedArr.length) return 0;
  const idx = Math.min(sortedArr.length - 1, Math.floor((sortedArr.length - 1) * p));
  return sortedArr[idx];
}

function fmt(n, digits) {
  if (typeof n !== 'number' || !isFinite(n)) return String(n);
  return n.toFixed(digits != null ? digits : 6);
}

function fmtPct(n) {
  return (n * 100).toFixed(3) + '%';
}

// ── 主流程 ──
const args = parseArgs(process.argv.slice(2));

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/game.json'), 'utf8'));

console.log('═══════════════════════════════════════');
console.log('Apex Candy Tumble · Simulator');
console.log('═══════════════════════════════════════');
console.log('mode:   ' + args.mode);
console.log('spins:  ' + args.spins.toLocaleString());
console.log('seed:   ' + args.seed);
console.log('bet:    ' + args.bet);
console.log('config: v' + config.version + ' (math ' + config.mathVersion + ')');
console.log('');

// ═══════════════ 主循环 ═══════════════
const engine = createMathEngine(config, { seed: args.seed, mode: args.mode });

const wins = new Array(args.spins);
let hits = 0;
let fsTriggers = 0;
let totalTumble = 0;
let maxTumble = 0;
let maxWin = 0;
let totalBombMult = 0;
let bombCount = 0;
let safetyHits = 0;

const t0 = Date.now();
const progressEvery = Math.max(1, Math.floor(args.spins / 10));

for (let i = 0; i < args.spins; i++) {
  const spin = engine.playSpin(args.bet);
  wins[i] = spin.totalWin;

  if (spin.totalWin > 0) hits++;
  if (spin.freeSpinsAwarded > 0) fsTriggers++;
  totalTumble += spin.tumble.tumbleCount;
  if (spin.tumble.tumbleCount > maxTumble) maxTumble = spin.tumble.tumbleCount;
  if (spin.totalWin > maxWin) maxWin = spin.totalWin;
  if (spin.tumble.safetyHit) safetyHits++;

  if (spin.freeSpins && spin.freeSpins.bombList) {
    for (const b of spin.freeSpins.bombList) {
      totalBombMult += b.multiplier;
      bombCount++;
    }
  }

  if (args.verbose && (i + 1) % progressEvery === 0) {
    const pct = ((i + 1) / args.spins * 100).toFixed(0);
    process.stdout.write('  progress: ' + pct + '% (' + (i + 1).toLocaleString() + ')\r');
  }
}
if (args.verbose) process.stdout.write('\n');

const elapsed = Date.now() - t0;

// ═══════════════ 统计计算 ═══════════════
const totalBet = args.bet * args.spins;
const totalWin = sum(wins);
const rtp = totalWin / totalBet;
const hitRate = hits / args.spins;
const fsRate = fsTriggers / args.spins;
const avgTumble = totalTumble / args.spins;
const avgWinPerHit = hits > 0 ? (totalWin / hits) : 0;

const mu = mean(wins);
const varWin = variance(wins, mu);
const std = Math.sqrt(varWin);
const cv = mu > 0 ? (std / mu) : 0;

// 分位数
const sorted = wins.slice().sort((a, b) => a - b);
const p50 = percentile(sorted, 0.50);
const p75 = percentile(sorted, 0.75);
const p90 = percentile(sorted, 0.90);
const p95 = percentile(sorted, 0.95);
const p99 = percentile(sorted, 0.99);
const p999 = percentile(sorted, 0.999);

// 标准误差 + 95% 置信区间 (mean win)
const se = std / Math.sqrt(args.spins);
const ci95Lo = mu - 1.96 * se;
const ci95Hi = mu + 1.96 * se;
const ciRtpLo = ci95Lo / args.bet;
const ciRtpHi = ci95Hi / args.bet;

// Bomb 统计
const avgBombMult = bombCount > 0 ? (totalBombMult / bombCount) : 0;

// 目标判定
const modeCfg = config.modes[args.mode];
let verdict = 'UNKNOWN';
if (args.mode === 'demo') {
  const ok = rtp >= modeCfg.rtpRange[0] && rtp <= modeCfg.rtpRange[1];
  verdict = ok ? 'PASS' : 'FAIL';
} else {
  const lo = modeCfg.rtpRange[0];
  const hi = modeCfg.rtpRange[1];
  const ceiling = modeCfg.hardCeiling;
  if (rtp < lo) verdict = 'FAIL_LOW';
  else if (rtp > ceiling) verdict = 'FAIL_CEILING';
  else if (rtp > hi) verdict = 'WARN_HIGH';
  else verdict = 'PASS';
}

// ═══════════════ 报告 ═══════════════
console.log('─── 性能 ───');
console.log('耗时:       ' + (elapsed / 1000).toFixed(2) + 's');
console.log('速率:       ' + Math.round(args.spins / (elapsed / 1000)).toLocaleString() + ' spins/s');
console.log('');

console.log('─── 基础指标 ───');
console.log('RTP:        ' + fmt(rtp, 6));
console.log('hitRate:    ' + fmtPct(hitRate));
console.log('fsRate:     ' + fmtPct(fsRate));
console.log('avgWin/hit: ' + fmt(avgWinPerHit, 6));
console.log('avgTumble:  ' + fmt(avgTumble, 4));
console.log('maxTumble:  ' + maxTumble);
console.log('safetyHits: ' + safetyHits);
console.log('');

console.log('─── 赢额分布 (每局, 单位=bet 倍数) ───');
console.log('mean:       ' + fmt(mu / args.bet, 6));
console.log('variance:   ' + fmt(varWin / (args.bet * args.bet), 6));
console.log('std:        ' + fmt(std / args.bet, 6));
console.log('CV:         ' + fmt(cv, 4));
console.log('');

console.log('─── 分位数 (每局赢额 / bet) ───');
console.log('P50:        ' + fmt(p50 / args.bet, 4));
console.log('P75:        ' + fmt(p75 / args.bet, 4));
console.log('P90:        ' + fmt(p90 / args.bet, 4));
console.log('P95:        ' + fmt(p95 / args.bet, 4));
console.log('P99:        ' + fmt(p99 / args.bet, 4));
console.log('P99.9:      ' + fmt(p999 / args.bet, 4));
console.log('max:        ' + fmt(maxWin / args.bet, 4) + '  (' + fmt(maxWin, 4) + ')');
console.log('');

console.log('─── 置信区间 (95%, RTP) ───');
console.log('SE:         ' + fmt(se / args.bet, 6));
console.log('CI95:       [' + fmt(ciRtpLo, 6) + ', ' + fmt(ciRtpHi, 6) + ']');
console.log('');

console.log('─── Bomb (仅在 Free Spins 期间) ───');
console.log('触发次数:    ' + bombCount);
console.log('avg mult:   ' + fmt(avgBombMult, 4));
console.log('');

console.log('─── 目标判定 ───');
console.log('目标模式:    ' + args.mode);
console.log('目标 RTP:    ' + modeCfg.rtpTarget);
console.log('目标区间:    [' + modeCfg.rtpRange[0] + ', ' + modeCfg.rtpRange[1] + ']');
if (args.mode === 'real') console.log('硬上限:      ' + modeCfg.hardCeiling);
console.log('实测 RTP:    ' + fmt(rtp, 6));
console.log('判定:        ' + verdict);
console.log('');

// ═══════════════ 退出码 (用于 CI) ═══════════════
let exitCode = 0;
if (args.mode === 'demo') {
  if (rtp < modeCfg.rtpRange[0] || rtp > modeCfg.rtpRange[1]) exitCode = 1;
} else {
  if (rtp < modeCfg.rtpRange[0]) exitCode = 1;
  if (rtp > modeCfg.hardCeiling) exitCode = 1;
}

console.log('═══════════════════════════════════════');
if (exitCode === 0) console.log('EXIT: 0 (PASS)');
else console.log('EXIT: ' + exitCode + ' (' + verdict + ')');
process.exit(exitCode);
