/* Apex - Tumble / cascade refill for Sweet Bonanza 6x5.
 *
 * Mounted as window.ApexEngineTumble (frozen).
 * Byte-identical mirror at functions/_engine/tumble.js.
 *
 * Coordinate convention: grid is a 30-element row-major array.
 *   index = row * 6 + column, 0 <= row < 5, 0 <= column < 6
 * Positions are integer indices into this array, NOT (r,c) pairs.
 *
 * API:
 *   removePositions(grid, positions)
 *     Returns a shallow copy of grid with each position set to null.
 *     Validates grid is a 30-length array and every position is a
 *     valid in-bounds index. Duplicate positions are deduplicated.
 *     Empty positions array returns a plain copy (no-op).
 *   refillColumns(grid, rng)
 *     For each column bottom-to-top, keeps non-null symbols in order,
 *     then fills the remaining top slots with rng.pickSymbol().
 *     Validates grid shape and rng interface.
 *   tumble(grid, winningPositions, rng)
 *     removePositions(...) then refillColumns(...). Winning positions
 *     must be a non-empty array; empty input throws to surface bugs
 *     where the engine forgot to check win existence.
 *
 * Null vs undefined: a cell counts as 'empty' only when === null.
 * Passing undefined entries in a grid is rejected by the shape check.
 *
 * Consumer status (audit of file 12/85):
 *   tumble() read by game-engine.js via _tumble alias
 *   removePositions / refillColumns TEST-ONLY but exported for
 *   future partial-step needs (e.g. previewing cascade without
 *   actually mutating a live grid).
 */
(function(){
'use strict';
var _err = window.ApexEngineErrors;
var _g = window.ApexEngineGrid;

function _assertGrid(grid){
  if (!Array.isArray(grid) || grid.length !== _g.GRID.size){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'grid must be ' + _g.GRID.size);
  }
}

function removePositions(grid, positions){
  _assertGrid(grid);
  if (!Array.isArray(positions)){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'positions must be an array');
  }
  var set = Object.create(null);
  for (var i = 0; i < positions.length; i++){
    var p = positions[i];
    if (!_g.isIndexInside(p)){
      throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'bad position ' + p);
    }
    set[p] = true;
  }
  var out = grid.slice();
  for (var k in set){
    out[Number(k)] = null;
  }
  return out;
}

function refillColumns(grid, rng){
  _assertGrid(grid);
  if (!rng || typeof rng.pickSymbol !== 'function'){
    throw _err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'rng.pickSymbol missing');
  }
  var cols = _g.GRID.columns, rows = _g.GRID.rows;
  var out = grid.slice();
  for (var c = 0; c < cols; c++){
    var colVals = [];
    for (var r = rows - 1; r >= 0; r--){
      var idx = _g.getIndex(r, c);
      if (out[idx] !== null) colVals.push(out[idx]);
    }
    while (colVals.length < rows) colVals.push(rng.pickSymbol());
    for (var rr = 0; rr < rows; rr++){
      out[_g.getIndex(rr, c)] = colVals[rows - 1 - rr];
    }
  }
  return out;
}

function tumble(grid, winningPositions, rng){
  if (!Array.isArray(winningPositions) || winningPositions.length === 0){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'winningPositions must be non-empty array');
  }
  return refillColumns(removePositions(grid, winningPositions), rng);
}

window.ApexEngineTumble = Object.freeze({
  tumble: tumble,
  removePositions: removePositions,
  refillColumns: refillColumns
});
})();
