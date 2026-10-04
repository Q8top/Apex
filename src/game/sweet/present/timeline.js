/* Sweet · Timeline
   替代散落 setTimeout。
   一个流程一个 Timeline。
   State 变化时调 cancel()，所有 pending step 自动失效。
*/
(function(){
'use strict';

function create(opts){
  opts = opts || {};
  var steps = [];
  var cancelled = false;
  var rafId = 0;
  var timeouts = [];
  var onCancel = opts.onCancel || function(){};

  function step(delay, fn){
    steps.push({ delay: delay, fn: fn });
    return this;
  }
  function cancel(){
    cancelled = true;
    for (var i = 0; i < timeouts.length; i++) clearTimeout(timeouts[i]);
    timeouts = [];
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    onCancel();
  }
  function isCancelled(){ return cancelled; }
  function run(){
    if (cancelled) return;
    if (!steps.length) return;
    steps.sort(function(a,b){ return a.delay - b.delay; });
    for (var i = 0; i < steps.length; i++) {
      (function(s){
        var id = setTimeout(function(){
          if (cancelled) return;
          try { s.fn(); } catch(e){ console.error('[SweetTimeline] step err', e); }
        }, s.delay);
        timeouts.push(id);
      })(steps[i]);
    }
  }
  return { step: step, cancel: cancel, isCancelled: isCancelled, run: run };
}

window.SweetTimeline = { create: create };
})();
