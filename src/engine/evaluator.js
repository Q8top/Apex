/* Apex - Sweet Bonanza cluster evaluator (6x5, row-major).
 *
 * Mounted as window.ApexEngineEvaluator (frozen).
 * Byte-identical mirror at functions/_engine/evaluator.js.
 *
 * Original-game semantics: regular symbols pay as CLUSTERS of
 * 8+ orthogonally connected cells (up/down/left/right, no
 * diagonals). This replaces the legacy anywhere-counting logic
 * that paid if N total occurrences existed regardless of
 * adjacency - a divergence from the source game.
 *
 * Scatter and multiplier remain ANYWHERE:
 *   scatterCount         total cells of the scatter symbol
 *   multiplierPositions  every cell index of the multiplier symbol
 *
 * evaluate(grid) -> { wins, winningPositions, payoutMultiplier,
 *                    scatterCount, multiplierPositions }
 *   wins: [{symbol, count, payoutMultiplier, positions}]
 *         one entry per qualifying cluster (>= MIN_MATCH)
 *   winningPositions: flat array of every cell in any winning cluster
 *
 * lookupPayout(table, count): highest paytable tier <= count.
 */
(function(){
'use strict';
var _err = window.ApexEngineErrors;
var _g = window.ApexEngineGrid;
var _lock = window.ApexSymbolsLocked;
var _ptl = window.ApexPaytableLocked;

var ROWS = 5, COLS = 6, SIZE = 30;

function lookupPayout(table, count){
  if (!table) return 0;
  if (!Number.isSafeInteger(count) || count <= 0) return 0;
  var keys = Object.keys(table).map(Number).sort(function(a,b){ return b - a; });
  for (var i = 0; i < keys.length; i++){
    if (count >= keys[i]) return table[keys[i]];
  }
  return 0;
}

function _clustersFor(grid, symbolId){
  var seen = new Array(SIZE);
  var out = [];
  for (var i = 0; i < SIZE; i++){
    if (seen[i] || grid[i] !== symbolId) continue;
    var cluster = [];
    var queue = [i];
    seen[i] = 1;
    while (queue.length){
      var p = queue.shift();
      cluster.push(p);
      var r = _g.getRow(p), c = _g.getColumn(p);
      if (r > 0){ var up = _g.getIndex(r-1, c); if (!seen[up] && grid[up] === symbolId){ seen[up] = 1; queue.push(up); } }
      if (r < ROWS-1){ var dn = _g.getIndex(r+1, c); if (!seen[dn] && grid[dn] === symbolId){ seen[dn] = 1; queue.push(dn); } }
      if (c > 0){ var lf = _g.getIndex(r, c-1); if (!seen[lf] && grid[lf] === symbolId){ seen[lf] = 1; queue.push(lf); } }
      if (c < COLS-1){ var rt = _g.getIndex(r, c+1); if (!seen[rt] && grid[rt] === symbolId){ seen[rt] = 1; queue.push(rt); } }
    }
    out.push(cluster);
  }
  return out;
}

function evaluate(grid){
  if (!Array.isArray(grid) || grid.length !== SIZE){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'grid must be ' + SIZE);
  }
  for (var i = 0; i < SIZE; i++){
    var sid = grid[i];
    if (typeof sid !== 'string' || !sid){
      throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'grid[' + i + '] invalid');
    }
  }

  var seenIds = {};
  for (var k = 0; k < SIZE; k++) seenIds[grid[k]] = 1;
  var ids = Object.keys(seenIds);

  var wins = [];
  var winningPositions = [];
  var payoutMultiplier = 0;
  var scatterCount = 0;
  var multiplierPositions = [];
  var minMatch = (_ptl && Number.isSafeInteger(_ptl.MIN_MATCH)) ? _ptl.MIN_MATCH : 8;

  for (var n = 0; n < ids.length; n++){
    var id = ids[n];
    var kind = _lock.kindOf(id);
    if (kind === 'scatter'){
      for (var s = 0; s < SIZE; s++) if (grid[s] === id) scatterCount++;
      continue;
    }
    if (kind === 'multiplier'){
      for (var m = 0; m < SIZE; m++) if (grid[m] === id) multiplierPositions.push(m);
      continue;
    }
    if (kind !== 'regular') continue;
    var meta = _lock.LOCKED[id];
    if (!meta) continue;
    var table = _ptl.PAYTABLE_SNAPSHOT[meta.paytableKey];
    var clusters = _clustersFor(grid, id);
    for (var ci = 0; ci < clusters.length; ci++){
      var cl = clusters[ci];
      if (cl.length < minMatch) continue;
      var payout = lookupPayout(table, cl.length);
      if (payout <= 0) continue;
      wins.push({ symbol: id, count: cl.length, payoutMultiplier: payout, positions: cl.slice() });
      payoutMultiplier += payout;
      for (var cp = 0; cp < cl.length; cp++) winningPositions.push(cl[cp]);
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
