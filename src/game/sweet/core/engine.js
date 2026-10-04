/* Sweet · Math Engine
   1:1 复刻原 sweet-engine.js 的数学算法。
   唯一变化：随机源改为 SweetRNG.rand()（支持 seeded 调试）。
   数学结果与原 sweet-engine.js 完全一致。
*/
(function(){
'use strict';

var C = window.SweetGameConfig;
var RNG = window.SweetRNG;

if (!C || !RNG) {
  console.error('[SweetEngine] 依赖 SweetGameConfig / SweetRNG');
  window.SweetMathEngine = null;
  return;
}

var randFloat = RNG.rand;

/* ---------- 权重池 ---------- */
var _weights = C.WEIGHTS_REAL;
var _payScale = C.CONFIG.payoutScaleReal;
var _pool = null;
function buildPool(){
  var arr = [], total = 0;
  for (var k in _weights) {
    if (!_weights.hasOwnProperty(k)) continue;
    total += _weights[k];
    arr.push({ id: k, cum: total });
  }
  _pool = { arr: arr, total: total };
}
function pick(){
  if (!_pool) buildPool();
  var t = randFloat() * _pool.total, a = _pool.arr;
  for (var i = 0; i < a.length; i++) if (t < a[i].cum) return a[i].id;
  return a[a.length - 1].id;
}

/* ---------- Tumble 补新池 ---------- */
var _tp = null;
function buildTumblePool(){
  var W = { candyBlue:50, candyGreen:45, candyPurple:30, candyRed:15, candyOrange:8,
            candyYellow:5, banana:3, grape:2, watermelon:1, apple:.6, plum:.4 };
  var arr = [], total = 0;
  for (var k in W) { total += W[k]; arr.push({ id: k, cum: total }); }
  _tp = { arr: arr, total: total };
}
function pickTumble(){
  if (!_tp) buildTumblePool();
  var t = randFloat() * _tp.total, a = _tp.arr;
  for (var i = 0; i < a.length; i++) if (t < a[i].cum) return a[i].id;
  return a[a.length - 1].id;
}

function spin(){
  var g = [];
  for (var r = 0; r < C.CONFIG.rows; r++) {
    var row = [];
    for (var c = 0; c < C.CONFIG.cols; c++) row.push(pick());
    g.push(row);
  }
  return g;
}

/* ---------- Cluster 检测 ---------- */
function findClusters(grid){
  var R = C.CONFIG.rows, Col = C.CONFIG.cols, minN = C.CONFIG.minCluster;
  var vis = [];
  for (var i = 0; i < R; i++) vis.push(new Array(Col).fill(false));
  var out = [];
  for (var r0 = 0; r0 < R; r0++) {
    for (var c0 = 0; c0 < Col; c0++) {
      if (vis[r0][c0]) continue;
      var sym = grid[r0][c0];
      vis[r0][c0] = true;
      if (sym === 'lollipop') continue;
      var q = [[r0,c0]], cells = [], head = 0;
      while (head < q.length) {
        var cur = q[head++];
        cells.push(cur);
        var dirs = [[0,1],[1,0],[0,-1],[-1,0]];
        for (var d = 0; d < 4; d++) {
          var nr = cur[0]+dirs[d][0], nc = cur[1]+dirs[d][1];
          if (nr<0||nr>=R||nc<0||nc>=Col) continue;
          if (vis[nr][nc] || grid[nr][nc] !== sym) continue;
          vis[nr][nc] = true; q.push([nr,nc]);
        }
      }
      if (cells.length >= minN) out.push({ symbol: sym, cells: cells, size: cells.length });
    }
  }
  return out;
}

function findScatter(grid){
  var cells = [];
  for (var r = 0; r < C.CONFIG.rows; r++)
    for (var c = 0; c < C.CONFIG.cols; c++)
      if (grid[r][c] === 'lollipop') cells.push([r,c]);
  return cells;
}

/* ---------- 单轮评估 ---------- */
function evaluate(grid, totalBet, inFreeSpin){
  var cellBet = totalBet / C.CONFIG.baseCellBet;
  var clusters = findClusters(grid);
  var wins = [], total = 0;
  clusters.forEach(function(cl){
    var tbl = C.PAYOUTS[cl.symbol]; if (!tbl) return;
    var keys = Object.keys(tbl).map(Number).sort(function(a,b){ return a-b; });
    var mult = 0;
    for (var i = 0; i < keys.length; i++) if (cl.size >= keys[i]) mult = tbl[keys[i]];
    if (mult > 0) {
      var amt = mult * cellBet * _payScale;
      wins.push({ symbol: cl.symbol, size: cl.size, cells: cl.cells, multiplier: mult, amount: amt });
      total += amt;
    }
  });
  return { wins: wins, totalWin: total, scatter: findScatter(grid) };
}

/* ---------- Tumble ---------- */
function tumble(grid, winCells){
  var R = C.CONFIG.rows, Col = C.CONFIG.cols;
  var set = {};
  winCells.forEach(function(p){ set[p[0]+','+p[1]] = 1; });
  var out = [];
  for (var r = 0; r < R; r++) out.push(new Array(Col).fill(null));
  for (var c = 0; c < Col; c++) {
    var stack = [];
    for (var r2 = R-1; r2 >= 0; r2--) {
      if (set[r2+','+c]) continue;
      stack.push(grid[r2][c]);
    }
    for (var i = 0; i < stack.length; i++) out[R-1-i][c] = stack[i];
    for (var k = 0; k < R - stack.length; k++) out[k][c] = pickTumble();
  }
  return out;
}

/* ---------- 炸弹倍数 ---------- */
var _bp = null;
function pickBomb(){
  if (!_bp) {
    var arr = [], total = 0;
    for (var i = 0; i < C.BOMB_VALUES.length; i++) {
      var v = C.BOMB_VALUES[i], w = C.BOMB_WEIGHTS[v] || 0;
      total += w; arr.push({ v: v, cum: total });
    }
    _bp = { arr: arr, total: total };
  }
  var t = randFloat() * _bp.total, a = _bp.arr;
  for (var j = 0; j < a.length; j++) if (t < a[j].cum) return a[j].v;
  return a[a.length - 1].v;
}

/* ---------- 单次 spin（含 tumble 循环） ---------- */
function playFullSpin(totalBet, inFreeSpin){
  var grid = spin();
  var rounds = [];
  var totalWin = 0;
  var scatterCount = 0;
  var cumulativeMult = 0;

  for (var t = 0; t < C.CONFIG.maxTumbles; t++) {
    var r = evaluate(grid, totalBet, inFreeSpin);
    if (r.scatter.length && t === 0) scatterCount = r.scatter.length;
    if (r.wins.length === 0) {
      if (t === 0) rounds.push({ grid: grid, wins: [], roundWin: 0, bombs: [], bombMult: 0, cumMult: cumulativeMult, scatter: r.scatter });
      break;
    }
    var bombs = [];
    var bombMult = 0;
    if (inFreeSpin) {
      var bombCount = (randFloat() < 0.35) ? 2 : 1;
      for (var bc = 0; bc < bombCount; bc++) {
        var bv = pickBomb();
        var cl = r.wins[Math.floor(randFloat() * r.wins.length)];
        var cell = cl.cells[Math.floor(randFloat() * cl.cells.length)];
        bombs.push({ value: bv, cell: cell });
        bombMult += bv;
      }
      cumulativeMult += bombMult;
    }
    var roundWin = inFreeSpin ? (r.totalWin * cumulativeMult) : r.totalWin;
    totalWin += roundWin;
    var winCells = [];
    r.wins.forEach(function(w){ w.cells.forEach(function(p){ winCells.push(p); }); });
    rounds.push({ grid: grid, wins: r.wins, roundWin: roundWin, bombs: bombs, bombMult: bombMult, cumMult: cumulativeMult, scatter: r.scatter });
    grid = tumble(grid, winCells);
  }
  return { rounds: rounds, totalWin: totalWin, finalGrid: grid, scatterCount: scatterCount, cumulativeMult: cumulativeMult };
}

/* ---------- 免费旋转 ---------- */
function playFreeSpins(totalBet, initialCount){
  var remaining = (typeof initialCount === 'number' && initialCount > 0) ? initialCount : 10;
  var totalWin = 0;
  var spins = [];
  var spinIdx = 0;
  while (remaining > 0 && spinIdx < 100) {
    remaining--;
    spinIdx++;
    var r = playFullSpin(totalBet, true);
    totalWin += r.totalWin;
    var sc = r.scatterCount || 0;
    if (sc >= 4) {
      var add = C.RETRIGGER || 5;
      remaining += add;
    }
    spins.push({ idx: spinIdx, remaining: remaining, result: r });
  }
  return { spins: spins, totalWin: totalWin, count: spinIdx };
}

function setMode(m){
  _weights = (m === 'demo') ? C.WEIGHTS_DEMO : C.WEIGHTS_REAL;
  _payScale = (m === 'demo') ? C.CONFIG.payoutScaleDemo : C.CONFIG.payoutScaleReal;
  _pool = null; _tp = null; _bp = null;
}

function spinDemo(betAmount){
  var best = null;
  for (var i = 0; i < 4; i++) {
    var r = playFullSpin(betAmount, false);
    if (!best || r.totalWin > best.totalWin) best = r;
  }
  return best;
}

window.SweetMathEngine = {
  spin: spin,
  evaluate: evaluate,
  findClusters: findClusters,
  findScatter: findScatter,
  tumble: tumble,
  playFullSpin: playFullSpin,
  playFreeSpins: playFreeSpins,
  spinDemo: spinDemo,
  setMode: setMode,
  pickBomb: pickBomb
};
})();
