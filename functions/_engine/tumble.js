(function(){
'use strict';
var _err = window.ApexEngineErrors;
var _g = window.ApexEngineGrid;

function removePositions(grid, positions){
  if (!Array.isArray(grid) || grid.length !== _g.GRID.size){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'grid must be 30');
  }
  var set = {};
  for (var i = 0; i < positions.length; i++){
    var p = positions[i];
    if (!_g.isIndexInside(p)) throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'bad position');
    set[p] = true;
  }
  var out = grid.slice();
  for (var k in set){ if (Object.prototype.hasOwnProperty.call(set, k)) out[k|0] = null; }
  return out;
}

function refillColumns(grid, rng){
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
  return refillColumns(removePositions(grid, winningPositions), rng);
}

window.ApexEngineTumble = Object.freeze({
  tumble: tumble,
  removePositions: removePositions,
  refillColumns: refillColumns
});
})();
