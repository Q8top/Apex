/* Gates of Olympus · 服务端数学引擎
 *
 * 🔒 机密文件 — 严禁暴露到前端
 *    纯函数：接收 RNG + bet + mode，返回 SpinResult
 */

import { GRID, SYMBOLS, PAYTABLE, PAYOUT, META } from './config.js';

const SYM_KEYS = Object.keys(SYMBOLS);
const SCATTER_TRIGGER = 4;
const FS_BASE = 10;
const FS_EXTRA_PER_SCATTER = 2;

function weightedSymbol(rng) {
  return rng.pickWeighted(SYM_KEYS, function(k) {
    return SYMBOLS[k].weight;
  });
}

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

export function countScatter(grid) {
  if (!grid) return 0;
  var n = 0;
  for (var c = 0; c < grid.length; c++) {
    for (var r = 0; r < grid[c].length; r++) {
      if (grid[c][r] === 'SCATTER') n++;
    }
  }
  return n;
}

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

export function calcPay(symbol, count, bet, scale) {
  var pv = lookupPay(symbol, count);
  return pv * bet * scale;
}

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

// 跑一轮完整盘面（含 tumble 循环）
function playRound(rng, bet, scale) {
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

  return {
    initialGrid: initialGrid,
    finalGrid: grid,
    tumbles: tumbles,
    totalWin: totalWin,
    tumbleCount: tumbleCount
  };
}

// 完整一轮（含 Free Spins）
export function spin(rng, bet, mode) {
  var scale = mode === 'demo' ? PAYOUT.scaleDemo : PAYOUT.scaleReal;
  var seed = rng.getSeed();

  var base = playRound(rng, bet, scale);
  var scatterCount = countScatter(base.initialGrid);

  var freeSpins = null;
  var fsTotalWin = 0;
  var grandTotal = base.totalWin;

  if (scatterCount >= SCATTER_TRIGGER) {
    var awarded = FS_BASE + (scatterCount - SCATTER_TRIGGER) * FS_EXTRA_PER_SCATTER;
    var rounds = [];
    for (var i = 0; i < awarded; i++) {
      var r = playRound(rng, bet, scale);
      fsTotalWin += r.totalWin;
      rounds.push({
        index: i,
        initialGrid: r.initialGrid,
        finalGrid: r.finalGrid,
        tumbles: r.tumbles,
        totalWin: r.totalWin
      });
    }
    freeSpins = {
      awarded: awarded,
      rounds: rounds,
      totalWin: fsTotalWin
    };
    grandTotal += fsTotalWin;
  }

  var cap = bet * PAYOUT.maxWinMultiplier;
  var capped = false;
  if (grandTotal > cap) { grandTotal = cap; capped = true; }

  return {
    seed: seed,
    mathVersion: META.mathVersion,
    bet: bet,
    mode: mode,
    initialGrid: base.initialGrid,
    finalGrid: base.finalGrid,
    tumbles: base.tumbles,
    tumbleCount: base.tumbleCount,
    scatterCount: scatterCount,
    freeSpins: freeSpins,
    baseTotalWin: base.totalWin,
    totalWin: grandTotal,
    capped: capped
  };
}

// Demo 模式：跑 N 次取最优
export function spinDemo(rng, bet) {
  var best = null;
  for (var i = 0; i < PAYOUT.demoCounts; i++) {
    var r = spin(rng, bet, 'demo');
    if (!best || r.totalWin > best.totalWin) best = r;
  }
  return best;
}
