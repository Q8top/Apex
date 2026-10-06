#!/usr/bin/env node
// Apex · Candy Tumble Simulator (streaming stats, constant memory)
// 用法:
//   node scripts/simulate.js --mode=real --spins=100000000 --seed=1
// 关键: 不保存全量样本, 内存常数级, 支持 100M+ spins

import { createMathEngine } from '../src/js/engine/math-engine.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── CLI 解析 ──
function parseArgs(argv) {
  const out = { mode: 'demo', spins: 1000000, seed: 1, bet: 1, verbose: false, bucket: 0.01 };
  for (const a of argv) {
    if (a.startsWith('--mode='))  out.mode = a.slice(7);
    else if (a.startsWith('--spins=')) out.spins = parseInt(a.slice(8), 10);
    else if (a.startsWith('--seed='))  out.seed = parseInt(a.slice(7), 10);
    else if (a.startsWith('--bet='))   out.bet = parseFloat(a.slice(6));
    else if (a.startsWith('--bucket=')) out.bucket = parseFloat(a.slice(9));
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

// ══════════════════════════════════════════════════════════
// StreamStats: 常数级内存 (100M spins -> < 100 KB)
//   - Welford 在线 mean/variance
//   - 固定宽度 histogram 求分位数
//   - min/max 精确追踪
// ══════════════════════════════════════════════════════════
class StreamStats {
  constructor(bucketWidth) {
    this.bucketWidth = bucketWidth || 0.01;
    this.bucketCount = 10000; // 覆盖 [0, 100) 倍率
    this.histogram = new Uint32Array(this.bucketCount + 1); // 最后一桶 = overflow
    this.count = 0;
    this.min = Infinity;
    this.max = -Infinity;
    // Welford
    this._mean = 0;
    this._m2 = 0;
    // 精确累计 (用于 RTP / 均值一致性核对)
    this.sum = 0;
    // overflow 精确累计 (超出 bucketCount * bucketWidth 的尾部)
    this.overflowSum = 0;
    this.overflowCount = 0;
  }

  add(value) {
    if (!isFinite(value)) {
      throw new Error('StreamStats.add: value 非有限数 ' + value);
    }
    this.count++;
    this.sum += value;
    if (value < this.min) this.min = value;
    if (value > this.max) this.max = value;

    // Welford 在线更新
    const delta = value - this._mean;
    this._mean += delta / this.count;
    const delta2 = value - this._mean;
    this._m2 += delta * delta2;

    // histogram
    const upper = this.bucketCount * this.bucketWidth;
    if (value >= upper) {
      this.histogram[this.bucketCount]++;
      this.overflowSum += value;
      this.overflowCount++;
    } else {
      const idx = Math.floor(value / this.bucketWidth);
      this.histogram[idx]++;
    }
  }

  mean() {
    return this.count > 0 ? this._mean : 0;
  }

  variance() {
    if (this.count < 2) return 0;
    return this._m2 / (this.count - 1);
  }

  std() {
    return Math.sqrt(this.variance());
  }

  // 分位数 (approximate, 精度 ± bucketWidth/2; overflow 部分用 max)
  percentile(p) {
    if (this.count === 0) return 0;
    const target = Math.floor((this.count - 1) * p);
    let acc = 0;
    for (let i = 0; i <= this.bucketCount; i++) {
      acc += this.histogram[i];
      if (acc > target) {
        if (i === this.bucketCount) {
          // overflow 桶: 返回 (upper + max) / 2 近似
          return (this.bucketCount * this.bucketWidth + this.max) / 2;
        }
        return i * this.bucketWidth + this.bucketWidth / 2;
      }
    }
    return this.max;
  }
}

// ── 主流程 ──
const args = parseArgs(process.argv.slice(2));

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/game.json'), 'utf8'));

console.log('═══════════════════════════════════════');
console.log('Apex Candy Tumble · Simulator (streaming)');
console.log('═══════════════════════════════════════');
console.log('mode:     ' + args.mode);
console.log('spins:    ' + args.spins.toLocaleString());
console.log('seed:     ' + args.seed);
console.log('bet:      ' + args.bet);
console.log('bucket:   ' + args.bucket + ' (histogram width, bet-multiple)');
console.log('config:   v' + config.version + ' (math ' + config.mathVersion + ')');
console.log('');

// ═══════════════ 主循环 ═══════════════
const engine = createMathEngine(config, { seed: args.seed, mode: args.mode });

// 流式统计 (常数内存)
const winsStats = new StreamStats(args.bucket);            // 每局 totalWin / bet
const tumbleStats = new StreamStats(0.01);                 // 记录 1/tumble? 不, 记录 tumbleCount 分布
// tumbleCount 是整数, 用另一个 histogram
const tumbleHistogram = new Uint32Array(100);              // 覆盖 0-98, 99 = overflow

let hits = 0;
let fsTriggers = 0;
let totalTumble = 0;
let maxTumble = 0;
let safetyHits = 0;
let totalBombMult = 0;
let bombCount = 0;
let fsPlayedSpins = 0;
let fsHits = 0;
let baseWinTotal = 0;
let fsWinTotal = 0;

const t0 = Date.now();
const progressEvery = Math.max(1, Math.floor(args.spins / 20));

for (let i = 0; i < args.spins; i++) {
  const spin = engine.playSpin(args.bet);

  // 归一化为 bet 倍数, 用 StreamStats 记录
  const winMultiple = spin.totalWin / args.bet;
  winsStats.add(winMultiple);

  if (spin.totalWin > 0) hits++;

  if (spin.freeSpinsAwarded > 0) {
    fsTriggers++;
    baseWinTotal += spin.baseWin;
    fsWinTotal += spin.freeSpins.totalWin;
    for (const h of spin.freeSpins.history) {
      fsPlayedSpins++;
      if (h.spinWin > 0) fsHits++;
    }
    for (const b of spin.freeSpins.bombList) {
      totalBombMult += b.multiplier;
      bombCount++;
    }
  } else {
    baseWinTotal += spin.baseWin;
  }

  // tumble 统计
  totalTumble += spin.tumble.tumbleCount;
  if (spin.tumble.tumbleCount > maxTumble) maxTumble = spin.tumble.tumbleCount;
  if (spin.tumble.safetyHit) safetyHits++;
  const tc = spin.tumble.tumbleCount;
  if (tc < 99) tumbleHistogram[tc] = (tumbleHistogram[tc] || 0) + 1;
  else tumbleHistogram[99] = (tumbleHistogram[99] || 0) + 1;

  if (args.verbose && (i + 1) % progressEvery === 0) {
    const pct = ((i + 1) / args.spins * 100).toFixed(0);
    process.stderr.write('  progress: ' + pct + '% (' + (i + 1).toLocaleString() + ')\n');
  }
}

const elapsed = Date.now() - t0;

// ═══════════════ 统计计算 ═══════════════
const rtp = winsStats.mean();                          // 每局赢/bet 的均值 = RTP
const hitRate = hits / args.spins;
const fsRate = fsTriggers / args.spins;
const avgTumble = totalTumble / args.spins;
const avgWinPerHit = hits > 0 ? (winsStats.sum * args.bet / hits) : 0;

const mu = rtp;
const std = winsStats.std();
const cv = mu > 0 ? (std / mu) : 0;

const p50 = winsStats.percentile(0.50);
const p75 = winsStats.percentile(0.75);
const p90 = winsStats.percentile(0.90);
const p95 = winsStats.percentile(0.95);
const p99 = winsStats.percentile(0.99);
const p999 = winsStats.percentile(0.999);

const se = std / Math.sqrt(args.spins);
const ci95Lo = mu - 1.96 * se;
const ci95Hi = mu + 1.96 * se;

const avgBombMult = bombCount > 0 ? (totalBombMult / bombCount) : 0;
const fsHitRate = fsPlayedSpins > 0 ? (fsHits / fsPlayedSpins) : 0;

const totalBet = args.bet * args.spins;
const totalWin = winsStats.sum * args.bet;
const baseRtp = baseWinTotal / totalBet;
const fsRtp = fsWinTotal / totalBet;

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
  if (rtp < 0.86) verdict = 'FAIL_LOW';
  else if (rtp < lo) verdict = 'WARN_LOW';
  else if (rtp > ceiling) verdict = 'FAIL_CEILING';
  else if (rtp > hi) verdict = 'WARN_HIGH';
  else verdict = 'PASS';
}

function fmt(n, digits) {
  if (typeof n !== 'number' || !isFinite(n)) return String(n);
  return n.toFixed(digits != null ? digits : 6);
}

function fmtPct(n) {
  return (n * 100).toFixed(3) + '%';
}

// ═══════════════ 报告 ═══════════════
console.log('─── 性能 ───');
console.log('耗时:        ' + (elapsed / 1000).toFixed(2) + 's');
console.log('速率:        ' + Math.round(args.spins / (elapsed / 1000)).toLocaleString() + ' spins/s');
console.log('');

console.log('─── 基础指标 ───');
console.log('RTP:         ' + fmt(rtp, 6));
console.log('hitRate:     ' + fmtPct(hitRate));
console.log('fsRate:      ' + fmtPct(fsRate));
console.log('fsHitRate:   ' + fmtPct(fsHitRate));
console.log('avgWin/hit:  ' + fmt(avgWinPerHit, 6));
console.log('avgTumble:   ' + fmt(avgTumble, 4));
console.log('maxTumble:   ' + maxTumble);
console.log('safetyHits:  ' + safetyHits);
console.log('');

console.log('─── RTP 分解 ───');
console.log('base game:   ' + fmt(baseRtp, 6) + '  (' + (baseRtp/rtp*100).toFixed(1) + '%)');
console.log('free spins:  ' + fmt(fsRtp, 6) + '  (' + (fsRtp/rtp*100).toFixed(1) + '%)');
console.log('');

console.log('─── 赢额分布 (每局, 单位=bet 倍数) ───');
console.log('mean:        ' + fmt(mu, 6));
console.log('variance:    ' + fmt(winsStats.variance(), 6));
console.log('std:         ' + fmt(std, 6));
console.log('CV:          ' + fmt(cv, 4));
console.log('min:         ' + fmt(winsStats.min, 4));
console.log('max:         ' + fmt(winsStats.max, 4));
console.log('');

console.log('─── 分位数 (每局赢额 / bet) [histogram 桶宽 ' + args.bucket + '] ───');
console.log('P50:         ' + fmt(p50, 4));
console.log('P75:         ' + fmt(p75, 4));
console.log('P90:         ' + fmt(p90, 4));
console.log('P95:         ' + fmt(p95, 4));
console.log('P99:         ' + fmt(p99, 4));
console.log('P99.9:       ' + fmt(p999, 4));
console.log('');

console.log('─── 置信区间 (95%, RTP) ───');
console.log('SE:          ' + fmt(se, 6));
console.log('CI95:        [' + fmt(ci95Lo, 6) + ', ' + fmt(ci95Hi, 6) + ']');
console.log('');

console.log('─── Bomb (仅在 Free Spins 期间) ───');
console.log('触发次数:     ' + bombCount);
console.log('avg mult:    ' + fmt(avgBombMult, 4));
console.log('');

console.log('─── 目标判定 ───');
console.log('目标模式:     ' + args.mode);
console.log('目标 RTP:     ' + modeCfg.rtpTarget);
console.log('目标区间:     [' + modeCfg.rtpRange[0] + ', ' + modeCfg.rtpRange[1] + ']');
if (args.mode === 'real') console.log('硬上限:       ' + modeCfg.hardCeiling);
console.log('实测 RTP:     ' + fmt(rtp, 6));
console.log('判定:         ' + verdict);
console.log('');

// ═══════════════ 退出码 ═══════════════
let exitCode = 0;
if (args.mode === 'demo') {
  if (rtp < modeCfg.rtpRange[0] || rtp > modeCfg.rtpRange[1]) exitCode = 1;
} else {
  if (rtp < 0.86) exitCode = 1;
  if (rtp > modeCfg.rtpRange[1]) exitCode = 1;
  if (rtp > modeCfg.hardCeiling) exitCode = 1;
}

console.log('═══════════════════════════════════════');
if (exitCode === 0) console.log('EXIT: 0 (' + verdict + ')');
else console.log('EXIT: ' + exitCode + ' (' + verdict + ')');
process.exit(exitCode);
