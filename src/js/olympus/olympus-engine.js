/* 奥林匹斯之门 · 引擎
   6×5 Cluster Pays + Tumble + Multiplier + Zeus Scatter
*/
(function(){
'use strict';

var C = window.OlympusConfig;

function randFloat(){
  var b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / 4294967296;
}

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

/* ---------- Tumble 补新符号：更集中的热门池 ---------- */
var _tumblePool = null;
function buildTumblePool(){
  var arr = [], total = 0;
  var W = { gemBlue: 50, gemGreen: 45, gemYellow: 30, gemPurple: 10, gemRed: 5,
            cup: 2, ring: 1.2, hourglass: 0.8, crown: 0.4, zeus: 0.5 };
  for (var k in W) { total += W[k]; arr.push({ id: k, cum: total }); }
  _tumblePool = { arr: arr, total: total };
}
function pickTumble(){
  if (!_tumblePool) buildTumblePool();
  var t = randFloat() * _tumblePool.total, a = _tumblePool.arr;
  for (var i = 0; i < a.length; i++) if (t < a[i].cum) return a[i].id;
  return a[a.length - 1].id;
}

/* ---------- 网格生成 ---------- */
function spin(){
  var g = [];
  for (var r = 0; r < C.CONFIG.rows; r++) {
    var row = [];
    for (var c = 0; c < C.CONFIG.cols; c++) row.push(pick());
    g.push(row);
  }
  return g;
}

/* ---------- Cluster 检测（BFS 4 邻，排除 zeus）---------- */
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
      if (sym === 'zeus') continue;  // Zeus 单独处理

      var q = [[r0,c0]], cells = [], head = 0;
      while (head < q.length) {
        var cur = q[head++];
        cells.push(cur);
        var dirs = [[0,1],[1,0],[0,-1],[-1,0]];
        for (var d = 0; d < 4; d++) {
          var nr = cur[0]+dirs[d][0], nc = cur[1]+dirs[d][1];
          if (nr<0||nr>=R||nc<0||nc>=Col) continue;
          if (vis[nr][nc] || grid[nr][nc] !== sym) continue;
          vis[nr][nc] = true;
          q.push([nr,nc]);
        }
      }
      if (cells.length >= minN) out.push({ symbol: sym, cells: cells, size: cells.length });
    }
  }
  return out;
}

/* ---------- Zeus 检测 ---------- */
function findZeus(grid){
  var cells = [];
  for (var r = 0; r < C.CONFIG.rows; r++)
    for (var c = 0; c < C.CONFIG.cols; c++)
      if (grid[r][c] === 'zeus') cells.push([r,c]);
  return cells;
}

/* ---------- 单轮评估 ---------- */
function evaluate(grid, totalBet){
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
  return { wins: wins, totalWin: total };
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

/* ---------- 乘法器掉落 ---------- */
var _mwPool = null;
function pickMultiplier(){
  if (!_mwPool) {
    var arr = [], total = 0;
    for (var i = 0; i < C.MULTIPLIER_VALUES.length; i++) {
      var v = C.MULTIPLIER_VALUES[i];
      var w = C.MULTIPLIER_WEIGHTS[v] || 0;
      total += w;
      arr.push({ v: v, cum: total });
    }
    _mwPool = { arr: arr, total: total };
  }
  var t = randFloat() * _mwPool.total, a = _mwPool.arr;
  for (var j = 0; j < a.length; j++) if (t < a[j].cum) return a[j].v;
  return a[a.length - 1].v;
}

/* ---------- 完整 spin（含 tumble）---------- */
function playFullSpin(totalBet){
  var grid = spin();
  var rounds = [];
  var scatterCount = findZeus(grid).length;
  var totalWin = 0;

  for (var t = 0; t < C.CONFIG.maxTumbles; t++) {
    var r = evaluate(grid, totalBet);
    if (r.wins.length === 0) {
      if (t === 0) rounds.push({ grid: grid, wins: [], roundWin: 0, multiplier: 0 });
      break;
    }
    // 每回合掉 1~2 个乘法器，加法叠加
    var multCount = (randFloat() < 0.4) ? 2 : 1;
    var mult = 0;
    for (var mc = 0; mc < multCount; mc++) mult += pickMultiplier();
    var roundWin = r.totalWin * mult;
    totalWin += roundWin;

    var winCells = [];
    r.wins.forEach(function(w){ w.cells.forEach(function(p){ winCells.push(p); }); });
    rounds.push({ grid: grid, wins: r.wins, roundWin: roundWin, multiplier: mult });

    grid = tumble(grid, winCells);
  }
  return { rounds: rounds, totalWin: totalWin, finalGrid: grid, scatterCount: scatterCount };
}

function setMode(m){ _weights = (m === 'demo') ? C.WEIGHTS_DEMO : C.WEIGHTS_REAL; _payScale = (m === 'demo') ? C.CONFIG.payoutScaleDemo : C.CONFIG.payoutScaleReal; _pool = null; }

/* demo 高命中：跑 2 次取最高 */
function spinDemo(betAmount){
  var best = null;
  for (var i = 0; i < 4; i++) {
    var r = playFullSpin(betAmount);
    if (!best || r.totalWin > best.totalWin) best = r;
  }
  return best;
}

/* Zeus 倍数抽取 */
var _zmPool = null;
function pickZeusMult(){
  if (!_zmPool) {
    var arr = [], total = 0;
    for (var i = 0; i < C.ZEUS_MULT_VALUES.length; i++) {
      var v = C.ZEUS_MULT_VALUES[i], w = C.ZEUS_MULT_WEIGHTS[v] || 0;
      total += w; arr.push({ v: v, cum: total });
    }
    _zmPool = { arr: arr, total: total };
  }
  var t = randFloat() * _zmPool.total, a = _zmPool.arr;
  for (var j = 0; j < a.length; j++) if (t < a[j].cum) return a[j].v;
  return a[a.length - 1].v;
}
function pickZeusCount(){
  var r = randFloat();
  if (r < 0.45) return 0;
  if (r < 0.75) return 1;
  if (r < 0.92) return 2;
  return C.ZEUS_MAX_PER_SPIN || 3;
}
/* 在 grid 上随机落 n 个 Zeus，返回 [{r,c,mult}] */
function dropZeus(grid, n){
  var placed = [];
  var tries = 0;
  while (placed.length < n && tries < 30) {
    tries++;
    var r = Math.floor(randFloat() * C.CONFIG.rows);
    var c = Math.floor(randFloat() * C.CONFIG.cols);
    if (grid[r][c] === "zeus") continue;
    var ok = false;
    for (var k = 0; k < placed.length; k++) {
      if (placed[k].r === r && placed[k].c === c) { ok = false; break; }
    }
    var dup = false;
    for (var k2 = 0; k2 < placed.length; k2++) if (placed[k2].r === r && placed[k2].c === c) dup = true;
    if (dup) continue;
    var mult = pickZeusMult();
    grid[r][c] = "zeus";
    placed.push({ r: r, c: c, mult: mult });
  }
  return placed;
}
/* 完整免费旋转 */
function playFreeSpins(totalBet){
  var remaining = 15;
  var totalWin = 0;
  var spins = [];
  var spinIdx = 0;
  while (remaining > 0 && spinIdx < 100) {
    remaining--;
    spinIdx++;
    var grid = spin();
    var rounds = [];
    var spinWin = 0;
    var zeusMult = 0;
    var zeusDrops = [];
    // 初始 drop（0-3 个 Zeus）
    var initN = pickZeusCount();
    var initDrops = dropZeus(grid, initN);
    initDrops.forEach(function(d){ zeusMult += d.mult; zeusDrops.push(d); });
    // Tumble 循环
    for (var t = 0; t < C.CONFIG.maxTumbles; t++) {
      var r = evaluate(grid, totalBet);
      if (r.wins.length === 0) {
        if (t === 0) rounds.push({ grid: grid, wins: [], roundWin: 0, multiplier: 0 });
        break;
      }
      var roundWin = r.totalWin;
      spinWin += roundWin;
      var winCells = [];
      r.wins.forEach(function(w){ w.cells.forEach(function(p){ winCells.push(p); }); });
      rounds.push({ grid: grid, wins: r.wins, roundWin: roundWin, multiplier: 1 });
      grid = tumble(grid, winCells);
      // 额外 drop Zeus
      if (randFloat() < (C.ZEUS_DROP_CHANCE || 0.15)) {
        var extraN = (randFloat() < 0.3) ? 2 : 1;
        var extraDrops = dropZeus(grid, extraN);
        extraDrops.forEach(function(d){ zeusMult += d.mult; zeusDrops.push(d); });
      }
    }
    var fsWin = spinWin * zeusMult;
    totalWin += fsWin;
    spins.push({
      idx: spinIdx,
      remaining: remaining,
      grid: grid,
      rounds: rounds,
      win: fsWin,
      baseWin: spinWin,
      zeusMult: zeusMult,
      zeusDrops: zeusDrops
    });
  }
  return { spins: spins, totalWin: totalWin, count: spinIdx };
}

window.OlympusEngine = {
  spin: spin,
  playFreeSpins: playFreeSpins,
  pickZeusMult: pickZeusMult,
  evaluate: evaluate,
  findClusters: findClusters,
  tumble: tumble,
  playFullSpin: playFullSpin,
  spinDemo: spinDemo,
  setMode: setMode,
  pickMultiplier: pickMultiplier,
  randFloat: randFloat
};
})();
