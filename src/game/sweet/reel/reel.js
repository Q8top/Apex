/* Sweet · Single Reel
   单列滚动 + 停止 + 回弹。
   状态检查：SweetState.isCurrent(gen)
   广播：'reel:colstop' → controller 聚合
   视觉算法与 4v2 一致（ease / overshoot 4 / bounce 1.5）
*/
(function(){
'use strict';

var DOM = window.SweetReelDOM;
var State = window.SweetState;
var Events = window.SweetEvents;

function ease(p){
  if (p < 0.15) return 2.5 * p * p;
  if (p < 0.70) { var q = (p - 0.15) / 0.55; return 0.056 + 0.80 * q; }
  var q = (p - 0.70) / 0.30;
  return 0.856 + 0.144 * (1 - Math.pow(1 - q, 3));
}

function play(opts){
  var track = opts.track;
  var yStart = opts.yStart;
  var yFinal = opts.yFinal;
  var dur = opts.dur;
  var gen = opts.gen;
  var col = opts.col;
  var start = performance.now();
  var rafId = 0;
  var stopped = false;

  DOM.setTransform(track, yStart);

  function settle(){
    if (stopped) return;
    stopped = true;
    Events.emit('reel:colstop', { col: col, gen: gen });
    DOM.setTransition(track, 'transform 120ms cubic-bezier(.2,1,.35,1)');
    DOM.setTransform(track, yFinal - 4);
    var t1 = setTimeout(function(){
      if (!State.isCurrent(gen)) return;
      DOM.setTransition(track, 'transform 80ms ease-out');
      DOM.setTransform(track, yFinal + 1.5);
      var t2 = setTimeout(function(){
        if (!State.isCurrent(gen)) return;
        DOM.setTransition(track, 'transform 60ms ease-out');
        DOM.setTransform(track, yFinal);
        var t3 = setTimeout(function(){
          DOM.setTransition(track, '');
          if (opts.onDone) opts.onDone();
        }, 60);
      }, 80);
    }, 120);
  }

  function loop(now){
    if (!State.isCurrent(gen)) return;
    var el = now - start;
    if (el >= dur) { settle(); return; }
    var p = el / dur;
    var y = yStart + (yFinal - yStart) * ease(p);
    DOM.setTransform(track, y);
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  return {
    cancel: function(){ if (rafId) cancelAnimationFrame(rafId); }
  };
}

window.SweetReel = { ease: ease, play: play };
})();
