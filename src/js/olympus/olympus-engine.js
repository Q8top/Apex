/* 奥林匹斯之门 · 引擎 v2
   - CSPRNG 生成 6×5 grid
   - Cluster 检测（水平/垂直相邻 ≥minCluster 同符号）
   - Tumble：中奖格消失 → 上方下落 → 顶部补新
   - 倍数阶梯：每次 tumble 递增
   - demo 模式：跑 2 次取最优（命中率提升至 ~55%）
*/
(function(){
'use strict';

var C = window.OlympusConfig;

function randFloat(){
  var b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / 4294967296;
}

var _weights = C.WEIGHTS_REAL;
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
function pickSymbol(){
  if (!_pool) buildPool();
  var t = randFloat() * _pool.total, a = _pool.arr;
  for (var i = 0; i < a.length; i++) if (t < a[i].cum) return a[i].id;
  return a[a.length - 1].id;
}

function spin(){
  var g = [];
  for (var r = 0; r < C.CONFIG.rows; r++) {
    var row = [];
    for (var c = 0; c < C.CONFIG.cols; c++) row.push(pickSymbol());
    g.push(row);
  }
  return g;
}

/* Cluster 检测：BFS 找同符号连通块 */
function findClusters(grid){
  var rows = C.CONFIG.rows, cols = C.CONFIG.cols;
  var minN = C.CONFIG.minCluster;
  var visited = [];
  for (var i = 0; i < rows; i++) visited.push(new Array(cols).fill(false));
  var clusters = [];

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      if (visited[r][c]) continue;
      var sym = grid[r][c];
      if (!sym) { visited[r][c] = true; continue; }

      var queue = [[r,c]], cells = [], head = 0;
      visited[r][c] = true;
      while (head < queue.length) {
        var cur = queue[head++];
        cells.push(cur);
        var dirs = [[0,1],[1,0],[0,-1],[-1,0]];
        for (var d = 0; d < 4; d++) {
          var nr = cur[0] + dirs[d][0], nc = cur[1] + dirs[d][1];
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (visited[nr][nc]) continue;
          if (grid[nr][nc] !== sym) continue;
          visited[nr][nc] = true;
          queue.push([nr,nc]);
        }
      }
      if (cells.length >= minN) clusters.push({ symbol: sym, cells: cells, size: cells.length });
    }
  }
  return clusters;
}

function payoutFor(symbol, size){
  var tbl = C.PAYOUTS[symbol]; if (!tbl) return 0;
  var keys = Object.keys(tbl).map(Number).sort(function(a,b){ return a - b; });
  var mult = 0;
  for (var i = 0; i < keys.length; i++) if (size >= keys[i]) mult = tbl[keys[i]];
  return mult;
}

function evaluate(grid, totalBet){
  var cellBet = totalBet / C.CONFIG.baseCellBet;
  var clusters = findClusters(grid);
  var wins = [], totalWin = 0;
  clusters.forEach(function(cl){
    var mult = payoutFor(cl.symbol, cl.size);
    var amount = mult * cellBet;
    wins.push({ symbol: cl.symbol, size: cl.size, cells: cl.cells, multiplier: mult, amount: amount });
    totalWin += amount;
  });
  return { wins: wins, totalWin: totalWin };
}

/* Tumble：移除中奖格 → 上方下落 → 顶部补新 */
function tumble(grid, allWinCells){
  var rows = C.CONFIG.rows, cols = C.CONFIG.cols;
  var winSet = {};
  allWinCells.forEach(function(p){ winSet[p[0] + ',' + p[1]] = true; });
  var newGrid = [];
  for (var r = 0; r < rows; r++) newGrid.push(new Array(cols).fill(null));

  for (var c = 0; c < cols; c++) {
    var stack = [];
    for (var r = rows - 1; r >= 0; r--) {
      if (winSet[r + ',' + c]) continue;
      stack.push(grid[r][c]);
    }
    for (var i = 0; i < stack.length; i++) newGrid[rows - 1 - i][c] = stack[i];
    var empty = rows - stack.length;
    for (var k = 0; k < empty; k++) newGrid[k][c] = pickSymbol();
  }
  return newGrid;
}

/* 完整 spin：循环 tumble */
function playFullSpin(totalBet){
  var grid = spin();
  var rounds = [];
  var totalWin = 0;
  var mults = C.TUMBLE_MULTIPLIERS;

  for (var t = 0; t < C.CONFIG.maxTumbles; t++) {
    var r = evaluate(grid, totalBet);
    var roundMult = mults[Math.min(t, mults.length - 1)];
    if (r.wins.length === 0) {
      if (t === 0) rounds.push({ grid: grid, wins: [], roundWin: 0, multiplier: 1 });
      break;
    }
    var roundWin = r.totalWin * roundMult;
    totalWin += roundWin;
    var winCells = [];
    r.wins.forEach(function(w){ w.cells.forEach(function(p){ winCells.push(p); }); });
    rounds.push({ grid: grid, wins: r.wins, roundWin: roundWin, multiplier: roundMult });
    grid = tumble(grid, winCells);
  }
  return { rounds: rounds, totalWin: totalWin, finalGrid: grid };
}

function setMode(mode){
  _weights = (mode === 'demo') ? C.WEIGHTS_DEMO : C.WEIGHTS_REAL;
  _pool = null;
}

/* demo：跑 2 次取较高者，提高命中率 */
function spinDemo(betAmount){
  var a = playFullSpin(betAmount);
  var b = playFullSpin(betAmount);
  return (b.totalWin > a.totalWin) ? b : a;
}

window.OlympusEngine = {
  spin: spin,
  evaluate: evaluate,
  tumble: tumble,
  findClusters: findClusters,
  playFullSpin: playFullSpin,
  spinDemo: spinDemo,
  setMode: setMode,
  randFloat: randFloat
};
})();
