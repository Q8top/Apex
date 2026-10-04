/* Gates of Olympus · 服务端数学引擎
 *
 * 🔒 机密文件 — 严禁暴露到前端
 *    纯函数：接收 RNG + bet + mode，返回 SpinResult
 *    不碰 DOM，不碰网络，不碰时间
 */

import { GRID, SYMBOLS, PAYTABLE, PAYOUT, META } from './config.js';

const SYM_KEYS = Object.keys(SYMBOLS);

function weightedSymbol(rng) {
  return rng.pickWeighted(SYM_KEYS, function(k) {
    return SYMBOLS[k].weight;
  });
}

// 生成 6×5 网格：grid[col][row]
export function generateGrid(rng) {
  var grid = [];
  for (var c = 0; c < GRID.cols; c++) {
    var col = [];
    for (var r = 0; r < GRID.rows; r++) {
      col.push(weightedSymbol(rng));
    }
    grid.push(col);
  }
  return grid;
}

// 找出所有中奖符号（≥8 且非 SCATTER）
export function evaluateGrid(grid) {
  var count = {};
  var cells = {};
  for (var c = 0; c < grid.length; c++) {
    for (var r = 0; r < grid[c].length; r++) {
      var s = grid[c][r];
      if (s === 'SCATTER') continue;
      count[s] = (count[s] || 0) + 1;
      if (!cells[s]) cells[s] = [];
      cells[s].push([c, r]);
    }
  }
  var wins = [];
  for (var k in count) {
    if (count[k] >= GRID.minMatch && PAYTABLE[k]) {
      wins.push({ symbol: k, count: count[k], cells: cells[k] });
    }
  }
  return wins;
}

// 从赔付表取档（8/10/12 三档，超出取最高档）
export function lookupPay(symbol, count) {
  var t = PAYTABLE[symbol];
  if (!t) return 0;
  var keys = Object.keys(t).map(Number).sort(function(a, b) { return a - b; });
  var best = 0;
  for (var i = 0; i < keys.length; i++) {
    if (count >= keys[i]) best = t[keys[i]];
  }
  return best;
}

// 计算赔付金额（bet × payValue × scale）
export function calcPay(symbol, count, bet, scale) {
  var pv = lookupPay(symbol, count);
  return pv * bet * scale;
}

// 消除中奖格 → 每列下落 → 顶部补新符号
export function tumble(grid, wins, rng) {
  var remove = {};
  for (var i = 0; i < wins.length; i++) {
    var cs = wins[i].cells;
    for (var j = 0; j < cs.length; j++) {
      remove[cs[j][0] + '_' + cs[j][1]] = true;
    }
  }
  var next = [];
  for (var c = 0; c < GRID.cols; c++) {
    var survivors = [];
    for (var r = 0; r < GRID.rows; r++) {
      if (!remove[c + '_' + r]) survivors.push(grid[c][r]);
    }
    while (survivors.length < GRID.rows) {
      survivors.unshift(weightedSymbol(rng));
    }
    next.push(survivors);
  }
  return next;
}

// 完整一轮：初始网格 → 循环 tumble 直到无中奖
export function spin(rng, bet, mode) {
  var scale = mode === 'demo' ? PAYOUT.scaleDemo : PAYOUT.scaleReal;
  var seed = rng.getSeed();

  var initialGrid = generateGrid(rng);
  var grid = initialGrid;
  var tumbles = [];
  var totalWin = 0;
  var tumbleCount = 0;

  while (true) {
    var wins = evaluateGrid(grid);
    if (wins.length === 0) break;

    var roundWin = 0;
    var detail = [];
    for (var i = 0; i < wins.length; i++) {
      var w = wins[i];
      var pay = calcPay(w.symbol, w.count, bet, scale);
      roundWin += pay;
      detail.push({ symbol: w.symbol, count: w.count, cells: w.cells, pay: pay });
    }
    totalWin += roundWin;
    tumbles.push({ index: tumbleCount, grid: grid, wins: detail, roundWin: roundWin });

    tumbleCount++;
    if (tumbleCount >= GRID.maxTumbles) break;

    grid = tumble(grid, wins, rng);
  }

  // 上限保护
  var cap = bet * PAYOUT.maxWinMultiplier;
  var capped = false;
  if (totalWin > cap) { totalWin = cap; capped = true; }

  return {
    seed: seed,
    mathVersion: META.mathVersion,
    bet: bet,
    mode: mode,
    initialGrid: initialGrid,
    tumbles: tumbles,
    tumbleCount: tumbleCount,
    totalWin: totalWin,
    capped: capped
  };
}


// Demo 模式：跑 N 次取最优（N = PAYOUT.demoCounts）
export function spinDemo(rng, bet) {
  var best = null;
  for (var i = 0; i < PAYOUT.demoCounts; i++) {
    var r = spin(rng, bet, 'demo');
    if (!best || r.totalWin > best.totalWin) best = r;
  }
  return best;
}
