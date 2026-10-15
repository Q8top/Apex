/* Apex Olympus - random 6x5 symbols. */
(function () {
  'use strict';
  var COLS = 6, ROWS = 5;
  var TOTAL = COLS * ROWS;
  var SYM_COUNT = 13;
  var root = document.getElementById('olGrid');
  if (!root) return;
  var inner = document.createElement('div');
  inner.className = 'ol-grid-inner';
  function pick() { return Math.floor(Math.random() * SYM_COUNT); }
  for (var i = 0; i < TOTAL; i++) {
    var cell = document.createElement('div');
    cell.className = 'ol-cell';
    var img = document.createElement('img');
    img.src = '/assets/symbols/sym-' + pick() + '.webp?v=1';
    img.alt = ''; img.draggable = false;
    cell.appendChild(img);
    inner.appendChild(cell);
  }
  root.appendChild(inner);
})();
