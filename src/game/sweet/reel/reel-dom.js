/* Sweet · Reel DOM
   职责：DOM 构造 + transform 更新。
   不负责动画状态、不负责事件广播。
*/
(function(){
'use strict';

var R = window.SweetSymbolRenderer;

function createColumn(colIndex){
  var col = document.createElement('div');
  col.className = 'reel-col';
  col.setAttribute('data-col', String(colIndex));

  var track = document.createElement('div');
  track.className = 'reel-track';

  col.appendChild(track);
  return { col: col, track: track };
}

function buildTrack(track, symbols){
  var frag = document.createDocumentFragment();
  for (var i = 0; i < symbols.length; i++) {
    var el = document.createElement('div');
    el.className = 'reel-sym';
    el.innerHTML = R.get(symbols[i]);
    frag.appendChild(el);
  }
  track.innerHTML = '';
  track.appendChild(frag);
}

function setTransform(track, y){
  track.style.transform = 'translate3d(0,' + y + 'px,0)';
}

function setTransition(track, val){
  track.style.transition = val || '';
}

function setSymbolHeight(track, h){
  var kids = track.children;
  for (var i = 0; i < kids.length; i++) kids[i].style.height = h + 'px';
}

window.SweetReelDOM = {
  createColumn: createColumn,
  buildTrack: buildTrack,
  setTransform: setTransform,
  setTransition: setTransition,
  setSymbolHeight: setSymbolHeight
};
})();
