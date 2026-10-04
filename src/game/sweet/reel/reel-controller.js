/* Sweet · Reel Controller
   6 列编排 + 事件广播。
   广播：'reel:start', 'reel:allstop'
   依赖：SweetReelDOM / SweetReel / SweetState / SweetEvents / SweetRNG / SweetGameConfig
*/
(function(){
'use strict';

var DOM = window.SweetReelDOM;
var Reel = window.SweetReel;
var State = window.SweetState;
var Events = window.SweetEvents;
var RNG = window.SweetRNG;

var COLS = 6;
var ROWS = 5;
var N = 15;
var GAP = 4;
var BASE_DELAY = 500;
var STAGGER = 120;

var layerEl = null;
var columns = [];

function init(layer){
  layerEl = layer;
  if (layerEl) layerEl.innerHTML = '';
  columns = [];
}

function build(targetGrid, symbolPool){
  if (!layerEl) return false;
  if (!targetGrid || !targetGrid.length) return false;
  if (!symbolPool || !symbolPool.length) return false;

  layerEl.innerHTML = '';
  columns = [];

  var frag = document.createDocumentFragment();
  for (var c = 0; c < COLS; c++) {
    var made = DOM.createColumn(c);
    var syms = [];
    for (var k = 0; k < N; k++) {
      if (k < N - ROWS) {
        syms.push(symbolPool[Math.floor(RNG.rand() * symbolPool.length)]);
      } else {
        syms.push(targetGrid[k - (N - ROWS)][c]);
      }
    }
    DOM.buildTrack(made.track, syms);
    frag.appendChild(made.col);
    columns.push({ col: c, colEl: made.col, track: made.track });
  }
  layerEl.appendChild(frag);

  var firstCol = columns[0].colEl;
  var colH = firstCol.clientHeight;
  var cellH = (colH - GAP * (ROWS - 1)) / ROWS;
  var step = cellH + GAP;

  for (var i = 0; i < columns.length; i++) {
    DOM.setSymbolHeight(columns[i].track, cellH);
    columns[i].colH = colH;
    columns[i].cellH = cellH;
    columns[i].step = step;
    columns[i].yStart = colH;
    columns[i].yFinal = -(N - ROWS) * step;
  }
  return true;
}

function start(gen){
  if (!columns.length) return;
  Events.emit('reel:start', { gen: gen });

  var done = 0;
  for (var i = 0; i < columns.length; i++) {
    (function(colIdx){
      var col = columns[colIdx];
      var dur = BASE_DELAY + colIdx * STAGGER;
      Reel.play({
        col: colIdx,
        track: col.track,
        yStart: col.yStart,
        yFinal: col.yFinal,
        dur: dur,
        gen: gen,
        onDone: function(){
          done++;
          if (done === COLS) Events.emit('reel:allstop', { gen: gen });
        }
      });
    })(i);
  }
}

function clear(){
  if (layerEl) layerEl.innerHTML = '';
  columns = [];
}

function geom(){
  if (!columns.length) return null;
  return {
    colH: columns[0].colH,
    cellH: columns[0].cellH,
    step: columns[0].step,
    N: N
  };
}

window.SweetReelController = {
  init: init,
  build: build,
  start: start,
  clear: clear,
  geom: geom,
  COLS: COLS,
  ROWS: ROWS,
  N: N,
  BASE_DELAY: BASE_DELAY,
  STAGGER: STAGGER
};
})();
