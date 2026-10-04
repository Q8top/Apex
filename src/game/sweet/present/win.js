/* Sweet · Win Presentation
   职责：中奖高亮 + pop 消失 + 金额显示 + 逐轮编排。
   唯一出口：playRound(roundData, gen, cellAt, onDone)。
   pop 通过 inline SVG style 驱动 —— CSS 无法覆盖，从根本上杜绝层叠冲突。
   时序用 SweetTimeline 编排，不用散落 setTimeout。
*/
(function(){
'use strict';

var State = window.SweetState;
var Events = window.SweetEvents;
var Timeline = window.SweetTimeline;

var HIGHLIGHT_MS = 500;
var POP_MS = 280;
var ROUND_TOTAL = HIGHLIGHT_MS + POP_MS;   // 780ms

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

function popCells(cells, cellAt){
  for (var i = 0; i < cells.length; i++) {
    var el = cellAt(cells[i][0], cells[i][1]);
    if (!el) continue;
    var svg = el.querySelector('svg');
    if (!svg) continue;
    svg.style.transition =
      'transform ' + POP_MS + 'ms cubic-bezier(.2,.9,.3,1), ' +
      'opacity ' + POP_MS + 'ms cubic-bezier(.2,.9,.3,1)';
    svg.style.transformOrigin = '50% 50%';
    svg.style.transform = 'scale(0) rotate(180deg)';
    svg.style.opacity = '0';
  }
}

function resetCells(cells, cellAt){
  for (var i = 0; i < cells.length; i++) {
    var el = cellAt(cells[i][0], cells[i][1]);
    if (!el) continue;
    var svg = el.querySelector('svg');
    if (!svg) continue;
    svg.style.transition = '';
    svg.style.transform = '';
    svg.style.opacity = '';
    svg.style.transformOrigin = '';
  }
}

/* 播放一轮中奖
   roundData: { wins: [{cells: [[r,c],...]}], roundWin, cumMult }
   gen: 当前 spin generation
   cellAt: function(r, c) → cell element
   onDone: function()
*/
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
    popCells(allCells, cellAt);
  });
  tl.step(ROUND_TOTAL, function(){
    if (!State.isCurrent(gen)) return;
    removeWinning(allCells, cellAt);
    resetCells(allCells, cellAt);
    Events.emit('win:roundEnd', { gen: gen, roundWin: roundData.roundWin });
    if (onDone) onDone();
  });
  tl.run();
  return tl;
}

window.SweetWinPresentation = {
  playRound: playRound,
  HIGHLIGHT_MS: HIGHLIGHT_MS,
  POP_MS: POP_MS,
  ROUND_TOTAL: ROUND_TOTAL
};
})();
