'use strict';
/* Apex · B-2 独立参考模拟器
 *
 * 核心要求：
 *   - 不 import 生产引擎（src/engine/*、tests/math/simulator-v2.cjs）
 *   - 从零独立实现 RNG / 抽样 / Pay Anywhere / Tumble / Scatter / FS
 *   - 只从 src/config/*.locked.js 解析数值（正则读文本，不 import）
 *   - 可用 seed 复现
 *   - 与生产模拟器对比 RTP / hitRate
 *
 * 局限：
 *   本模拟器是独立**第二实现**，用于交叉验证。
 *   不能替代生产引擎或真实 D1 测试。
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

// ============ 1. 从源码文本解析数值（不 import） ============

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}

function parseMathProfile() {
  const txt = readFile('src/config/math-profile.js');
  // 精确定位：带前导换行的模式块，避免匹配顶部注释里的 real/demo 单词
  const blocks = {};
  for (const mode of ['real', 'demo']) {
    const startRe = new RegExp('\\n\\s*' + mode + '\\s*:\\s*Object\\.freeze\\(\\{');
    const m = startRe.exec(txt);
    if (!m) throw new Error('math-profile: block ' + mode + ' not found');
    const s0 = m.index + m[0].length;
    const endRe = /\n\s*(real|demo)\s*:\s*Object\.freeze\(\{|\n\s*\}\s*\}\)\s*;/;
    const em = endRe.exec(txt.slice(s0));
    const e0 = em ? s0 + em.index : txt.length;
    blocks[mode] = txt.slice(s0, e0);
  }
  const result = {};
  for (const mode of ['real', 'demo']) {
    const block = blocks[mode];
    const bwRe = /baseWeights\s*:\s*Object\.freeze\(\{([\s\S]*?)\}\)/;
    const bwM = bwRe.exec(block);
    if (!bwM) throw new Error('math-profile: baseWeights ' + mode + ' not found');
    const weights = {};
    const wRe = /([A-Z_]+)\s*:\s*(\d+)/g;
    let wm;
    while ((wm = wRe.exec(bwM[1])) !== null) {
      weights[wm[1]] = parseInt(wm[2], 10);
    }
    const psm = /payScale\s*:\s*([0-9.]+)/.exec(block);
    const ssm = /scatterWeight\s*:\s*(\d+)/.exec(block);
    const msm = /multiplierWeight\s*:\s*(\d+)/.exec(block);
    const prm = /pityRate\s*:\s*([0-9.]+)/.exec(block);
    const psm2 = /pitySymbol\s*:\s*(?:'([^']+)'|null)/.exec(block);
    const psm3 = /pityMinCount\s*:\s*(\d+)/.exec(block);
    result[mode] = {
      baseWeights: weights,
      payScale: psm ? parseFloat(psm[1]) : 1,
      scatterWeight: ssm ? parseInt(ssm[1], 10) : 0,
      multiplierWeight: msm ? parseInt(msm[1], 10) : 0,
      pityRate: prm ? parseFloat(prm[1]) : 0,
      pitySymbol: psm2 ? psm2[1] : null,
      pityMinCount: psm3 ? parseInt(psm3[1], 10) : 8,
    };
  }
  return result;
}
function parsePaytable() {
  const txt = readFile('src/config/paytable.locked.js');
  const table = {};
  // 每行形如 'BANANA: Object.freeze({ 8: 0.25, 10: 0.75, 12: 2 }),'
  const re = /([A-Z_]+)\s*:\s*Object\.freeze\(\{\s*8:\s*([0-9.]+),\s*10:\s*([0-9.]+),\s*12:\s*([0-9.]+)\s*\}\)/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    table[m[1]] = { 8: parseFloat(m[2]), 10: parseFloat(m[3]), 12: parseFloat(m[4]) };
  }
  if (Object.keys(table).length === 0) throw new Error('paytable: empty');
  return table;
}

function parseBonusRules() {
  const txt = readFile('src/engine/bonus.js');
  const triggerScatterCount = parseInt((/triggerScatterCount\s*:\s*(\d+)/.exec(txt) || [0, '4'])[1], 10);
  const initialSpins = parseInt((/initialSpins\s*:\s*(\d+)/.exec(txt) || [0, '10'])[1], 10);
  const retriggerScatterCount = parseInt((/retriggerScatterCount\s*:\s*(\d+)/.exec(txt) || [0, '4'])[1], 10);
  const retriggerSpins = parseInt((/retriggerSpins\s*:\s*(\d+)/.exec(txt) || [0, '10'])[1], 10);
  const payRe = /scatterPayouts\s*:\s*Object\.freeze\(\{\s*4:\s*(\d+),\s*5:\s*(\d+),\s*6:\s*(\d+)/;
  const pm = payRe.exec(txt);
  const scatterPayouts = pm ? { 4: parseInt(pm[1],10), 5: parseInt(pm[2],10), 6: parseInt(pm[3],10) } : { 4:3, 5:5, 6:100 };
  return { triggerScatterCount, initialSpins, retriggerScatterCount, retriggerSpins, scatterPayouts };
}

// ============ 2. 独立 RNG（xorshift32，可复现） ============

function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h === 0 ? 1 : h;
}

function makeRng(seed) {
  let state = hashSeed(String(seed));
  return {
    nextUint32() {
      let x = state;
      x ^= (x << 13) >>> 0; x = x >>> 0;
      x ^= x >>> 17;
      x ^= (x << 5) >>> 0;
      state = x >>> 0;
      return state;
    },
    nextInt(max) {
      if (!Number.isSafeInteger(max) || max <= 0) throw new Error('nextInt: bad max');
      const limit = Math.floor(0x100000000 / max) * max;
      let n;
      do { n = this.nextUint32(); } while (n >= limit);
      return n % max;
    },
  };
}

// ============ 3. 独立符号池 ============

function makeSymbolPool(profile) {
  const weights = profile.baseWeights;
  const idMap = {
    BANANA: 'banana', GRAPE: 'grape', WATERMELON: 'watermelon',
    PLUM: 'plum', APPLE: 'apple', BLUE_CANDY: 'blue_candy',
    GREEN_CANDY: 'green_candy', PURPLE_CANDY: 'purple_candy',
    RED_HEART: 'red_heart_candy',
  };
  const entries = [];
  for (const k of Object.keys(weights)) {
    if (!idMap[k]) continue;
    entries.push({ id: idMap[k], paytableKey: k, w: weights[k] });
  }
  if (profile.scatterWeight > 0) entries.push({ id: 'lollipop', paytableKey: null, w: profile.scatterWeight });
  if (profile.multiplierWeight > 0) entries.push({ id: 'multiplier_bomb', paytableKey: null, w: profile.multiplierWeight });
  const total = entries.reduce((s, e) => s + e.w, 0);
  return { entries, total };
}

function pickSymbol(rng, pool) {
  let roll = rng.nextInt(pool.total);
  for (const e of pool.entries) {
    if (roll < e.w) return e.id;
    roll -= e.w;
  }
  throw new Error('pickSymbol: exhausted');
}


// ============ 3b. Pity 注入（demo 专用） ============
// 语义：若首轮无中奖，按 pityRate 概率强制注入 pityMinCount 个 pitySymbol。
// 对齐生产 src/js/math/simulator.js 的 injectPity。
function injectPity(grid, symbol, minCount) {
  const g = grid.slice();
  let cur = 0;
  for (let i = 0; i < g.length; i++) if (g[i] === symbol) cur++;
  let need = minCount - cur;
  if (need <= 0) return g;
  for (let i = 0; i < g.length && need > 0; i++) {
    if (g[i] !== symbol) { g[i] = symbol; need--; }
  }
  return g;
}

// ============ 4. 独立 Pay Anywhere 评估 ============

function lookupPay(paytable, key, count) {
  const t = paytable[key];
  if (!t) return 0;
  if (count >= 12) return t[12];
  if (count >= 10) return t[10];
  if (count >= 8)  return t[8];
  return 0;
}

function evaluate(grid, paytable) {
  // 独立实现：统计 + 判定
  const counts = {};
  const positions = {};
  for (let i = 0; i < grid.length; i++) {
    const s = grid[i];
    counts[s] = (counts[s] || 0) + 1;
    (positions[s] = positions[s] || []).push(i);
  }
  let payoutMultiplier = 0;
  let winningPositions = [];
  let scatterCount = 0;
  let multiplierPositions = [];
  for (const sym of Object.keys(counts)) {
    const cnt = counts[sym];
    if (sym === 'lollipop') { scatterCount = cnt; continue; }
    if (sym === 'multiplier_bomb') { multiplierPositions = multiplierPositions.concat(positions[sym]); continue; }
    const pkey = {
      banana: 'BANANA', grape: 'GRAPE', watermelon: 'WATERMELON',
      plum: 'PLUM', apple: 'APPLE', blue_candy: 'BLUE_CANDY',
      green_candy: 'GREEN_CANDY', purple_candy: 'PURPLE_CANDY',
      red_heart_candy: 'RED_HEART',
    }[sym];
    if (!pkey) continue;
    const p = lookupPay(paytable, pkey, cnt);
    if (p > 0) {
      payoutMultiplier += p;
      winningPositions = winningPositions.concat(positions[sym]);
    }
  }
  return { payoutMultiplier, winningPositions, scatterCount, multiplierPositions };
}

// ============ 5. 独立 Tumble ============

function tumble(grid, winningPositions, rng, pool) {
  const COLS = 6, ROWS = 5;
  const kill = new Set(winningPositions);
  const next = grid.slice();
  for (let c = 0; c < COLS; c++) {
    const survivors = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      const idx = r * COLS + c;
      if (!kill.has(idx)) survivors.push(grid[idx]);
    }
    let writeRow = ROWS - 1;
    for (const s of survivors) {
      next[writeRow * COLS + c] = s;
      writeRow--;
    }
    while (writeRow >= 0) {
      next[writeRow * COLS + c] = pickSymbol(rng, pool);
      writeRow--;
    }
  }
  return next;
}

// ============ 6. 独立 Scatter 派彩 ============

function scatterPayout(count, rules) {
  if (count >= 6) return rules.scatterPayouts[6];
  if (count >= 5) return rules.scatterPayouts[5];
  if (count >= 4) return rules.scatterPayouts[4];
  return 0;
}

// ============ 7. 完整 spin（独立实现） ============

function baseSpin(rng, pool, paytable, bonusRules, gridOverride) {
  const COLS = 6, ROWS = 5;
  const SIZE = COLS * ROWS;
  const MAX_TUMBLE = 100;
  let grid;
  if (gridOverride) {
    grid = gridOverride.slice();
  } else {
    grid = new Array(SIZE);
    for (let i = 0; i < SIZE; i++) grid[i] = pickSymbol(rng, pool);
  }
  let totalMultiplier = 0;
  let cascades = 0;
  let scatterCountFirst = 0;
  let bonusTriggered = false;
  for (let step = 0; step < MAX_TUMBLE; step++) {
    const ev = evaluate(grid, paytable);
    cascades++;
    if (step === 0) {
      scatterCountFirst = ev.scatterCount;
      if (scatterCountFirst >= bonusRules.triggerScatterCount) bonusTriggered = true;
    }
    if (ev.winningPositions.length === 0) break;
    totalMultiplier += ev.payoutMultiplier;
    grid = tumble(grid, ev.winningPositions, rng, pool);
  }
  const scatterWin = scatterPayout(scatterCountFirst, bonusRules);
  totalMultiplier += scatterWin;
  return { totalMultiplier, cascades, scatterCountFirst, bonusTriggered };
}

// ============ 8. 完整模拟（含 FS） ============

function simulateOneSpin(rng, pool, paytable, bonusRules, profile) {
  // Pity 注入（demo）：先生成 grid，无中奖时按概率强制注入 pitySymbol
  let gridOverride = null;
  if (profile.pityRate > 0 && profile.pitySymbol) {
    const g0 = new Array(30);
    for (let i = 0; i < 30; i++) g0[i] = pickSymbol(rng, pool);
    const pre = evaluate(g0, paytable);
    if (pre.winningPositions.length === 0 && rng.nextInt(10000) < profile.pityRate * 10000) {
      gridOverride = injectPity(g0, profile.pitySymbol.toLowerCase(), profile.pityMinCount);
    } else {
      gridOverride = g0;
    }
  }
  const base = baseSpin(rng, pool, paytable, bonusRules, gridOverride);
  let totalMultiplier = base.totalMultiplier;
  let fsSpins = 0;
  let fsMultiplierSum = 0;
  if (base.bonusTriggered) {
    let remaining = bonusRules.initialSpins;
    let guard = 0;
    while (remaining > 0 && guard < 1000) {
      remaining--;
      fsSpins++;
      const fs = baseSpin(rng, pool, paytable, bonusRules);
      fsMultiplierSum += fs.totalMultiplier;
      if (fs.bonusTriggered) remaining += bonusRules.retriggerSpins;
      guard++;
    }
  }
  totalMultiplier += fsMultiplierSum;
  return {
    totalMultiplier,
    cascades: base.cascades,
    bonusTriggered: base.bonusTriggered,
    fsSpins,
    fsMultiplierSum,
  };
}

function simulate(opts) {
  opts = opts || {};
  const mode = opts.mode || 'real';
  const spins = opts.spins | 0;
  const betMinor = opts.betMinor | 0;
  const seed = opts.seed == null ? 'ref-v1' : String(opts.seed);
  if (spins <= 0) throw new Error('simulate: spins must be > 0');
  if (betMinor <= 0) throw new Error('simulate: betMinor must be > 0');

  const profiles = parseMathProfile();
  const profile = profiles[mode];
  if (!profile) throw new Error('simulate: unknown mode ' + mode);
  const paytable = parsePaytable();
  const bonusRules = parseBonusRules();
  const pool = makeSymbolPool(profile);
  const rng = makeRng(seed);

  let wagered = 0, paid = 0, hits = 0, bonusTriggered = 0;
  let totalCascades = 0, totalFsSpins = 0, totalFsMultiplier = 0;
  let maxMult = 0;
  const wins = new Array(spins);
  for (let i = 0; i < spins; i++) {
    const r = simulateOneSpin(rng, pool, paytable, bonusRules, profile);
    wagered += betMinor;
    const winMinor = Math.floor(betMinor * r.totalMultiplier * profile.payScale);
    paid += winMinor;
    wins[i] = winMinor / betMinor;
    if (winMinor > 0) hits++;
    if (r.bonusTriggered) bonusTriggered++;
    totalCascades += r.cascades;
    totalFsSpins += r.fsSpins;
    totalFsMultiplier += r.fsMultiplierSum;
    if (wins[i] > maxMult) maxMult = wins[i];
  }
  wins.sort((a, b) => a - b);
  const q = (p) => wins.length ? wins[Math.floor(p * (wins.length - 1))] : 0;

  return {
    mode, spins, seed, betMinor,
    wagered, paid,
    rtp: paid / wagered,
    hitRate: hits / spins,
    bonusRate: bonusTriggered / spins,
    avgCascades: totalCascades / spins,
    avgFsSpins: totalFsSpins / spins,
    avgFsMultiplier: totalFsMultiplier / spins,
    maxWinUnits: maxMult,
    median: q(0.5), p95: q(0.95), p99: q(0.99),
  };
}

// ============ 9. CLI ============

function parseArgs(argv) {
  const out = { mode: 'real', spins: 100000, seed: 'ref-v1', betMinor: 100 };
  for (const a of argv) {
    let m;
    if ((m = /^--mode=(.+)$/.exec(a))) out.mode = m[1];
    else if ((m = /^--spins=(\d+)$/.exec(a))) out.spins = parseInt(m[1], 10);
    else if ((m = /^--seed=(.+)$/.exec(a))) out.seed = m[1];
    else if ((m = /^--betMinor=(\d+)$/.exec(a))) out.betMinor = parseInt(m[1], 10);
  }
  return out;
}

function cli() {
  const args = parseArgs(process.argv.slice(2));
  const r = simulate(args);
  console.log('=== Apex 独立参考模拟器 ===');
  console.log('  mode     :', r.mode);
  console.log('  spins    :', r.spins);
  console.log('  seed     :', r.seed);
  console.log('  betMinor :', r.betMinor);
  console.log('');
  console.log('  RTP       =', r.rtp.toFixed(4));
  console.log('  hitRate   =', r.hitRate.toFixed(4));
  console.log('  bonusRate =', r.bonusRate.toFixed(4));
  console.log('  avgCascades   =', r.avgCascades.toFixed(3));
  console.log('  avgFsSpins    =', r.avgFsSpins.toFixed(3));
  console.log('  avgFsMultiplier =', r.avgFsMultiplier.toFixed(3));
  console.log('  maxWinUnits   =', r.maxWinUnits.toFixed(2));
  console.log('  median/p95/p99 =', r.median.toFixed(2), '/', r.p95.toFixed(2), '/', r.p99.toFixed(2));
}

// 双用：直接跑（node sim.cjs）或 require
if (require.main === module) {
  cli();
} else {
  module.exports = {
    simulate,
    simulateOneSpin,
    evaluate,
    tumble,
    baseSpin,
    parseMathProfile,
    parsePaytable,
    parseBonusRules,
    makeRng,
    makeSymbolPool,
  };
}

