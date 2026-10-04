/* Sweet · Win Presentation
   中奖流程：
   1. 高亮 winning 格（500ms）
   2. 立即清空 cell 内容（消消乐式"变空"，无动画）
   3. 空停留 300ms
   4. 下一轮 paintGrid 补位
   pop 无 CSS class，纯 DOM 操作，彻底避免层叠冲突。
*/
(function(){
'use strict';

var State = window.SweetState;
var Events = window.SweetEvents;
var Timeline = window.SweetTimeline;

var HIGHLIGHT_MS = 500;
var EMPTY_MS = 300;
var ROUND_TOTAL = HIGHLIGHT_MS + EMPTY_MS;

function addWinning(cells, cellAt){
  for (var i = 0; i < cells.length; i++) {
    var el = cellAt(cells[i][0], cells[i][1]);
    if (el) el.classList.add('winning');
  }
}

function removeWinning(cells, cellAt){
  for (var i = 0; i < cells.length; i++) {
    var el = cellAt(cells[i][0], cells[i][1]);
    if (el) el.classList.remove('winning');
  }
}

function clearCells(cells, cellAt){
  for (var i = 0; i < cells.length; i++) {
    var el = cellAt(cells[i][0], cells[i][1]);
    if (el) el.innerHTML = '';
  }
}

function playRound(roundData, gen, cellAt, onDone){
  if (!State.isCurrent(gen)) { if (onDone) onDone(); return; }
  if (!roundData || !roundData.wins || !roundData.wins.length) { if (onDone) onDone(); return; }

  var allCells = [];
  roundData.wins.forEach(function(w){
    w.cells.forEach(function(p){ allCells.push(p); });
  });

  Events.emit('win:roundStart', { gen: gen, roundWin: roundData.roundWin, cells: allCells });

  var tl = Timeline.create({ onCancel: function(){} });
  tl.step(0, function(){
    if (!State.isCurrent(gen)) return;
    addWinning(allCells, cellAt);
  });
  tl.step(HIGHLIGHT_MS, function(){
    if (!State.isCurrent(gen)) return;
    clearCells(allCells, cellAt);
  });
  tl.step(ROUND_TOTAL, function(){
    if (!State.isCurrent(gen)) return;
    removeWinning(allCells, cellAt);
    Events.emit('win:roundEnd', { gen: gen, roundWin: roundData.roundWin });
    if (onDone) onDone();
  });
  tl.run();
  return tl;
}

window.SweetWinPresentation = {
  playRound: playRound,
  HIGHLIGHT_MS: HIGHLIGHT_MS,
  EMPTY_MS: EMPTY_MS,
  ROUND_TOTAL: ROUND_TOTAL
};
})();
