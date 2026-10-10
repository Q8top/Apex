(function(){
'use strict';
var GRID = Object.freeze({ columns: 7, rows: 7, size: 49 });
function getIndex(row, column){ return row * GRID.columns + column; }
function getRow(index){ return Math.floor(index / GRID.columns); }
function getColumn(index){ return index % GRID.columns; }
function clone(grid){ return grid.slice(); }
function isIndexInside(idx){
  return Number.isInteger(idx) && idx >= 0 && idx < GRID.size;
}
window.ApexSugarRushGrid = Object.freeze({
  GRID: GRID,
  getIndex: getIndex,
  getRow: getRow,
  getColumn: getColumn,
  clone: clone,
  isIndexInside: isIndexInside
});
})();
