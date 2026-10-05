/* ============================================================
   Apex Olympius · Simulator.js
   大规模蒙特卡洛模拟 · 输出统计指标
   
   用途：
   - 验证 MathEngine 数学性质
   - P2 校准时反复调用，快速评估调参效果
   - 不依赖 DOM，可在 Node 直接跑
   ============================================================ */

import { playSpin } from './MathEngine.js';

/* ============ 单次模拟 ============ */
export function simulate({ spins, mode, bet = 10, seedBase = 1, onProgress }) {
  if (!Number.isFinite(spins) || spins <= 0) throw new Error('simulate: spins must be positive');
  if (mode !== 'demo' && mode !== 'real') throw new Error('simulate: mode must be demo | real');

  const stats = {
    mode,
    spins,
    bet,
    totalBet: spins * bet,
    totalWin: 0,
    hitCount: 0,
    fsTriggerCount: 0,
    retriggerCount: 0,
    totalTumbles: 0,
    tumbleDepthMax: 0,
    multiplierTotal: 0,
    multiplierTriggered: 0,
    scatterSum: 0,
    maxWinPerSpin: 0,
    maxMultInSpin: 0,
    winHistogram: [],
    rtp: 0,
    hitRate: 0,
    fsRate: 0,
    avgWin: 0,
    avgTumble: 0,
    avgMultiplier: 0,
    volatility: 0
  };

  const wins = new Array(spins);

  for (let i = 0; i < spins; i++) {
    const r = playSpin({ seed: seedBase + i, bet, mode });

    stats.totalWin += r.totalWin;
    if (r.totalWin > 0) stats.hitCount++;
    if (r.freeSpins) {
      stats.fsTriggerCount++;
      stats.retriggerCount += r.freeSpins.retriggers || 0;
    }
    stats.totalTumbles += r.tumbleRounds.length;
    if (r.tumbleRounds.length > stats.tumbleDepthMax) stats.tumbleDepthMax = r.tumbleRounds.length;
    if (r.multipliers && r.multipliers.length > 0) {
      stats.multiplierTriggered++;
      let sumMult = 0;
      for (const m of r.multipliers) sumMult += m.value;
      stats.multiplierTotal += sumMult;
      if (sumMult > stats.maxMultInSpin) stats.maxMultInSpin = sumMult;
    }
    stats.scatterSum += r.scatterCount;
    if (r.totalWin > stats.maxWinPerSpin) stats.maxWinPerSpin = r.totalWin;
    wins[i] = r.totalWin;

    if (onProgress && (i + 1) % Math.max(1, Math.floor(spins / 10)) === 0) {
      onProgress(i + 1, spins);
    }
  }

  // 派生统计
  stats.rtp = stats.totalWin / stats.totalBet;
  stats.hitRate = stats.hitCount / stats.spins;
  stats.fsRate = stats.fsTriggerCount / stats.spins;
  stats.avgWin = stats.totalWin / stats.spins;
  stats.avgTumble = stats.totalTumbles / stats.spins;
  stats.avgMultiplier = stats.multiplierTriggered > 0
    ? stats.multiplierTotal / stats.multiplierTriggered
    : 0;

  // 波动率：赢额标准差 / bet
  let sumSq = 0;
  const mean = stats.avgWin;
  for (let i = 0; i < spins; i++) sumSq += (wins[i] - mean) ** 2;
  const variance = sumSq / spins;
  stats.volatility = Math.sqrt(variance) / bet;

  return stats;
}

/* ============ 快速对比 demo/real ============ */
export function compare({ spins = 10000, bet = 10 } = {}) {
  const out = {};
  for (const mode of ['demo', 'real']) {
    out[mode] = simulate({ spins, mode, bet });
  }
  return out;
}

/* ============ 目标检查 ============ */
export const TARGETS = {
  demo: { rtpMin: 1.30, rtpMax: 2.50, hitMin: 0.45, hitMax: 0.60 },
  real: { rtpMin: 0.88, rtpMax: 0.93, hitMin: 0.20, hitMax: 0.35, rtpHardMax: 0.94 }
};

export function checkTargets(stats) {
  const t = TARGETS[stats.mode];
  if (!t) throw new Error('checkTargets: unknown mode ' + stats.mode);
  const results = {
    mode: stats.mode,
    rtp: stats.rtp,
    hitRate: stats.hitRate,
    passed: [],
    failed: []
  };
  const test = (name, cond) => (cond ? results.passed : results.failed).push(name);

  test('RTP ≥ min', stats.rtp >= t.rtpMin);
  test('RTP ≤ max', stats.rtp <= t.rtpMax);
  test('Hit Rate ≥ min', stats.hitRate >= t.hitMin);
  test('Hit Rate ≤ max', stats.hitRate <= t.hitMax);
  if (t.rtpHardMax !== undefined) test('RTP ≤ hardMax (硬失败条件)', stats.rtp <= t.rtpHardMax);

  results.ok = results.failed.length === 0;
  return results;
}

/* ============ 打印报告 ============ */
export function printReport(stats, targets) {
  const pct = v => (v * 100).toFixed(2) + '%';
  const pad = (s, n) => String(s).padEnd(n);
  const num = (v, n = 2) => Number(v).toFixed(n);

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  Simulator · ' + stats.mode.toUpperCase());
  console.log('═══════════════════════════════════════════');
  console.log('  局数：      ' + stats.spins.toLocaleString());
  console.log('  下注：      ' + stats.bet);
  console.log('  ───────────────────────────────');
  console.log('  RTP：       ' + pct(stats.rtp));
  console.log('  命中率：    ' + pct(stats.hitRate));
  console.log('  FS 触发：   ' + pct(stats.fsRate) + '  (≈1/' + Math.round(1/stats.fsRate) + ')');
  console.log('  ───────────────────────────────');
  console.log('  平均赢：    ' + num(stats.avgWin));
  console.log('  单局最大：  ' + num(stats.maxWinPerSpin));
  console.log('  单局最大倍：' + num(stats.maxMultInSpin) + 'x');
  console.log('  平均 Tumble：' + num(stats.avgTumble, 2));
  console.log('  最深 Tumble：' + stats.tumbleDepthMax);
  console.log('  平均倍率：  ' + num(stats.avgMultiplier));
  console.log('  波动率：    ' + num(stats.volatility, 3));
  console.log('  平均 Scatter：' + num(stats.scatterSum / stats.spins, 3) + ' 个/局');
  console.log('  ───────────────────────────────');

  if (targets) {
    const r = checkTargets(stats);
    console.log('  目标检查：');
    r.passed.forEach(n => console.log('    ✅ ' + n));
    r.failed.forEach(n => console.log('    ❌ ' + n));
    console.log('  结果：' + (r.ok ? '✅ 通过' : '❌ 未通过'));
  }
  console.log('═══════════════════════════════════════════');
  console.log('');
}

export const VERSION = 'olympius-simulator-v1.0.0';
