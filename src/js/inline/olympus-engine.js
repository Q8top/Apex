/* Apex Olympus Engine v1.0
 * 纯前端游戏引擎：符号 / 权重随机 / 中奖判定 / Tumble / 倍率 / 免费旋转
 * 依赖：crypto.getRandomValues（项目硬约束）
 */
(function(){
'use strict';

/* ============ 安全随机 ============ */
function randU32(){
  var buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0];
}
function randInt(n){ return randU32() % n; }
function randFloat(){ return randU32() / 4294967296; }

/* ============ 符号定义 ============ */
/* id / key / name / 3 档赔付（8连 / 10连 / 12+连，单位：倍下注） / 权重 */
var SYMBOLS = [
  { id:0, key:'crown',    name:'皇冠',   pay:[2.0, 6.0, 25.0], weight:4,  kind:'high' },
  { id:1, key:'red',      name:'红宝石', pay:[1.5, 4.0, 15.0], weight:6,  kind:'gem'  },
  { id:2, key:'purple',   name:'紫宝石', pay:[1.2, 3.0, 10.0], weight:7,  kind:'gem'  },
  { id:3, key:'yellow',   name:'黄宝石', pay:[0.9, 2.0,  8.0], weight:9,  kind:'gem'  },
  { id:4, key:'green',    name:'绿宝石', pay:[0.7, 1.5,  6.0], weight:10, kind:'gem'  },
  { id:5, key:'blue',     name:'蓝宝石', pay:[0.5, 1.2,  5.0], weight:12, kind:'gem'  },
  { id:6, key:'goblet',   name:'圣杯',   pay:[0.3, 0.8,  3.0], weight:13, kind:'low'  },
  { id:7, key:'hourglass',name:'沙漏',   pay:[0.2, 0.5,  2.0], weight:15, kind:'low'  },
  { id:8, key:'wild',     name:'WILD',   pay:[0,   0,    0  ], weight:2,  kind:'wild' },
  { id:9, key:'scatter',  name:'SCATTER',pay:[0,   0,    0  ], weight:1,  kind:'scatter' }
];

var SYM_COUNT = SYMBOLS.length;
var TOTAL_WEIGHT = SYMBOLS.reduce(function(a,s){ return a + s.weight; }, 0);

/* 倍率符号池 */
var MULTIPLIERS = [
  {v:2,   w:40}, {v:3,   w:30}, {v:5,   w:18}, {v:10,  w:6},
  {v:15,  w:3},  {v:20,  w:1.5},{v:25,  w:1},  {v:50,  w:0.3},
  {v:100, w:0.15},{v:500, w:0.05}
];
var MULT_TOTAL_W = MULTIPLIERS.reduce(function(a,m){ return a + m.w; }, 0);

/* ============ 模式配置 ============ */
var CONFIG = {
  demo: {
    /* 免费试玩：RTP 130~250%，命中率 45~60% */
    minMatch: 8,
    hitRateTarget: 0.52,
    rtpTarget: 1.75,
    payScale: 1.75,               // 主局赔付缩放
    fsPayScale: 0.55,             // FS 内部赔付缩放（防爆炸）
    scatterWeightBoost: 20.0,      // Scatter 权重（触发频率 1/30~1/40）
    multProb: 0.08,               // FS 中每次降倍率概率（大砍）
    freeSpinRetrigger: 0.10       // FS 重触发概率（大砍）
  },
  real: {
    /* 真实模式：RTP 88~93%（≤94%），命中率 20~35% */
    minMatch: 9,
    hitRateTarget: 0.27,
    rtpTarget: 0.905,
    payScale: 1.50,               // 校准到 1.50（目标 88~93%）
    fsPayScale: 1.30,             // FS 内部赔付（略低于主局）
    scatterWeightBoost: 1.0,
    multProb: 0.12,
    freeSpinRetrigger: 0.10
  }
};

/* ============ 权重随机 ============ */
function pickSymbol(cfg){
  var weights = SYMBOLS.map(function(s){
    if (s.kind === 'scatter') return s.weight * cfg.scatterWeightBoost;
    return s.weight;
  });
  var total = weights.reduce(function(a,b){ return a+b; }, 0);
  var r = randInt(Math.max(1, Math.floor(total * 1000)));
  r = r / 1000;
  var acc = 0;
  for (var i = 0; i < SYM_COUNT; i++) {
    acc += weights[i];
    if (r < acc) return i;
  }
  return 7;
}

function pickMultiplier(){
  var r = randInt(Math.max(1, Math.floor(MULT_TOTAL_W * 1000))) / 1000;
  var acc = 0;
  for (var i = 0; i < MULTIPLIERS.length; i++) {
    acc += MULTIPLIERS[i].w;
    if (r < acc) return MULTIPLIERS[i].v;
  }
  return 2;
}

/* ============ 网格 ============ */
var COLS = 6, ROWS = 5;
function makeGrid(cfg){
  var g = [];
  for (var r = 0; r < ROWS; r++) {
    var row = [];
    for (var c = 0; c < COLS; c++) row.push(pickSymbol(cfg));
    g.push(row);
  }
  return g;
}

/* ============ 中奖判定 ============ */
/* Olympus 机制：任意位置 8 个以上同符号即中奖（不含 wild/scatter 单独计） */
function countSymbols(grid){
  var counts = {};
  for (var r = 0; r < ROWS; r++)
    for (var c = 0; c < COLS; c++) {
      var s = grid[r][c];
      if (s === 8 || s === 9) continue; // wild / scatter 不单独计
      counts[s] = (counts[s] || 0) + 1;
    }
  // wild 可补任意符号：给每个符号都加 wild 数
  var wildCount = 0;
  for (var r = 0; r < ROWS; r++)
    for (var c = 0; c < COLS; c++)
      if (grid[r][c] === 8) wildCount++;
  return { counts: counts, wild: wildCount };
}

/* 返回：{ hits:[{sym,count,pay}], scatter: count, totalWin } */
function evaluateGrid(grid, bet, cfg, payScaleOverride){
  var cs = countSymbols(grid);
  var hits = [];
  var totalWin = 0;
  var scale = (payScaleOverride !== undefined) ? payScaleOverride : cfg.payScale;
  for (var sym = 0; sym <= 7; sym++) {
    var base = cs.counts[sym] || 0;
    if (base === 0) continue;
    var total = base + cs.wild;
    if (total < cfg.minMatch) continue;
    var symDef = SYMBOLS[sym];
    var tier = total >= 12 ? 2 : (total >= 10 ? 1 : 0);
    var payMulti = symDef.pay[tier] * scale;
    var win = payMulti * bet;
    hits.push({ sym: sym, count: total, pay: win, tier: tier });
    totalWin += win;
  }
  // scatter 单独统计
  var scatterCount = 0;
  for (var r = 0; r < ROWS; r++)
    for (var c = 0; c < COLS; c++)
      if (grid[r][c] === 9) scatterCount++;
  return { hits: hits, scatter: scatterCount, totalWin: totalWin };
}

/* ============ Tumble 掉落 ============ */
/* 返回新网格 + 掉落符号位置列表（供动画使用） */
function tumble(grid, removedSet, cfg){
  var newGrid = grid.map(function(row){ return row.slice(); });
  var drops = []; // { col, fromRow, toRow, sym }
  for (var c = 0; c < COLS; c++) {
    var column = [];
    for (var r = 0; r < ROWS; r++) {
      if (!removedSet[r + ',' + c]) column.push(newGrid[r][c]);
    }
    var newCount = COLS > 0 ? 0 : 0;
    var missing = ROWS - column.length;
    var newSymbols = [];
    for (var i = 0; i < missing; i++) newSymbols.push(pickSymbol(cfg));
    var finalCol = newSymbols.concat(column);
    for (var r = 0; r < ROWS; r++) {
      newGrid[r][c] = finalCol[r];
    }
    // 记录掉落轨迹
    for (var r = 0; r < ROWS; r++) {
      drops.push({ col: c, row: r, sym: newGrid[r][c], isNew: r < missing });
    }
  }
  return { grid: newGrid, drops: drops };
}

/* ============ 免费旋转 ============ */
/* 机制：
 *   - 4/5/6 scatter → 15/20/25 次免费旋转
 *   - 每次 FS 内部也跑基础局（tumble）
 *   - FS 期间降落的倍率符号会累加到本轮总倍率（不重置）
 *   - 每次 FS 有概率重触发（cfg.freeSpinRetrigger）
 *   - 所有 FS 中奖 × 本轮总倍率
 */
function playFreeSpins(cfg, count){
  var total = 0;
  var spins = [];
  var accumulatedMult = 0;   // 本轮累计倍率
  var remaining = count;
  var played = 0;
  var MAX_LOOP = 500;

  while (remaining > 0 && played < MAX_LOOP) {
    played++;
    remaining--;

    // 单次 FS 基础局（用 fsPayScale 缩放，避免爆炸）
    var fs = playBaseOnly(cfg, cfg.fsPayScale !== undefined ? cfg.fsPayScale : cfg.payScale);

    // 每次 FS 有概率降倍率（并入总倍率）
    if (randFloat() < cfg.multProb) {
      accumulatedMult += pickMultiplier();
    }

    // 记录
    spins.push({
      round: played,
      tumbles: fs.tumbles,
      baseWin: fs.totalWin,
      mult: accumulatedMult,
      scatter: fs.scatter
    });

    // 重触发
    if (fs.scatter >= 3 && randFloat() < cfg.freeSpinRetrigger) {
      remaining += 5; // +5 次
      spins[spins.length - 1].retrigger = true;
    }
  }

  // 计算总赢：每次 FS 的 baseWin × 本轮当时的累计倍率
  var finalMult = accumulatedMult > 0 ? accumulatedMult : 1;
  for (var i = 0; i < spins.length; i++) {
    var effMult = spins[i].mult > 0 ? spins[i].mult : 1;
    total += spins[i].baseWin * effMult;
  }

  return {
    spins: spins,
    totalWin: total,
    finalMult: finalMult,
    played: played
  };
}

/* 只跑基础局（不含 FS 检测）——FS 内部用 */
function playBaseOnly(cfg, payScaleOverride){
  var grid = makeGrid(cfg);
  var tumbles = [];
  var totalWin = 0;
  var round = 0;
  var scatter = 0;

  while (round < 30) {
    var ev = evaluateGrid(grid, 1.0, cfg, payScaleOverride);
    if (ev.hits.length === 0) break;

    totalWin += ev.totalWin;

    var removed = {};
    for (var hi = 0; hi < ev.hits.length; hi++) {
      var sym = ev.hits[hi].sym;
      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++)
          if (grid[r][c] === sym || grid[r][c] === 8) removed[r + ',' + c] = true;
    }

    var t = tumble(grid, removed, cfg);
    tumbles.push({
      round: round,
      hits: ev.hits,
      removed: Object.keys(removed),
      gridBefore: grid.map(function(r){ return r.slice(); }),
      gridAfter: t.grid.map(function(r){ return r.slice(); }),
      drops: t.drops
    });

    grid = t.grid;
    round++;
    if (round > 15) break;
  }

  // scatter 统计
  var ev2 = evaluateGrid(grid, 1.0, cfg);
  scatter = ev2.scatter;

  return { tumbles: tumbles, totalWin: totalWin, scatter: scatter };
}

/* ============ 单局完整流程 ============ */
/* 返回：{ initial, tumbles:[...], totalWin, scatter, multiplier, freeSpins } */
function playOnce(cfg){
  var result = {
    initial: null,
    tumbles: [],
    totalWin: 0,
    scatter: 0,
    multiplier: 1,
    freeSpins: 0,
    hit: false
  };

  var grid = makeGrid(cfg);
  result.initial = grid.map(function(r){ return r.slice(); });

  // 循环 tumble
  var round = 0;
  var MAX_ROUNDS = 30;
  var totalBaseWin = 0;
  while (round < MAX_ROUNDS) {
    var ev = evaluateGrid(grid, 1.0, cfg); // 单位下注，最后统一乘
    if (ev.hits.length === 0) break;

    result.hit = true;
    totalBaseWin += ev.totalWin;

    // 标记要移除的位置
    var removed = {};
    for (var hi = 0; hi < ev.hits.length; hi++) {
      var s = ev.hits[hi].sym;
      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++)
          if (grid[r][c] === s || grid[r][c] === 8) removed[r + ',' + c] = true;
    }

    // Tumble 后新网格（先算再存，保证动画和引擎一致）
    var t = tumble(grid, removed, cfg);

    // 记录这一轮（含 gridAfter，动画直接用，不再重新随机）
    result.tumbles.push({
      round: round,
      hits: ev.hits,
      removed: Object.keys(removed),
      gridBefore: grid.map(function(r){ return r.slice(); }),
      gridAfter: t.grid.map(function(r){ return r.slice(); }),
      drops: t.drops
    });

    grid = t.grid;
    round++;
    if (round > 15) break; // 防死循环
  }

  // 倍率降落
  if (randFloat() < cfg.multProb) {
    result.multiplier = pickMultiplier();
  }

  // Scatter 触发免费旋转
  var finalEv = evaluateGrid(grid, 1.0, cfg);
  result.scatter = finalEv.scatter;

  // 触发免费旋转
  if (finalEv.scatter >= 4) {
    result.freeSpins = finalEv.scatter >= 6 ? 25 : (finalEv.scatter >= 5 ? 20 : 15);
    var fs = playFreeSpins(cfg, result.freeSpins);
    result.fsResult = fs;
    result.fsWin = fs.totalWin;
  }

  result.baseWin = totalBaseWin * result.multiplier;
  result.totalWin = result.baseWin + (result.fsWin || 0);
  return result;
}

/* ============ 模拟测试（校准 RTP 用） ============ */
function simulate(modeKey, spins){
  var cfg = CONFIG[modeKey];
  var totalBet = spins;
  var totalWin = 0;
  var hitCount = 0;
  var fsCount = 0;
  for (var i = 0; i < spins; i++) {
    var r = playOnce(cfg);
    totalWin += r.totalWin;
    if (r.hit) hitCount++;
    if (r.freeSpins > 0) fsCount++;
  }
  return {
    rtp: totalWin / totalBet,
    hitRate: hitCount / spins,
    fsRate: fsCount / spins
  };
}

/* ============ 导出 ============ */
window.ApexOlympus = {
  SYMBOLS: SYMBOLS,
  MULTIPLIERS: MULTIPLIERS,
  CONFIG: CONFIG,
  COLS: COLS,
  ROWS: ROWS,
  randInt: randInt,
  randFloat: randFloat,
  makeGrid: makeGrid,
  evaluateGrid: evaluateGrid,
  tumble: tumble,
  playOnce: playOnce,
  playFreeSpins: playFreeSpins,
  simulate: simulate
};

})();
