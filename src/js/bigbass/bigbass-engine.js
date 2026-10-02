/* 大鱼大亨 · 引擎
   5×3 固定 10 线 · 渔民 Wild/Scatter · 金钱鱼收集 · 3 档免费旋转
*/
(function(){
'use strict';

var C = window.BigBassConfig;

function randFloat(){
  var b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / 4294967296;
}

var _weights = C.WEIGHTS_REAL;
var _payScale = C.CONFIG.payoutScaleReal;
var _pool = null;
function buildPool(){
  var arr = [], total = 0;
  for (var k in _weights) {
    if (!_weights.hasOwnProperty(k)) continue;
    if (_weights[k] <= 0) continue;
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

function emptyGrid(){
  var g = [];
  for (var c = 0; c < C.CONFIG.cols; c++) {
    var col = [];
    for (var r = 0; r < C.CONFIG.rows; r++) col.push(null);
    g.push(col);
  }
  return g;
}

/* grid 格式：grid[col][row] */
function spin(){
  var g = emptyGrid();
  for (var c = 0; c < C.CONFIG.cols; c++)
    for (var r = 0; r < C.CONFIG.rows; r++)
      g[c][r] = pick();
  return g;
}

/* 采集 fisherman scatter */
function countScatter(grid){
  var n = 0;
  for (var c = 0; c < C.CONFIG.cols; c++)
    for (var r = 0; r < C.CONFIG.rows; r++)
      if (grid[c][r] === 'fisherman') n++;
  return n;
}

/* 单条线评估：从第 0 列开始连续相同（wild 可替代，除 fisherman/moneyFish） */
function evalLine(grid, line, lineBet){
  var firstSym = null;
  var wildCount = 0;
  var matchCount = 0;
  for (var i = 0; i < line.length; i++) {
    var c = i, r = line[i];
    var sym = grid[c][r];
    if (sym === 'fisherman' || sym === 'moneyFish') break;
    if (sym === 'wild') {
      if (firstSym === null) { wildCount++; matchCount++; continue; }
      matchCount++; continue;
    }
    if (firstSym === null) { firstSym = sym; matchCount = wildCount + 1; }
    else if (sym === firstSym) { matchCount++; }
    else break;
  }
  if (firstSym === null || matchCount < 3) return null;
  // 全部是 wild 的情况（不可能因为 fisherman scatter 不是 wild 符号）
  var tbl = C.PAYOUTS[firstSym]; if (!tbl) return null;
  var mult = 0;
  var keys = [3,4,5];
  for (var k = 0; k < keys.length; k++) if (matchCount >= keys[k]) mult = tbl[keys[k]];
  if (mult <= 0) return null;
  var amt = mult * lineBet * _payScale;
  var cells = [];
  for (var m = 0; m < matchCount; m++) cells.push([m, line[m]]);
  return { symbol: firstSym, size: matchCount, cells: cells, lineMult: mult, amount: amt };
}

function evaluate(grid, totalBet){
  var lineBet = totalBet / C.CONFIG.lines;
  var wins = [], total = 0;
  for (var li = 0; li < C.PAYLINES.length; li++) {
    var w = evalLine(grid, C.PAYLINES[li], lineBet);
    if (w) { w.lineIndex = li; wins.push(w); total += w.amount; }
  }
  return { wins: wins, totalWin: total };
}

/* 金钱鱼金额抽取 */
var _fvPool = null;
function pickFishValue(){
  if (!_fvPool) {
    var arr = [], tot = 0;
    for (var i = 0; i < C.FISH_VALUES.length; i++) {
      var v = C.FISH_VALUES[i], w = C.FISH_WEIGHTS[v] || 0;
      tot += w; arr.push({ v: v, cum: tot });
    }
    _fvPool = { arr: arr, total: tot };
  }
  var t = randFloat() * _fvPool.total, a = _fvPool.arr;
  for (var j = 0; j < a.length; j++) if (t < a[j].cum) return a[j].v;
  return a[a.length - 1].v;
}

/* 在 grid 随机位置落 n 个金钱鱼（返回 [{c,r,value}]） */
function dropFish(grid, n){
  var placed = [];
  var tries = 0;
  while (placed.length < n && tries < 40) {
    tries++;
    var c = Math.floor(randFloat() * C.CONFIG.cols);
    var r = Math.floor(randFloat() * C.CONFIG.rows);
    if (grid[c][r] === 'moneyFish' || grid[c][r] === 'fisherman') continue;
    var dup = false;
    for (var k = 0; k < placed.length; k++) if (placed[k].c === c && placed[k].r === r) dup = true;
    if (dup) continue;
    var v = pickFishValue();
    grid[c][r] = 'moneyFish';
    placed.push({ c: c, r: r, value: v });
  }
  return placed;
}

/* 从 grid 随机位置落 n 个渔民（返回 [{c,r}]） */
function dropFisherman(grid, n){
  var placed = [];
  var tries = 0;
  while (placed.length < n && tries < 40) {
    tries++;
    var c = Math.floor(randFloat() * C.CONFIG.cols);
    var r = Math.floor(randFloat() * C.CONFIG.rows);
    if (grid[c][r] === 'moneyFish' || grid[c][r] === 'fisherman') continue;
    var dup = false;
    for (var k = 0; k < placed.length; k++) if (placed[k].c === c && placed[k].r === r) dup = true;
    if (dup) continue;
    grid[c][r] = 'fisherman';
    placed.push({ c: c, r: r });
  }
  return placed;
}

/* 完整 base spin */
function playFullSpin(totalBet){
  var grid = spin();
  var r = evaluate(grid, totalBet);
  var scatterCount = countScatter(grid);
  return {
    grid: grid, wins: r.wins, totalWin: r.totalWin,
    scatterCount: scatterCount, moneyFishes: [], fishermen: [],
    collectWin: 0, level: 1
  };
}

function setMode(m){
  _weights = (m === 'demo') ? C.WEIGHTS_DEMO : C.WEIGHTS_REAL;
  _payScale = (m === 'demo') ? C.CONFIG.payoutScaleDemo : C.CONFIG.payoutScaleReal;
  _pool = null; _fvPool = null;
}

function spinDemo(betAmount){
  var best = null;
  for (var i = 0; i < 4; i++) {
    var r = playFullSpin(betAmount);
    if (!best || r.totalWin > best.totalWin) best = r;
  }
  return best;
}

/* 免费旋转：10 次起，按 3 档位玩 */
function playFreeSpins(totalBet){
  var lineBet = totalBet / C.CONFIG.lines;
  var level = 0;  // 0/1/2 → 收集倍数 1/2/3
  var remaining = 10;
  var totalWin = 0;
  var spins = [];
  var spinIdx = 0;
  while (remaining > 0 && spinIdx < 200) {
    remaining--;
    spinIdx++;
    var grid = spin();
    // base line 赢分
    var r = evaluate(grid, totalBet);
    var spinWin = r.totalWin;
    // 按当前档位概率落金钱鱼
    var fishN = 0;
    if (randFloat() < C.FISH_DROP_RATE[level]) {
      fishN = Math.floor(randFloat() * C.FISH_MAX_PER_SPIN[level]) + 1;
    }
    var fishes = dropFish(grid, fishN);
    // 按概率落渔民
    var wilds = [];
    if (fishes.length > 0 && randFloat() < C.WILD_DROP_RATE[level]) {
      var wn = 1 + (randFloat() < 0.15 ? 1 : 0);
      wilds = dropFisherman(grid, wn);
    }
    // 渔民收集所有金钱鱼
    var collectWin = 0;
    if (wilds.length > 0 && fishes.length > 0) {
      var collectMult = C.FS_LEVELS[level].mult;
      fishes.forEach(function(f){ collectWin += f.value * lineBet * _payScale * collectMult; });
    }
    // 4 个渔民 → 升级档位 + 加 10 次
    var scatterInFs = countScatter(grid);
    var levelUp = false;
    if (scatterInFs >= C.FS_LEVEL_UP_WILDS && level < C.FS_LEVELS.length - 1) {
      level++; remaining += C.FS_LEVEL_UP_ADD; levelUp = true;
    } else if (scatterInFs >= C.FS_LEVEL_UP_WILDS) {
      remaining += C.FS_LEVEL_UP_ADD; levelUp = true;
    }
    var fsWin = spinWin + collectWin;
    totalWin += fsWin;
    spins.push({
      idx: spinIdx, remaining: remaining, level: level + 1,
      grid: grid, wins: r.wins, moneyFishes: fishes, fishermen: wilds,
      baseWin: spinWin, collectWin: collectWin, win: fsWin,
      levelUp: levelUp
    });
  }
  return { spins: spins, totalWin: totalWin, count: spinIdx, finalLevel: level + 1 };
}

window.BigBassEngine = {
  spin: spin,
  evaluate: evaluate,
  evalLine: evalLine,
  countScatter: countScatter,
  playFullSpin: playFullSpin,
  playFreeSpins: playFreeSpins,
  spinDemo: spinDemo,
  setMode: setMode,
  pickFishValue: pickFishValue,
  dropFish: dropFish,
  dropFisherman: dropFisherman,
  randFloat: randFloat
};
})();
