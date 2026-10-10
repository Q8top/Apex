(function(){
'use strict';
var _err = window.ApexSugarRushErrors;
var _g = window.ApexSugarRushGrid;
var _lock = window.ApexSugarRushSymbolsLocked;
var _ptl = window.ApexSugarRushPaytableLocked;

function lookupPayout(table, count){
  if (!table) return 0;
  var keys = Object.keys(table).map(Number).sort(function(a,b){ return b - a; });
  for (var i = 0; i < keys.length; i++){
    if (count >= keys[i]) return table[keys[i]];
  }
  return 0;
}

function findClusters(grid, symbolId){
  var cols = _g.GRID.columns, rows = _g.GRID.rows, total = _g.GRID.size;
  var seen = new Uint8Array(total);
  var clusters = [];
  for (var i = 0; i < total; i++){
    if (seen[i] || grid[i] !== symbolId) continue;
    var queue = [i];
    seen[i] = 1;
    var cluster = [];
    while (queue.length){
      var p = queue.shift();
      cluster.push(p);
      var r = Math.floor(p / cols);
      var c = p % cols;
      if (r > 0) { var up = _g.getIndex(r-1,c); if (!seen[up] && grid[up] === symbolId){ seen[up]=1; queue.push(up); } }
      if (r < rows-1) { var dn = _g.getIndex(r+1,c); if (!seen[dn] && grid[dn] === symbolId){ seen[dn]=1; queue.push(dn); } }
      if (c > 0) { var lf = _g.getIndex(r,c-1); if (!seen[lf] && grid[lf] === symbolId){ seen[lf]=1; queue.push(lf); } }
      if (c < cols-1) { var rt = _g.getIndex(r,c+1); if (!seen[rt] && grid[rt] === symbolId){ seen[rt]=1; queue.push(rt); } }
    }
    clusters.push(cluster);
  }
  return clusters;
}

function evaluate(grid){
  var total = _g.GRID.size;
  if (!Array.isArray(grid) || grid.length !== total){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'grid must be ' + total + '-length array');
  }
  var wins = [];
  var winningPositions = [];
  var multiplierPositions = [];
  var payoutMultiplier = 0;
  var scatterCount = 0;
  for (var i = 0; i < total; i++){
    var sid = grid[i];
    var kind = _lock.kindOf(sid);
    if (kind === 'scatter'){ scatterCount++; }
    else if (kind === 'multiplier'){ multiplierPositions.push(i); }
  }
  var symIds = _lock.list();
  for (var j = 0; j < symIds.length; j++){
    var id = symIds[j];
    if (_lock.kindOf(id) !== 'regular') continue;
    var meta = _lock.LOCKED[id];
    var table = _ptl.PAYTABLE_SNAPSHOT[meta.paytableKey];
    var clusters = findClusters(grid, id);
    for (var k = 0; k < clusters.length; k++){
      var cl = clusters[k];
      if (cl.length < _ptl.MIN_MATCH) continue;
      var payout = lookupPayout(table, cl.length);
      if (payout > 0){
        wins.push({ symbol: id, count: cl.length, payoutMultiplier: payout, positions: cl.slice() });
        payoutMultiplier += payout;
        for (var p = 0; p < cl.length; p++) winningPositions.push(cl[p]);
      }
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

window.ApexSugarRushEvaluator = Object.freeze({ evaluate: evaluate, lookupPayout: lookupPayout, findClusters: findClusters });
})();
