/* ============================================================
   Apex Olympius · Simulator.js v3
   补全指标：Median/P90/P95、Base vs Bonus RTP、Multiplier 组合、
             Near Bonus、Big/Mega/Epic 分级、Zero Streak 分位
   ============================================================ */

import { playSpin } from "./MathEngine.js";

export function simulate({ spins, mode, bet = 10, seedBase = 1 }) {
  if (!Number.isFinite(spins) || spins <= 0) throw new Error("simulate: spins must be positive");
  if (mode !== "demo" && mode !== "real") throw new Error("simulate: mode must be demo | real");

  const stats = {
    mode, spins, bet,
    totalBet: spins * bet,
    totalWin: 0,
    baseWinTotal: 0,
    fsWinTotal: 0,
    scatterWinTotal: 0,
    hitCount: 0,
    fsTriggerCount: 0,
    retriggerCount: 0,
    fsTotalWin: 0,
    totalTumbles: 0,
    tumbleDepthMax: 0,
    multiplierTotal: 0,
    multiplierTriggered: 0,
    multiMultiplierCount: 0,  // 单局多次累加
    scatterSum: 0,
    nearBonusCount: 0,       // 恰好 3 Scatter
    maxWinPerSpin: 0,
    maxMultInSpin: 0,
    bigWinCount: 0,          // ≥10x
    megaWinCount: 0,         // ≥50x
    epicWinCount: 0,         // ≥100x
    bigWinAmounts: [],
    zeroStreaks: [],
    winMults: [],
    zeroStreakCur: 0,
    tumbleBuckets: { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5+": 0 },
    multBuckets: {},
    winBuckets: {
      "zero": 0, "0-1x": 0, "1-2x": 0, "2-5x": 0, "5-10x": 0,
      "10-50x": 0, "50-100x": 0, "100-500x": 0, "500x+": 0
    }
  };

  for (let i = 0; i < spins; i++) {
    const r = playSpin({ seed: seedBase + i, bet, mode });
    const winMult = r.totalWin / bet;

    // 累加赢额
    stats.totalWin += r.totalWin;
    stats.baseWinTotal += r.baseWin * r.totalMultiplier;
    if (r.freeSpins) stats.fsWinTotal += r.freeSpins.totalWin;
    stats.scatterWinTotal += r.scatterWin;

    // hit / zero streak
    if (r.totalWin > 0) {
      stats.hitCount++;
      if (stats.zeroStreakCur > 0) stats.zeroStreaks.push(stats.zeroStreakCur);
      stats.zeroStreakCur = 0;
    } else {
      stats.zeroStreakCur++;
    }

    // FS / Near Bonus
    if (r.freeSpins) {
      stats.fsTriggerCount++;
      stats.retriggerCount += r.freeSpins.retriggers || 0;
      stats.fsTotalWin += r.freeSpins.totalWin;
    }
    if (r.scatterCount === 3) stats.nearBonusCount++;

    // Tumble
    const td = r.tumbleRounds.length;
    stats.totalTumbles += td;
    if (td > stats.tumbleDepthMax) stats.tumbleDepthMax = td;
    if (td === 0) stats.tumbleBuckets["0"]++;
    else if (td === 1) stats.tumbleBuckets["1"]++;
    else if (td === 2) stats.tumbleBuckets["2"]++;
    else if (td === 3) stats.tumbleBuckets["3"]++;
    else if (td === 4) stats.tumbleBuckets["4"]++;
    else stats.tumbleBuckets["5+"]++;

    // Multiplier
    if (r.multipliers && r.multipliers.length > 0) {
      stats.multiplierTriggered++;
      let sumMult = 0;
      for (const m of r.multipliers) {
        sumMult += m.value;
        const k = m.value + "x";
        stats.multBuckets[k] = (stats.multBuckets[k] || 0) + 1;
      }
      stats.multiplierTotal += sumMult;
      if (sumMult > stats.maxMultInSpin) stats.maxMultInSpin = sumMult;
      if (r.multipliers.length > 1) stats.multiMultiplierCount++;
    }

    stats.scatterSum += r.scatterCount;
    if (r.totalWin > stats.maxWinPerSpin) stats.maxWinPerSpin = r.totalWin;

    // Big Win 分级
    if (winMult >= 10) stats.bigWinCount++;
    if (winMult >= 50) stats.megaWinCount++;
    if (winMult >= 100) stats.epicWinCount++;
    if (winMult >= 10) stats.bigWinAmounts.push(winMult);

    // Win 分布桶
    if (r.totalWin === 0) stats.winBuckets["zero"]++;
    else if (winMult < 1) stats.winBuckets["0-1x"]++;
    else if (winMult < 2) stats.winBuckets["1-2x"]++;
    else if (winMult < 5) stats.winBuckets["2-5x"]++;
    else if (winMult < 10) stats.winBuckets["5-10x"]++;
    else if (winMult < 50) stats.winBuckets["10-50x"]++;
    else if (winMult < 100) stats.winBuckets["50-100x"]++;
    else if (winMult < 500) stats.winBuckets["100-500x"]++;
    else stats.winBuckets["500x+"]++;

    stats.winMults.push(winMult);
  }

  // 收尾空转
  if (stats.zeroStreakCur > 0) stats.zeroStreaks.push(stats.zeroStreakCur);

  // 排序 + 分位
  stats.winMults.sort((a, b) => a - b);
  const N = stats.winMults.length;
  const percentile = (arr, p) => arr[Math.min(N - 1, Math.floor(N * p))];
  stats.winMedian = N ? percentile(stats.winMults, 0.5) : 0;
  stats.winP90    = N ? percentile(stats.winMults, 0.90) : 0;
  stats.winP95    = N ? percentile(stats.winMults, 0.95) : 0;
  stats.winP99    = N ? percentile(stats.winMults, 0.99) : 0;

  stats.zeroStreaks.sort((a, b) => a - b);
  const Z = stats.zeroStreaks.length;
  stats.zeroP50 = Z ? stats.zeroStreaks[Math.floor(Z * 0.5)] : 0;
  stats.zeroP95 = Z ? stats.zeroStreaks[Math.floor(Z * 0.95)] : 0;
  stats.zeroMax = Z ? stats.zeroStreaks[Z - 1] : 0;

  // 派生
  stats.rtp = stats.totalWin / stats.totalBet;
  stats.baseRtp = stats.baseWinTotal / stats.totalBet;
  stats.fsRtp = stats.fsWinTotal / stats.totalBet;
  stats.scatterRtp = stats.scatterWinTotal / stats.totalBet;
  stats.hitRate = stats.hitCount / stats.spins;
  stats.fsRate = stats.fsTriggerCount / stats.spins;
  stats.nearBonusRate = stats.nearBonusCount / stats.spins;
  stats.bigWinRate = stats.bigWinCount / stats.spins;
  stats.megaWinRate = stats.megaWinCount / stats.spins;
  stats.epicWinRate = stats.epicWinCount / stats.spins;
  stats.avgWin = stats.totalWin / stats.spins;
  stats.avgTumble = stats.totalTumbles / stats.spins;
  stats.avgMultiplier = stats.multiplierTriggered > 0
    ? stats.multiplierTotal / stats.multiplierTriggered : 0;
  stats.avgFsWin = stats.fsTriggerCount > 0
    ? stats.fsTotalWin / stats.fsTriggerCount : 0;
  stats.multiMultiplierRate = stats.multiMultiplierCount / stats.spins;

  // 波动率
  let sumSq = 0;
  const mean = stats.avgWin;
  for (let i = 0; i < N; i++) sumSq += (stats.winMults[i] - mean/bet) ** 2;
  stats.volatility = Math.sqrt(sumSq / N);

  return stats;
}

export const TARGETS = {
  demo: { rtpMin: 1.30, rtpMax: 2.50, hitMin: 0.45, hitMax: 0.60 },
  real: { rtpMin: 0.88, rtpMax: 0.93, hitMin: 0.20, hitMax: 0.35, rtpHardMax: 0.94 }
};

export function checkTargets(stats) {
  const t = TARGETS[stats.mode];
  const r = { mode: stats.mode, passed: [], failed: [] };
  const test = (n, c) => (c ? r.passed : r.failed).push(n);
  test("RTP ≥ min", stats.rtp >= t.rtpMin);
  test("RTP ≤ max", stats.rtp <= t.rtpMax);
  test("Hit ≥ min", stats.hitRate >= t.hitMin);
  test("Hit ≤ max", stats.hitRate <= t.hitMax);
  if (t.rtpHardMax !== undefined) test("RTP ≤ hardMax", stats.rtp <= t.rtpHardMax);
  r.ok = r.failed.length === 0;
  return r;
}

export function printReport(stats) {
  const pct = v => (v * 100).toFixed(2) + "%";
  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("  " + stats.mode.toUpperCase() + " · " + stats.spins.toLocaleString() + " 局");
  console.log("═══════════════════════════════════════════");
  console.log("  RTP：          " + pct(stats.rtp));
  console.log("    Base 贡献：  " + pct(stats.baseRtp));
  console.log("    FS 贡献：    " + pct(stats.fsRtp));
  console.log("    Scatter 贡献：" + pct(stats.scatterRtp));
  console.log("  命中率：       " + pct(stats.hitRate));
  console.log("  大赢率 ≥10x：  " + pct(stats.bigWinRate));
  console.log("  Mega ≥50x：    " + pct(stats.megaWinRate));
  console.log("  Epic ≥100x：   " + pct(stats.epicWinRate));
  console.log("  FS 触发：      " + pct(stats.fsRate) + " (≈1/" + Math.round(1/stats.fsRate) + ")");
  console.log("  Near Bonus(3): " + pct(stats.nearBonusRate));
  console.log("  ───────────────────────────────");
  console.log("  Win Median：   " + stats.winMedian.toFixed(3) + "x");
  console.log("  Win P90：      " + stats.winP90.toFixed(3) + "x");
  console.log("  Win P95：      " + stats.winP95.toFixed(3) + "x");
  console.log("  Win P99：      " + stats.winP99.toFixed(3) + "x");
  console.log("  最大 Win：     " + (stats.maxWinPerSpin/stats.bet).toFixed(1) + "x");
  console.log("  波动率：       " + stats.volatility.toFixed(3));
  console.log("  ───────────────────────────────");
  console.log("  Zero P50：     " + stats.zeroP50 + " 局");
  console.log("  Zero P95：     " + stats.zeroP95 + " 局");
  console.log("  Zero Max：     " + stats.zeroMax + " 局");
  console.log("  ───────────────────────────────");
  console.log("  平均 Tumble：  " + stats.avgTumble.toFixed(3));
  console.log("  最深 Tumble：  " + stats.tumbleDepthMax);
  console.log("  平均倍率：     " + stats.avgMultiplier.toFixed(2));
  console.log("  最大倍率：     " + stats.maxMultInSpin.toFixed(0) + "x");
  console.log("  多次累加率：   " + pct(stats.multiMultiplierRate));
  console.log("  ───────────────────────────────");
  console.log("  Tumble 分布：");
  Object.entries(stats.tumbleBuckets).forEach(([k, v]) => {
    if (v > 0) console.log("    " + k.padEnd(4) + "  " + (v/stats.spins*100).toFixed(2).padStart(6) + "%");
  });
  console.log("  赢额分布：");
  Object.entries(stats.winBuckets).forEach(([k, v]) => {
    if (v > 0) console.log("    " + k.padEnd(10) + "  " + (v/stats.spins*100).toFixed(2).padStart(6) + "%");
  });
  console.log("  倍率分布：");
  Object.entries(stats.multBuckets).sort((a,b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([k, v]) => console.log("    " + k.padEnd(6) + "  " + v + " 次"));
  const r = checkTargets(stats);
  console.log("  ───────────────────────────────");
  console.log("  目标检查：" + (r.ok ? "✅ 通过" : "❌ 未通过"));
  r.failed.forEach(n => console.log("    ❌ " + n));
  console.log("═══════════════════════════════════════════");
}

export const VERSION = "olympius-simulator-v3.0.0";
