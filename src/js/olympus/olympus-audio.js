/* 奥林匹斯之门 · 音效 v1
   深紫神秘 + 金币坠落 + 弦乐泛音
*/
(function(){
'use strict';
var ctx = null, master = null, reverb = null;
var enabled = true, VOL = 0.5;

function init(){
  if (ctx) return true;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = VOL;
    master.connect(ctx.destination);
    var len = Math.floor(ctx.sampleRate * 1.4);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      var rnd = new Uint32Array(len); crypto.getRandomValues(rnd);
      for (var i = 0; i < len; i++) d[i] = (rnd[i] / 2147483648 - 1) * Math.pow(1 - i / len, 2.8) * 0.55;
    }
    reverb = ctx.createConvolver(); reverb.buffer = buf;
    var rg = ctx.createGain(); rg.gain.value = 0.24;
    reverb.connect(rg); rg.connect(ctx.destination);
    return true;
  } catch(e) { return false; }
}
function now(){ return ctx ? ctx.currentTime : 0; }

function ping(freq, dur, vol, when, type, rev, slideTo){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || .3, t + .008);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(master);
  if (rev && reverb) g.connect(reverb);
  o.start(t); o.stop(t + dur + .03);
}
function fm(carrier, mod, idx, dur, vol, when){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
  c.type = 'sine'; c.frequency.value = carrier;
  m.type = 'sine'; m.frequency.value = mod; mg.gain.value = carrier * idx;
  m.connect(mg); mg.connect(c.frequency);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || .24, t + .004);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  c.connect(g); g.connect(master);
  if (reverb) g.connect(reverb);
  m.start(t); c.start(t); m.stop(t + dur + .03); c.stop(t + dur + .03);
}

var API = {
  init: init,
  enabled: function(v){ if (v === undefined) return enabled; enabled = !!v; if (master) master.gain.setTargetAtTime(enabled ? VOL : 0, ctx.currentTime, .02); return enabled; },

  click: function(){ if (!ctx) init(); var t = now(); ping(1800, .035, .1, t); ping(900, .05, .06, t + .005); },

  spinStart: function(){
    if (!ctx) init();
    var t = now();
    // 神秘低频扫频
    ping(110, .5, .14, t, 'triangle', true, 55);
    ping(220, .35, .09, t + .02, 'sine', true, 130);
    fm(880, 180, 3, .22, .07, t + .04);
  },

  reelStop: function(index){
    if (!ctx) init();
    var t = now();
    fm(700 + index * 80, 180, 2.8, .14, .24, t);
    ping(140 - index * 6, .08, .16, t, 'triangle');
  },

  /* tumble 时轻快一响 */
  tumble: function(){
    if (!ctx) init();
    var t = now();
    ping(1400, .05, .14, t);
    ping(2100, .04, .09, t + .03);
  },

  winSmall: function(){ if (!ctx) init(); var t = now(); ping(880, .12, .28, t, 'sine', true); ping(1175, .18, .22, t + .09, 'sine', true); },
  winMedium: function(){
    if (!ctx) init(); var t = now();
    [784, 988, 1175, 1568].forEach(function(f, i){ ping(f, .24, .22, t + i*.08, 'sine', true); });
  },
  winBig: function(){
    if (!ctx) init(); var t = now();
    var notes = [523, 659, 784, 1047, 1319, 1568, 2093];
    notes.forEach(function(f, i){ ping(f, .34, .22, t + i*.07, 'sine', true); ping(f*.5, .3, .09, t + i*.07, 'triangle', true); });
    [523, 659, 784].forEach(function(f){ ping(f, 1.0, .18, t + .5, 'sine', true); });
    var rnd = new Uint32Array(10); crypto.getRandomValues(rnd);
    for (var i = 0; i < 10; i++) ping(3400 + (rnd[i] % 2400), .05, .06, t + .35 + i * .07);
  },
  lose: function(){ if (!ctx) init(); ping(180, .12, .05, null, 'sine'); }
};

window.OlympusAudio = API;
})();
