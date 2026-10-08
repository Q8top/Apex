(function(){
'use strict';
var GRID = Object.freeze({ columns: 6, rows: 5, size: 30 });
function getIndex(row, column){ return row * GRID.columns + column; }
function getRow(index){ return Math.floor(index / GRID.columns); }
function getColumn(index){ return index % GRID.columns; }
function clone(grid){ return grid.slice(); }
function isIndexInside(idx){ return Number.isInteger(idx) && idx >= 0 && idx < GRID.size; }
window.ApexEngineGrid = Object.freeze({
  GRID: GRID,
  getIndex: getIndex,
  getRow: getRow,
  getColumn: getColumn,
  clone: clone,
  isIndexInside: isIndexInside
});
})();
