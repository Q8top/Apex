/* Apex · 通用固定线引擎
   支持 3×3 / 5×3 / 5×4 等网格 + 任意线数
   每款游戏通过 config 传入：reels/rows/paylines/payouts/weights/wild/scatter
*/
(function(){
'use strict';

var _cfg = null;
var _payScale = 1;
var _weights = null;
var _pool = null;
var _mode = 'real';
var _reels = 5, _rows = 3;
var _paylines = [];
var _payouts = {};
var _wild = 'wild';
var _scatter = 'scatter';
var _scatterTrigger = {3:10, 4:15, 5:20};
var _scatterRetrigger = 5;

function randFloat(){
  var b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / 4294967296;
}

function init(cfg){
  _cfg = cfg;
  _reels = cfg.cols;
  _rows = cfg.rows;
  _paylines = cfg.paylines;
  _payouts = cfg.payouts;
  _wild = cfg.wild || 'wild';
  _scatter = cfg.scatter || 'scatter';
  _scatterTrigger = cfg.scatterTrigger || {3:10, 4:15, 5:20};
  _scatterRetrigger = cfg.scatterRetrigger || 5;
  _weights = cfg.weightsReal;
  _payScale = cfg.payScaleReal || 1;
  _pool = null;
}

function buildPool(){
  var arr = [], total = 0;
  for(var k in _weights){
    if(!_weights.hasOwnProperty(k)) continue;
    total += _weights[k];
    arr.push({id:k, cum:total});
  }
  _pool = {arr:arr, total:total};
}

function pick(){
  if(!_pool) buildPool();
  var t = randFloat() * _pool.total, a = _pool.arr;
  for(var i=0;i<a.length;i++) if(t < a[i].cum) return a[i].id;
  return a[a.length-1].id;
}

function spin(){
  var g = [];
  for(var c=0;c<_reels;c++){
    var col = [];
    for(var r=0;r<_rows;r++) col.push(pick());
    g.push(col);
  }
  return g;
}

function evalLine(grid, line){
  var firstSym = null, count = 0, cells = [];
  for(var i=0;i<line.length;i++){
    var sym = grid[i][line[i]];
    if(sym === _scatter) break;
    if(sym === _wild){ count++; cells.push([i, line[i]]); continue; }
    if(firstSym === null){ firstSym = sym; count++; cells.push([i, line[i]]); }
    else if(sym === firstSym){ count++; cells.push([i, line[i]]); }
    else break;
  }
  if(firstSym === null || count < 3) return null;
  var tbl = _payouts[firstSym]; if(!tbl) return null;
  var mult = 0;
  [3,4,5].forEach(function(n){ if(count >= n && tbl[n] > mult) mult = tbl[n]; });
  if(mult <= 0) return null;
  return {symbol:firstSym, count:count, cells:cells, mult:mult, amount:mult * _payScale};
}

function countScatter(grid){
  var n = 0;
  for(var c=0;c<_reels;c++) for(var r=0;r<_rows;r++) if(grid[c][r] === _scatter) n++;
  return n;
}

function evaluate(grid, bet){
  var lineBet = bet / _paylines.length;
  var wins = [], total = 0;
  for(var li=0;li<_paylines.length;li++){
    var w = evalLine(grid, _paylines[li]);
    if(w){ w.lineIndex = li; w.amount = w.amount * lineBet; wins.push(w); total += w.amount; }
  }
  return {wins:wins, totalWin:total, scatter:countScatter(grid)};
}

function setMode(m){
  _mode = (m === 'demo') ? 'demo' : 'real';
  if(_mode === 'demo'){
    _weights = _cfg.weightsDemo;
    _payScale = _cfg.payScaleDemo;
  } else {
    _weights = _cfg.weightsReal;
    _payScale = _cfg.payScaleReal;
  }
  _pool = null;
}

function playFullSpin(bet){
  var grid = spin();
  var r = evaluate(grid, bet);
  return {grid:grid, wins:r.wins, totalWin:r.totalWin, scatterCount:r.scatter};
}

function playFreeSpins(bet){
  var count = _scatterTrigger[3] || 10;
  var total = 0, spins = [], idx = 0;
  while(idx < count && idx < 200){
    idx++;
    var r = playFullSpin(bet);
    total += r.totalWin;
    spins.push({idx:idx, remaining:count-idx, result:r});
    if(r.scatterCount >= 3) count += _scatterRetrigger;
  }
  return {spins:spins, totalWin:total, count:idx};
}

function spinDemo(bet){
  var best = null;
  for(var i=0;i<4;i++){
    var r = playFullSpin(bet);
    if(!best || r.totalWin > best.totalWin) best = r;
  }
  return best;
}

window.LinesEngine = {
  init:init, setMode:setMode,
  spin:spin, evaluate:evaluate, evalLine:evalLine,
  playFullSpin:playFullSpin, playFreeSpins:playFreeSpins,
  spinDemo:spinDemo, countScatter:countScatter,
  randFloat:randFloat
};
})();
