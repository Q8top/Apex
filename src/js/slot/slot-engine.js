/* Lucky Fruit · 引擎
   RNG（CSPRNG） + 权重采样 + 中奖判定
   逻辑与动画完全分离
*/
(function(){
'use strict';

var C = window.SlotConfig;

/* ---------- CSPRNG：拒绝采样，无 modulo bias ---------- */
function randInt(maxExclusive) {
  if (maxExclusive <= 0) return 0;
  var max = maxExclusive;
  var limit = Math.floor(4294967296 / max) * max;
  var buf = new Uint32Array(1);
  var v;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

function randFloat() {
  var buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
}

/* ---------- 权重采样：一次遍历，O(n) ---------- */
var _weightedPool = null;
function buildPool() {
  var pool = [];
  var total = 0;
  for (var k in C.WEIGHTS) {
    if (!C.WEIGHTS.hasOwnProperty(k)) continue;
    total += C.WEIGHTS[k];
    pool.push({ id: k, cum: total });
  }
  _weightedPool = { pool: pool, total: total };
}

function pickSymbol() {
  if (!_weightedPool) buildPool();
  var t = randFloat() * _weightedPool.total;
  var pool = _weightedPool.pool;
  for (var i = 0; i < pool.length; i++) {
    if (t < pool[i].cum) return pool[i].id;
  }
  return pool[pool.length - 1].id;
}

/* ---------- 生成 5×3 结果矩阵 ---------- */
/* 返回 reels[列][行] */
function spin() {
  var reels = [];
  for (var c = 0; c < C.CONFIG.reels; c++) {
    var col = [];
    for (var r = 0; r < C.CONFIG.rows; r++) {
      col.push(pickSymbol());
    }
    reels.push(col);
  }
  return reels;
}

/* ---------- 判断一条线是否中奖 ---------- */
/* 从最左开始连续匹配；Wild 可替代除 wild 以外的符号 */
function isWild(s) { return s === 'wild'; }

function matchFromLeft(lineSymbols) {
  var first = lineSymbols[0];
  var target = first;
  if (isWild(target)) {
    // 全 Wild 线
    var allWild = lineSymbols.every(isWild);
    if (allWild) return { symbol: 'wild', count: lineSymbols.length };
    // 找出第一个非 Wild 作为目标
    for (var i = 0; i < lineSymbols.length; i++) {
      if (!isWild(lineSymbols[i])) { target = lineSymbols[i]; break; }
    }
  }
  var count = 0;
  for (var j = 0; j < lineSymbols.length; j++) {
    var s = lineSymbols[j];
    if (s === target || isWild(s)) count++;
    else break;
  }
  return { symbol: target, count: count };
}

/* ---------- 评估所有中奖线 ---------- */
function evaluate(reels, totalBet) {
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
      syms.push(reels[c][row]);
      positions.push({ reel: c, row: row });
    }
    var m = matchFromLeft(syms);
    if (m.count >= 3) {
      var table = C.PAYOUTS[m.symbol];
      if (!table) continue;
      var mult = table[m.count] || 0;
      if (mult > 0) {
        var amount = mult * lineBet;
        wins.push({
          paylineIndex: i,
          symbol: m.symbol,
          count: m.count,
          multiplier: mult,
          amount: amount,
          positions: positions.slice(0, m.count)
        });
        totalWin += amount;
      }
    }
  }

  return { wins: wins, totalWin: totalWin };
}

/* ---------- 调试：固定结果 ---------- */
function spinForced(symbolId) {
  var reels = [];
  for (var c = 0; c < C.CONFIG.reels; c++) {
    var col = [];
    for (var r = 0; r < C.CONFIG.rows; r++) col.push(symbolId);
    reels.push(col);
  }
  return reels;
}

window.SlotEngine = {
  spin: spin,
  evaluate: evaluate,
  spinForced: spinForced,
  randInt: randInt,
  randFloat: randFloat
};

})();
