/* 甜蜜蜜 · 音效 v1
   纯合成 · 高频友好 · 无 Convolver
   糖果风：明亮 + 弹跳 + 甜蜜
*/
(function(){
'use strict';
var ctx=null, master=null, comp=null, dryGain=null, delay=null, delayGain=null;
var enabled=true, VOL=0.7;

function init(){
  if (ctx) return true;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = VOL;
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 12;
    comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.25;
    master.connect(comp); comp.connect(ctx.destination);
    dryGain = ctx.createGain(); dryGain.gain.value = 0.85; dryGain.connect(master);
    delay = ctx.createDelay(1.0); delay.delayTime.value = 0.08;
    delayGain = ctx.createGain(); delayGain.gain.value = 0.28;
    delay.connect(delayGain); delayGain.connect(delay);
    delayGain.connect(master);
    return true;
  } catch(e){ return false; }
}
function now(){ return ctx ? ctx.currentTime : 0; }
function send(g, rev){ g.connect(dryGain); if (rev && delay) g.connect(delay); }

function ping(freq, dur, vol, when, type, rev){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || .25, t + .01);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); send(g, rev);
  o.start(t); o.stop(t + dur + .05);
}

function fm(carrier, mod, idx, dur, vol, when, rev){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var c = ctx.createOscillator(), m = ctx.createOscillator();
  var mg = ctx.createGain(), g = ctx.createGain();
  c.type = 'sine'; c.frequency.value = carrier;
  m.type = 'sine'; m.frequency.value = mod;
  mg.gain.value = carrier * idx;
  m.connect(mg); mg.connect(c.frequency);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || .22, t + .003);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  c.connect(g); send(g, rev);
  m.start(t); c.start(t);
  m.stop(t + dur + .03); c.stop(t + dur + .03);
}

function sweep(f1, f2, dur, vol, when, type){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || .15, t + .03);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); send(g, true);
  o.start(t); o.stop(t + dur + .05);
}

function pad(freq, dur, vol, when){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  [0.995, 1, 1.005].forEach(function(mult, i){
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq * mult;
    var flt = ctx.createBiquadFilter();
    flt.type = 'lowpass'; flt.frequency.value = 4000; flt.Q.value = 0.5;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime((vol || .08) * (1 - i * 0.15), t + dur * 0.2);
    g.gain.setValueAtTime((vol || .08) * (1 - i * 0.15), t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(flt); flt.connect(g); send(g, true);
    o.start(t); o.stop(t + dur + .05);
  });
}

function noise(dur, vol, when, centerF, Q){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var len = Math.floor(ctx.sampleRate * dur);
  var buf = ctx.createBuffer(1, len, ctx.sampleRate);
  var d = buf.getChannelData(0);
  var rnd = new Uint32Array(len); crypto.getRandomValues(rnd);
  for (var i = 0; i < len; i++) d[i] = (rnd[i]/2147483648 - 1) * (1 - i/len);
  var src = ctx.createBufferSource(); src.buffer = buf;
  var f = ctx.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = centerF || 2400; f.Q.value = Q || 2;
  var g = ctx.createGain(); g.gain.value = vol || .15;
  src.connect(f); f.connect(g); send(g, true);
  src.start(t);
}

/* 免费旋转背景音：循环激烈 chord */
var _fsBgTimer = null;
function fsBgStart(){
  if (_fsBgTimer) return;
  if (!ctx) init(); if (!ctx) return;
  function chord(){
    if (!enabled) return;
    withCtx(function(){
      var t = now();
      [330, 440, 554, 659].forEach(function(f, i){ pad(f, .55, .05, t + i*.02); });
      ping(1320, .15, .04, t, "sine", true);
    });
  }
  chord();
  _fsBgTimer = setInterval(chord, 700);
}
function fsBgStop(){
  if (_fsBgTimer) { clearInterval(_fsBgTimer); _fsBgTimer = null; }
}

var _recoveryPromise = null;

function ensureRunning(){
  if (!ctx) init();
  if (!ctx) return Promise.resolve(false);
  if (ctx.state === 'running') return Promise.resolve(true);
  if (ctx.state !== 'suspended' && ctx.state !== 'interrupted') {
    return Promise.resolve(false);
  }
  if (_recoveryPromise) return _recoveryPromise;
  try {
    var p = ctx.resume();
    if (p && typeof p.then === 'function') {
      _recoveryPromise = p.then(
        function(){ _recoveryPromise = null; return !!(ctx && ctx.state === 'running'); },
        function(){ _recoveryPromise = null; return false; }
      );
      return _recoveryPromise;
    }
  } catch(e){}
  _recoveryPromise = null;
  return Promise.resolve(!!(ctx && ctx.state === 'running'));
}

function withCtx(fn){
  if (!ctx) init();
  if (!ctx) return;
  if (ctx.state === 'running') { fn(); return; }
  ensureRunning().then(function(ok){
    if (ok && ctx && ctx.state === 'running') fn();
  });
}

function resume(){
  return ensureRunning();
}

var API = {
  init: init,
  resume: resume,
  enabled: function(v){
    if (v === undefined) return enabled;
    enabled = !!v;
    if (master && ctx) master.gain.setTargetAtTime(enabled ? VOL : 0, ctx.currentTime, .03);
    return enabled;
  },
  click: function(){ withCtx(function(){ var t = now(); fm(3200, 900, 3, .04, .12, t); ping(1800, .03, .08, t+.005); }); },
  spinStart: function(){
    withCtx(function(){
      var t = now();
      pad(330, .6, .06, t); pad(494, .5, .05, t+.05);
      sweep(800, 2800, .35, .14, t);
      fm(2400, 800, 2.5, .12, .16, t, true);
      fm(3200, 1200, 2, .08, .10, t+.05, true);
      ping(4000, .06, .08, t+.15);
    });
  },
  reelStop: function(i){
    withCtx(function(){
      var t = now();
      fm(2200 + i*260, 700 + i*60, 3, .12, .24, t, true);
      ping(2800 + i*200, .05, .14, t);
      ping(150 - i*8, .08, .10, t, 'triangle');
    });
  },
  tumble: function(){
    withCtx(function(){
      var t = now();
      noise(.22, .14, t, 2400, 2);
      ping(2600, .05, .10, t+.08);
      ping(3300, .04, .09, t+.13);
      ping(2000, .08, .08, t+.18);
    });
  },
  bomb: function(){
    withCtx(function(){
      var t = now();
      fm(600, 200, 4, .25, .22, t, true);
      ping(1200, .15, .12, t+.08, 'triangle');
      sweep(400, 120, .35, .16, t+.1);
    });
  },
  freeSpin: function(){
    withCtx(function(){
      var t = now();
      noise(.5, .15, t, 800, 1);
      [523, 659, 784, 1047, 1319].forEach(function(f, i){
        pad(f, .5, .09, t + i*.1);
        ping(f*2, .2, .10, t + i*.1, 'sine', true);
      });
      ping(2000, .3, .12, t+.5);
    });
  },
  winSmall: function(){
    withCtx(function(){
      var t = now();
      pad(880, .35, .08, t); pad(1100, .45, .07, t+.1);
      ping(2400, .15, .10, t+.05, 'sine', true);
      ping(3000, .18, .09, t+.15, 'sine', true);
    });
  },
  winMedium: function(){
    withCtx(function(){
      var t = now();
      [880, 1100, 1320, 1760].forEach(function(f, i){
        pad(f, .4, .075, t + i*.09);
        ping(f*2, .2, .10, t + i*.09, 'sine', true);
      });
    });
  },
  winBig: function(){
    withCtx(function(){
      var t = now();
      noise(.8, .18, t, 600, 1);
      [523, 659, 784, 1047, 1319, 1568, 2093, 2637].forEach(function(f, i){
        pad(f, .5, .08, t + i*.06);
        ping(f*2, .15, .09, t + i*.06, 'sine', true);
      });
      [523, 659, 784, 1047].forEach(function(f){ pad(f, 1.8, .09, t + .55); });
    });
  },
  lose: function(){
    withCtx(function(){
      var t = now();
      ping(440, .1, .06, null, 'sine', true);
      ping(330, .15, .05, t+.1, 'sine', true);
    });
  },
  fsBgStart: fsBgStart,
  fsBgStop: fsBgStop,
  fsSummary: function(){
    withCtx(function(){
      var t = now();
      noise(.8, .18, t, 600, 1);
      [523, 659, 784, 1047, 1319, 1568, 2093, 2637].forEach(function(f, i){
        pad(f, .55, .09, t + i*.07);
        ping(f*2, .18, .10, t + i*.07, "sine", true);
      });
      [523, 659, 784, 1047].forEach(function(f){ pad(f, 2, .09, t + .55); });
    });
  }
};

window.SweetAudio = API;
})();
