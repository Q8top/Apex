/* Apex - Grid geometry helpers (Sweet Bonanza 6x5 = 30 cells).
 *
 * Mounted as window.ApexEngineGrid (frozen).
 * Byte-identical mirror at functions/_engine/grid.js.
 * Sugar Rush has its own 7x7 grid module and does NOT use this one
 * for its own layout; any reference to ApexEngineGrid in SR files
 * is a Sweet leftover and must not affect SR geometry.
 *
 * Coordinate convention: row-major.
 *   index = row * columns + column
 *   0 <= row < rows, 0 <= column < columns
 *
 * Bounds policy:
 *   - getIndex(row, column) is a HOT PATH: it performs no bounds
 *     check and no type coercion. Caller MUST pass integer row/col
 *     within range. Passing anything else yields a garbage number
 *     (e.g. -1 -> -6, out-of-range col -> next row's index). This
 *     is intentional for RNG/tumble loops that already guard their
 *     own iteration bounds.
 *   - getIndexSafe(row, column) is the guarded variant: throws
 *     ApexError(INVALID_GRID_SIZE) when args are not integers or
 *     fall outside [0,rows) x [0,cols).
 *   - isIndexInside(idx) accepts any value and returns boolean.
 *
 * RESERVED (zero consumers at audit time; kept for API stability):
 *   - getRow(index)    Math.floor(index / columns)
 *   - getColumn(index) index % columns
 *   - clone(array)     shallow copy of an array
 *
 * clone() now throws ApexError(INVALID_GRID_SIZE) on non-array input
 * instead of a native TypeError, so callers can catch one error type.
 */
(function(){
'use strict';
var _err = window.ApexEngineErrors;
var GRID = Object.freeze({ columns: 6, rows: 5, size: 30 });

function getIndex(row, column){ return row * GRID.columns + column; }
function getRow(index){ return Math.floor(index / GRID.columns); }
function getColumn(index){ return index % GRID.columns; }

function getIndexSafe(row, column){
  if (!Number.isInteger(row) || !Number.isInteger(column) ||
      row < 0 || row >= GRID.rows ||
      column < 0 || column >= GRID.columns){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE,
      'getIndexSafe: row=' + row + ' col=' + column);
  }
  return row * GRID.columns + column;
}

function clone(grid){
  if (!Array.isArray(grid)){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE,
      'clone: expected array, got ' + (typeof grid));
  }
  return grid.slice();
}

function isIndexInside(idx){
  return Number.isInteger(idx) && idx >= 0 && idx < GRID.size;
}

window.ApexEngineGrid = Object.freeze({
  GRID: GRID,
  getIndex: getIndex,
  getIndexSafe: getIndexSafe,
  getRow: getRow,
  getColumn: getColumn,
  clone: clone,
  isIndexInside: isIndexInside
});
})();
