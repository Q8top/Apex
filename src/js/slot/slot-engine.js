/* 幸运水果 · 引擎
   CSPRNG + 权重采样 + 3×3 中奖判定
   逻辑与动画完全分离
*/
(function(){
'use strict';

var C = window.SlotConfig;
var _weights = C.WEIGHTS_REAL;

/* ---------- CSPRNG：拒绝采样，无 modulo bias ---------- */
function randFloat() {
  var buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
}

/* ---------- 权重池 ---------- */
var _pool = null;
function buildPool() {
  var arr = [], total = 0;
  for (var k in _weights) {
    if (!_weights.hasOwnProperty(k)) continue;
    total += _weights[k];
    arr.push({ id: k, cum: total });
  }
  _pool = { arr: arr, total: total };
}
function pickSymbol() {
  if (!_pool) buildPool();
  var t = randFloat() * _pool.total;
  var a = _pool.arr;
  for (var i = 0; i < a.length; i++) {
    if (t < a[i].cum) return a[i].id;
  }
  return a[a.length - 1].id;
}

/* ---------- 生成 3×3 矩阵（grid[row][col]）---------- */
/* 更符合直觉：行优先 */
function spin() {
  var grid = [];
  for (var r = 0; r < C.CONFIG.rows; r++) {
    var row = [];
    for (var c = 0; c < C.CONFIG.reels; c++) {
      row.push(pickSymbol());
    }
    grid.push(row);
  }
  return grid;
}

/* ---------- 从行首匹配：3×3 每条线刚好 3 个 ---------- */
function evaluateLine(syms) {
  // syms 长度 = 3
  var first = syms[0];
  var target = first;
  if (first === 'wild') {
    // 全 wild？
    var allWild = syms.every(function(s){ return s === 'wild'; });
    if (allWild) return { symbol: 'wild', count: 3 };
    // 找第一个非 wild
    for (var i = 0; i < syms.length; i++) {
      if (syms[i] !== 'wild') { target = syms[i]; break; }
    }
  }
  var count = 0;
  for (var j = 0; j < syms.length; j++) {
    if (syms[j] === target || syms[j] === 'wild') count++;
    else break;
  }
  return { symbol: target, count: count };
}

/* ---------- 评估所有线 ---------- */
/* grid[row][col]，line[row] 数组给出每列的行索引 */
function evaluate(grid, totalBet) {
  var lines = C.PAYLINES;
  var lineBet = totalBet / lines.length;
  var wins = [];
  var totalWin = 0;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var syms = [];
    var positions = [];
    for (var c = 0; c < line.length; c++) {
      var row = line[c];
      syms.push(grid[row][c]);
      positions.push({ row: row, col: c });
    }
    var m = evaluateLine(syms);
    if (m.count >= 3) {
      var mult = C.PAYOUTS[m.symbol] || 0;
      if (mult > 0) {
        var amount = mult * lineBet;
        wins.push({
          paylineIndex: i,
          symbol: m.symbol,
          count: m.count,
          multiplier: mult,
          amount: amount,
          positions: positions
        });
        totalWin += amount;
      }
    }
  }

  return { wins: wins, totalWin: totalWin };
}

/* ---------- 调试：固定结果 ---------- */
function spinForced(symbolId) {
  var grid = [];
  for (var r = 0; r < C.CONFIG.rows; r++) {
    var row = [];
    for (var c = 0; c < C.CONFIG.reels; c++) row.push(symbolId);
    grid.push(row);
  }
  return grid;
}

function setMode(mode) {
  _weights = (mode === 'demo') ? C.WEIGHTS_DEMO : C.WEIGHTS_REAL;
  _pool = null;
}

/* demo 高命中：最多重 roll 20 次保证至少 1 条线中奖 */
function spinDemo(betAmount) {
  for (var i = 0; i < 20; i++) {
    var g = spin();
    var r = evaluate(g, betAmount);
    if (r.wins.length > 0) return g;
  }
  return spin();
}

window.SlotEngine = {
  spin: spin,
  spinDemo: spinDemo,
  setMode: setMode,
  evaluate: evaluate,
  spinForced: spinForced,
  randFloat: randFloat
};

})();
