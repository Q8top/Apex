(function(){
'use strict';
/* Apex Sugar Rush - Anticipation system (Pragmatic-parity)
 * When first spin has exactly (threshold - 1) scatters,
 * pulse existing scatter cells and delay reveal ~1.2s.
 * Uses synth preset 'anticipation' for heartbeat.
 */
var _pending = 0;

function shouldAnticipate(scatterCount, threshold){
  if (!Number.isInteger(scatterCount)) return false;
  if (!Number.isInteger(threshold)) return false;
  return scatterCount === (threshold - 1);
}

function applyClasses(board, positions, on){
  if (!board || !board.children) return;
  var cells = board.children;
  for (var i = 0; i < positions.length; i++){
    var c = cells[positions[i]];
    if (!c) continue;
    if (on) c.classList.add('is-anticipation');
    else c.classList.remove('is-anticipation');
  }
}

function play(opts){
  opts = opts || {};
  var board = opts.board;
  var positions = opts.positions || [];
  var duration = opts.durationMs || 1200;
  var audioFn = opts.audioFn;
  applyClasses(board, positions, true);
  if (typeof audioFn === 'function'){
    try { audioFn('anticipation'); } catch (e) {}
  }
  cancel();
  return new Promise(function(resolve){
    _pending = setTimeout(function(){
      _pending = 0;
      applyClasses(board, positions, false);
      if (opts.onDone) try { opts.onDone(); } catch (e) {}
      resolve();
    }, duration);
  });
}

function cancel(){
  if (_pending){ clearTimeout(_pending); _pending = 0; }
}

window.ApexAnticipation = Object.freeze({
  shouldAnticipate: shouldAnticipate,
  play: play,
  cancel: cancel
});
})();
