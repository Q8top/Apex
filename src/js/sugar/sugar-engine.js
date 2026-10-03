/* 糖果狂欢 · 引擎
   7×7 Cluster Pays（5+） + Tumble + 位置倍率 + 免费旋转
   位置倍率（原版机制）：
   - 倍率方块固定在网格位置上（不随符号下落）
   - 起始倍率 2x；中奖 cluster 覆盖到该位置 → 倍率翻倍（2→4→8→...→128）
   - 初始 spin 和每次 Tumble 补新符号时，每个新格有概率带 2x
   - 结算：cluster 赢分 × (覆盖格子倍率之和)，无倍率格 = baseAmt
*/
(function(){
'use strict';

var C = window.SugarConfig;

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

/* ---------- Tumble 补新池（不含 scatter） ---------- */
var _tp = null;
function buildTumblePool(){
  var W = { candyBlue:60, candyGreen:50, candyYellow:25, candyRed:12,
            candyPurple:6, heart:3, star:1.5, rainbow:0.5 };
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

function emptyMultGrid(){
  var g = [];
  for (var r = 0; r < C.CONFIG.rows; r++) g.push(new Array(C.CONFIG.cols).fill(0));
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

/* ---------- 单轮评估（含位置倍率计算） ---------- */
function evaluate(grid, multGrid, totalBet){
  var cellBet = totalBet / C.CONFIG.baseCellBet;
  var clusters = findClusters(grid);
  var wins = [], total = 0;
  clusters.forEach(function(cl){
    var tbl = C.PAYOUTS[cl.symbol]; if (!tbl) return;
    var keys = Object.keys(tbl).map(Number).sort(function(a,b){ return a-b; });
    var mult = 0;
    for (var i = 0; i < keys.length; i++) if (cl.size >= keys[i]) mult = tbl[keys[i]];
    if (mult > 0) {
      var baseAmt = mult * cellBet * _payScale;
      var posMult = 0;
      cl.cells.forEach(function(p){
        if (multGrid[p[0]][p[1]]) posMult += multGrid[p[0]][p[1]];
      });
      var amt = posMult > 0 ? baseAmt * posMult : baseAmt;
      wins.push({ symbol: cl.symbol, size: cl.size, cells: cl.cells, multiplier: mult, posMult: posMult, amount: amt, baseAmount: baseAmt });
      total += amt;
    }
  });
  return { wins: wins, totalWin: total, scatter: findScatter(grid) };
}

/* ---------- Tumble：返回 {grid, newCells} ---------- */
function tumble(grid, winCells){
  var R = C.CONFIG.rows, Col = C.CONFIG.cols;
  var set = {};
  winCells.forEach(function(p){ set[p[0]+','+p[1]] = 1; });
  var out = [];
  var newCells = [];
  for (var r = 0; r < R; r++) out.push(new Array(Col).fill(null));
  for (var c = 0; c < Col; c++) {
    var stack = [];
    for (var r2 = R-1; r2 >= 0; r2--) {
      if (set[r2+','+c]) continue;
      stack.push(grid[r2][c]);
    }
    for (var i = 0; i < stack.length; i++) out[R-1-i][c] = stack[i];
    for (var k = 0; k < R - stack.length; k++) {
      out[k][c] = pickTumble();
      newCells.push([k, c]);
    }
  }
  return { grid: out, newCells: newCells };
}

/* ---------- 位置倍率工具（保留兼容，UI 层可能引用） ---------- */
var _pmPool = null;
function pickPosMult(){
  if (!_pmPool) {
    var arr = [], total = 0;
    for (var i = 0; i < C.POS_MULT_VALUES.length; i++) {
      var v = C.POS_MULT_VALUES[i], w = C.POS_MULT_WEIGHTS[v] || 0;
      total += w; arr.push({ v: v, cum: total });
    }
    _pmPool = { arr: arr, total: total };
  }
  var t = randFloat() * _pmPool.total, a = _pmPool.arr;
  for (var j = 0; j < a.length; j++) if (t < a[j].cum) return a[j].v;
  return a[a.length - 1].v;
}
function dropMultipliers(multGrid, count){
  var placed = [];
  var R = C.CONFIG.rows, Col = C.CONFIG.cols;
  var tries = 0;
  while (placed.length < count && tries < 60) {
    tries++;
    var r = Math.floor(randFloat() * R);
    var c = Math.floor(randFloat() * Col);
    if (multGrid[r][c] > 0) continue;
    var v = pickPosMult();
    multGrid[r][c] = v;
    placed.push({ r: r, c: c, value: v });
  }
  return placed;
}

/* ---------- 完整 spin（原版机制）---------- */
/* 参数 inFreeSpin：当前 base 和 FS 机制一致（仅 RTP 缩放不同）
     保留参数以便未来扩展（如 FS 中倍率更高概率） */
function playFullSpin(totalBet, inFreeSpin){
  var R = C.CONFIG.rows, Col = C.CONFIG.cols;
  var grid = spin();
  var multGrid = emptyMultGrid();
  var rounds = [];
  var totalWin = 0;
  var scatterCount = 0;
  var allMultipliers = [];

  var cellChance = inFreeSpin ? (C.POS_DROP_CHANCE_FS || C.POS_DROP_CHANCE || 0.10) : (C.POS_DROP_CHANCE || 0.10);
  var initVal = C.POS_INITIAL || 2;
  var maxVal = C.POS_MAX || 128;

  // 初始：无倍率（只有中奖覆盖时才首次出现）

  for (var t = 0; t < C.CONFIG.maxTumbles; t++) {
    var r = evaluate(grid, multGrid, totalBet);
    if (r.scatter.length && t === 0) scatterCount = r.scatter.length;
    if (r.wins.length === 0) {
      if (t === 0) rounds.push({ grid: grid, multGrid: JSON.parse(JSON.stringify(multGrid)), wins: [], roundWin: 0, newMults: [], scatter: r.scatter });
      break;
    }
    var winCells = [];
    r.wins.forEach(function(w){ w.cells.forEach(function(p){ winCells.push(p); }); });

    // 记录快照（翻倍前 = 本轮的倍数状态）
    rounds.push({ grid: grid, multGrid: JSON.parse(JSON.stringify(multGrid)), wins: r.wins, roundWin: r.totalWin, newMults: [], scatter: r.scatter });
    totalWin += r.totalWin;

    // === 1) 中奖格子的倍率翻倍（×2，上限 128） ===
    winCells.forEach(function(p){
      if (multGrid[p[0]][p[1]] > 0) {
        multGrid[p[0]][p[1]] = Math.min(multGrid[p[0]][p[1]] * 2, maxVal);
      }
    });

    // === 2) Tumble ===
    var tr = tumble(grid, winCells);
    grid = tr.grid;

    // === 3) 新补符号所在格：每格按概率带 2x（该格原本无倍率） ===
    var newMults = [];
    tr.newCells.forEach(function(p){
      if (multGrid[p[0]][p[1]] === 0 && randFloat() < cellChance) {
        multGrid[p[0]][p[1]] = initVal;
        newMults.push({ r: p[0], c: p[1], value: initVal });
        allMultipliers.push({ r: p[0], c: p[1], value: initVal });
      }
    });
    if (newMults.length && rounds.length > 0) {
      rounds[rounds.length - 1].newMults = newMults;
    }
  }

  return {
    rounds: rounds,
    totalWin: totalWin,
    finalGrid: grid,
    finalMultGrid: multGrid,
    scatterCount: scatterCount,
    allMultipliers: allMultipliers
  };
}

/* ---------- 免费旋转 ---------- */
function playFreeSpins(totalBet){
  var remaining = 10;
  var totalWin = 0;
  var spins = [];
  var spinIdx = 0;
  while (remaining > 0 && spinIdx < 100) {
    remaining--;
    spinIdx++;
    var r = playFullSpin(totalBet, true);
    totalWin += r.totalWin;
    var sc = r.scatterCount || 0;
    if (sc >= 3) {
      var add = C.SCATTER_RETRIGGER || 5;
      remaining += add;
    }
    spins.push({ idx: spinIdx, remaining: remaining, result: r });
  }
  return { spins: spins, totalWin: totalWin, count: spinIdx };
}

function setMode(m){
  _weights = (m === 'demo') ? C.WEIGHTS_DEMO : C.WEIGHTS_REAL;
  _payScale = (m === 'demo') ? C.CONFIG.payoutScaleDemo : C.CONFIG.payoutScaleReal;
  _pool = null; _tp = null; _pmPool = null;
}

function spinDemo(betAmount){
  var best = null;
  for (var i = 0; i < 4; i++) {
    var r = playFullSpin(betAmount, false);
    if (!best || r.totalWin > best.totalWin) best = r;
  }
  return best;
}

window.SugarEngine = {
  spin: spin,
  evaluate: evaluate,
  findClusters: findClusters,
  findScatter: findScatter,
  tumble: tumble,
  playFullSpin: playFullSpin,
  playFreeSpins: playFreeSpins,
  spinDemo: spinDemo,
  setMode: setMode,
  pickPosMult: pickPosMult,
  dropMultipliers: dropMultipliers,
  emptyMultGrid: emptyMultGrid,
  randFloat: randFloat
};
})();
