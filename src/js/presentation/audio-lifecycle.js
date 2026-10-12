(function(){
'use strict';
/* Apex \u00b7 Audio Lifecycle (P3e)
 *
 * \u89e3\u51b3: iOS Safari / Android Chrome \u9501\u5c4f\u540e AudioContext
 * \u8f6c\u4e3a 'interrupted' \u800c\u975e 'suspended' \u5bfc\u81f4\u65e0\u58f0.
 *
 * \u8bbe\u8ba1:
 *   - \u56db\u8def\u4e8b\u4ef6\u515c\u5e95: visibilitychange / pageshow / focus /
 *                webkitvisibilitychange
 *   - ctx.onstatechange \u76d1\u542c\u72b6\u6001\u673a
 *   - \u624b\u52bf\u6301\u7eed\u91cd\u8bd5 (\u4e0d\u7528 once)
 *   - ctx closed \u65f6\u89e6\u53d1 onRebuild \u56de\u8c03
 *   - \u7528\u6237\u9759\u97f3\u72b6\u6001\u4e0d\u88ab\u5f3a\u5236\u6062\u590d
 */

var reg = Object.create(null);
var listening = false;
var gestureBound = false;
var _g = typeof window !== 'undefined' ? window : null;

function _each(fn){
  for (var k in reg){
    if (Object.prototype.hasOwnProperty.call(reg, k)){
      try { fn(k, reg[k]); } catch (e) {}
    }
  }
}

function _ctxOf(entry){
  try {
    var c = typeof entry.getCtx === 'function' ? entry.getCtx() : entry.ctx;
    return c || null;
  } catch (e) { return null; }
}

function _tryResume(ctx){
  if (!ctx) return 'no_ctx';
  var st = String(ctx.state || '');
  if (st === 'running') return 'running';
  if (st === 'closed') return 'closed';
  try {
    var p = ctx.resume();
    if (p && typeof p.then === 'function'){
      p.then(function(){}, function(){});
    }
  } catch (e) {}
  return 'resumed_attempt';
}

function _shouldResume(){
  if (!_g) return false;
  if (typeof document !== 'undefined' && document.hidden) return false;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false;
  return true;
}

function resumeAll(){
  if (!_shouldResume()) return;
  _each(function(name, entry){
    var ctx = _ctxOf(entry);
    var r = _tryResume(ctx);
    if (r === 'closed' && typeof entry.onRebuild === 'function'){
      try { entry.onRebuild(); } catch (e) {}
    }
  });
}

function suspendAll(){
  _each(function(name, entry){
    var ctx = _ctxOf(entry);
    if (!ctx) return;
    if (ctx.state === 'running' && typeof ctx.suspend === 'function'){
      try { ctx.suspend(); } catch (e) {}
    }
  });
}

function _bindGesture(){
  if (gestureBound || !_g) return;
  gestureBound = true;
  var evs = ['pointerdown', 'touchstart', 'keydown', 'click'];
  function once(){
    resumeAll();
    // \u518d\u6b21\u68c0\u67e5\u662f\u5426\u5168 running\uff0c\u5168\u597d\u5219\u89e3\u7ed1
    var allOk = true;
    _each(function(name, entry){
      var ctx = _ctxOf(entry);
      if (!ctx || ctx.state !== 'running') allOk = false;
    });
    if (allOk){
      for (var i = 0; i < evs.length; i++){
        try { _g.removeEventListener(evs[i], once, true); } catch (e) {}
      }
      gestureBound = false;
    }
  }
  for (var i = 0; i < evs.length; i++){
    try { _g.addEventListener(evs[i], once, { capture: true, passive: true }); } catch (e) {}
  }
}

function _bindVisibility(){
  if (listening || !_g) return;
  listening = true;
  if (typeof document !== 'undefined' && document.addEventListener){
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) suspendAll(); else { resumeAll(); _bindGesture(); }
    });
    document.addEventListener('webkitvisibilitychange', function(){
      if (document.hidden) suspendAll(); else { resumeAll(); _bindGesture(); }
    });
  }
  _g.addEventListener('pagehide', function(){ suspendAll(); });
  _g.addEventListener('pageshow', function(){ resumeAll(); _bindGesture(); });
  _g.addEventListener('focus', function(){ resumeAll(); _bindGesture(); });
  _g.addEventListener('blur', function(){ /* \u4e0d suspend\uff0c\u9632\u8bef\u89e6 */ });
}

function register(name, entry){
  if (!name || !entry) return false;
  reg[name] = entry;
  _bindVisibility();
  var ctx = _ctxOf(entry);
  if (ctx && typeof ctx.addEventListener === 'function'){
    try {
      ctx.addEventListener('statechange', function(){
        if (ctx.state === 'running') return;
        if (_shouldResume()) setTimeout(resumeAll, 60);
      });
    } catch (e) {}
  }
  return true;
}

function unregister(name){ delete reg[name]; }

function getState(){
  var out = {};
  _each(function(name, entry){
    var ctx = _ctxOf(entry);
    out[name] = ctx ? String(ctx.state || 'unknown') : 'no_ctx';
  });
  return out;
}

if (_g){
  _g.ApexAudioLifecycle = Object.freeze({
    register: register,
    unregister: unregister,
    resumeAll: resumeAll,
    suspendAll: suspendAll,
    getState: getState
  });
}
})();
