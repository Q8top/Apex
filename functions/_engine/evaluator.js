(function(){
'use strict';
var _err = window.ApexEngineErrors;
var _lock = window.ApexSymbolsLocked;
var _ptl = window.ApexPaytableLocked;

function lookupPayout(table, count){
  if (!table) return 0;
  var keys = Object.keys(table).map(Number).sort(function(a,b){ return b - a; });
  for (var i = 0; i < keys.length; i++){
    if (count >= keys[i]) return table[keys[i]];
  }
  return 0;
}

function evaluate(grid){
  if (!Array.isArray(grid) || grid.length !== 30){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'grid must be 30-length array');
  }
  var counts = {};
  var positions = {};
  for (var i = 0; i < grid.length; i++){
    var sid = grid[i];
    counts[sid] = (counts[sid] || 0) + 1;
    if (!positions[sid]) positions[sid] = [];
    positions[sid].push(i);
  }
  var wins = [];
  var winningPositions = [];
  var payoutMultiplier = 0;
  var scatterCount = 0;
  var multiplierPositions = [];
  var symIds = Object.keys(counts);
  for (var j = 0; j < symIds.length; j++){
    var id = symIds[j];
    var kind = _lock.kindOf(id);
    var count = counts[id];
    if (kind === 'scatter'){ scatterCount = count; continue; }
    if (kind === 'multiplier'){
      for (var m = 0; m < positions[id].length; m++) multiplierPositions.push(positions[id][m]);
      continue;
    }
    if (kind !== 'regular') continue;
    var meta = _lock.LOCKED[id];
    var pkey = meta.paytableKey;
    var table = _ptl.PAYTABLE_SNAPSHOT[pkey];
    var payout = lookupPayout(table, count);
    if (payout > 0){
      var w = { symbol: id, count: count, payoutMultiplier: payout, positions: positions[id].slice() };
      wins.push(w);
      payoutMultiplier += payout;
      for (var p = 0; p < w.positions.length; p++) winningPositions.push(w.positions[p]);
    }
  }
  return {
    wins: wins,
    winningPositions: winningPositions,
    payoutMultiplier: payoutMultiplier,
    scatterCount: scatterCount,
    multiplierPositions: multiplierPositions
  };
}

window.ApexEngineEvaluator = Object.freeze({ evaluate: evaluate, lookupPayout: lookupPayout });
})();
