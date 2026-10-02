/* 奥林匹斯之门 · 音效 v3
   纯合成 · 频率重心 1-3.5kHz（手机扬声器友好）
   保留史诗 pad 氛围 + 高频瞬态
*/
(function(){
'use strict';
var ctx=null, master=null, comp=null, reverb=null, revGain=null, dryGain=null;
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

    var revLen = Math.floor(ctx.sampleRate * 0.9);
    var buf = ctx.createBuffer(2, revLen, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      var rnd = new Uint32Array(revLen); crypto.getRandomValues(rnd);
      for (var i = 0; i < revLen; i++) {
        var t = i / revLen;
        d[i] = (rnd[i]/2147483648 - 1) * Math.pow(1 - t, 3) * 0.45;
      }
    }
    reverb = ctx.createConvolver(); reverb.buffer = buf;
    revGain = ctx.createGain(); revGain.gain.value = 0.25;
    dryGain = ctx.createGain(); dryGain.gain.value = 0.8;
    reverb.connect(revGain); revGain.connect(master);
    dryGain.connect(master);
    return true;
  } catch(e){ var msg = 'Audio 初始化失败: ' + (e && e.message ? e.message : String(e)); console.error('[OlympusAudio.init]', msg); try { if (typeof alert === 'function') alert(msg); } catch(x){} return false; }
}
function now(){ return ctx ? ctx.currentTime : 0; }

function ping(freq, dur, vol, when, type, rev){
  if (!enabled) return;
  if (!ctx && !init()) { console.error('[OlympusAudio.ping] ctx 初始化失败'); return; }
  var t = when != null ? when : now();
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || .25, t + .01);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(dryGain);
  if (rev && reverb) g.connect(reverb);
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
  c.connect(g); g.connect(dryGain);
  if (rev && reverb) g.connect(reverb);
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
  o.connect(g); g.connect(dryGain);
  if (reverb) g.connect(reverb);
  o.start(t); o.stop(t + dur + .05);
}

/* 弦乐 pad：多层 detune saw + 3500Hz 低通 */
function pad(freq, dur, vol, when){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  [0.995, 1, 1.005].forEach(function(mult, i){
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = freq * mult;
    var lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    lfo.frequency.value = 5 + i * 0.3;
    lfoGain.gain.value = freq * 0.005;
    lfo.connect(lfoGain); lfoGain.connect(o.frequency);
    lfo.start(t); lfo.stop(t + dur + .05);
    var flt = ctx.createBiquadFilter();
    flt.type = 'lowpass'; flt.frequency.value = 3500; flt.Q.value = 0.5;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime((vol || .09) * (1 - i * 0.12), t + dur * 0.15);
    g.gain.setValueAtTime((vol || .09) * (1 - i * 0.12), t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(flt); flt.connect(g);
    g.connect(dryGain); g.connect(reverb);
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
  f.type = 'bandpass'; f.frequency.value = centerF || 2000; f.Q.value = Q || 2;
  var g = ctx.createGain(); g.gain.value = vol || .15;
  src.connect(f); f.connect(g); g.connect(dryGain);
  if (reverb) g.connect(reverb);
  src.start(t);
}

function coins(count, when){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var rnd = new Uint32Array(count * 3);
  crypto.getRandomValues(rnd);
  for (var i = 0; i < count; i++) {
    var delay = (rnd[i] % 900) / 1000;
    var f = 2400 + (rnd[count + i] % 1400);
    fm(f, f * 1.6, 2.5, 0.09, 0.10, t + delay, true);
    ping(f * 1.4, 0.04, 0.06, t + delay + 0.01);
  }
}

var API = {
  init: init,
  enabled: function(v){
    if (v === undefined) return enabled;
    enabled = !!v;
    if (master && ctx) master.gain.setTargetAtTime(enabled ? VOL : 0, ctx.currentTime, .03);
    return enabled;
  },
  click: function(){ if (!ctx) init(); var t = now(); fm(2800, 900, 3, .04, .12, t); ping(1600, .03, .08, t+.005); },
  spinStart: function(){
    if (!ctx) { if (!init()) { console.error('[OlympusAudio.spinStart] ctx 建不起来'); return; } } var t = now();
    pad(220, .8, .07, t); pad(330, .7, .06, t+.06);
    sweep(600, 2400, .4, .14, t);
    fm(2400, 800, 2.5, .12, .16, t, true);
    fm(3200, 1200, 2, .08, .10, t+.05, true);
  },
  reelStop: function(i){
    if (!ctx) init(); var t = now();
    fm(2000 + i*280, 700 + i*60, 3, .12, .24, t, true);
    ping(2800 + i*200, .04, .14, t);
    ping(150 - i*8, .08, .10, t, 'triangle');
  },
  tumble: function(){
    if (!ctx) init(); var t = now();
    noise(.25, .14, t, 2000, 2);
    ping(2400, .06, .12, t+.08);
    ping(3000, .05, .10, t+.13);
    ping(1800, .08, .08, t+.18);
  },
  winSmall: function(){
    if (!ctx) init(); var t = now();
    pad(660, .4, .08, t); pad(880, .5, .07, t+.1);
    ping(1760, .15, .10, t+.05, 'sine', true);
    ping(2200, .20, .09, t+.15, 'sine', true);
  },
  winMedium: function(){
    if (!ctx) init(); var t = now();
    [660, 880, 1100, 1320].forEach(function(f, i){
      pad(f, .4, .075, t + i*.09);
      ping(f*2, .2, .10, t + i*.09, 'sine', true);
      fm(f*3, 700, 2, .06, .06, t + i*.09);
    });
    coins(6, t + .2);
  },
  winBig: function(){
    if (!ctx) init(); var t = now();
    noise(.8, .18, t, 400, 1);
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach(function(f, i){
      pad(f, .5, .08, t + i*.07);
      pad(f*.5, .5, .06, t + i*.07);
      ping(f*2, .15, .09, t + i*.07, 'sine', true);
    });
    [523, 659, 784, 1047].forEach(function(f){ pad(f, 1.8, .09, t + .6); });
    coins(16, t + .5);
  },
  lose: function(){ if (!ctx) init(); var t = now(); ping(440, .1, .06, null, 'sine', true); ping(220, .18, .05, t+.1, 'sine', true); },
  _ctxState: function(){ return ctx ? (ctx.state || '?') : 'null'; }
};

window.OlympusAudio = API;
})();
