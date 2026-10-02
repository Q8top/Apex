/* 奥林匹斯之门 · 音效（纯合成，无 TTS） */
(function(){
'use strict';
var ctx = null, master = null, comp = null, reverb = null, revGain = null, dryGain = null;
var enabled = true, VOL = 0.75;

function init(){
  // iOS 16.4+：绕过静音开关
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch(e){}
  if (ctx) {
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch(e){} }
    return true;
  }
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch(e){}
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch(e){} }

    master = ctx.createGain(); master.gain.value = VOL;
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 12;
    comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.25;
    master.connect(comp); comp.connect(ctx.destination);

    var revLen = Math.floor(ctx.sampleRate * 3.2);
    var buf = ctx.createBuffer(2, revLen, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      var rnd = new Uint32Array(revLen); crypto.getRandomValues(rnd);
      for (var i = 0; i < revLen; i++) {
        var t = i / revLen;
        var decay = t < 0.15 ? Math.pow(1 - t/0.15, 1.5) * 0.8 : Math.pow(1 - (t-0.15)/0.85, 3) * 0.7;
        d[i] = (rnd[i]/2147483648 - 1) * decay * 0.5;
      }
    }
    reverb = ctx.createConvolver(); reverb.buffer = buf;
    revGain = ctx.createGain(); revGain.gain.value = 0.28;
    dryGain = ctx.createGain(); dryGain.gain.value = 0.75;
    reverb.connect(revGain); revGain.connect(master);
    dryGain.connect(master);
    return true;
  } catch(e){ return false; }
}
function now(){ return ctx ? ctx.currentTime : 0; }

function tone(freq, dur, vol, when, type, rev, slideTo){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || .25, t + .01);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(dryGain);
  if (rev && reverb) g.connect(reverb);
  o.start(t); o.stop(t + dur + .05);
}

/* 弦乐 pad：多层 detune saw + 低通 */
function pad(freq, dur, vol, when){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  [0.996, 1, 1.004].forEach(function(mult, i){
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = freq * mult;
    var lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    lfo.frequency.value = 5 + i * 0.3;
    lfoGain.gain.value = freq * 0.004;
    lfo.connect(lfoGain); lfoGain.connect(o.frequency);
    lfo.start(t); lfo.stop(t + dur + .05);
    var flt = ctx.createBiquadFilter();
    flt.type = 'lowpass'; flt.frequency.value = 2200; flt.Q.value = 0.7;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime((vol || .07) * (1 - i * 0.15), t + dur * 0.15);
    g.gain.setValueAtTime((vol || .07) * (1 - i * 0.15), t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(flt); flt.connect(g);
    g.connect(dryGain); g.connect(reverb);
    o.start(t); o.stop(t + dur + .05);
  });
}

/* FM 金属 */
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
  m.start(t); c.start(t); m.stop(t + dur + .03); c.stop(t + dur + .03);
}

function noise(dur, vol, when, filterType, cutoff, rev){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var len = Math.floor(ctx.sampleRate * dur);
  var buf = ctx.createBuffer(1, len, ctx.sampleRate);
  var d = buf.getChannelData(0);
  var rnd = new Uint32Array(len); crypto.getRandomValues(rnd);
  for (var i = 0; i < len; i++) d[i] = (rnd[i]/2147483648 - 1) * (1 - i/len);
  var src = ctx.createBufferSource(); src.buffer = buf;
  var node = src;
  if (filterType) {
    var f = ctx.createBiquadFilter();
    f.type = filterType; f.frequency.value = cutoff || 1000; f.Q.value = 1;
    src.connect(f); node = f;
  }
  var g = ctx.createGain(); g.gain.value = vol || .15;
  node.connect(g); g.connect(dryGain);
  if (rev && reverb) g.connect(reverb);
  src.start(t);
}

var API = {
  init: init,
  enabled: function(v){
    if (v === undefined) return enabled;
    enabled = !!v;
    if (master && ctx) master.gain.setTargetAtTime(enabled ? VOL : 0, ctx.currentTime, .03);
    return enabled;
  },
  click: function(){ if (!ctx) init(); var t = now(); fm(1600, 2800, 3, .04, .08, t); tone(800, .05, .04, t+.005, 'triangle'); },
  spinStart: function(){
    if (!ctx) init(); var t = now();
    noise(.5, .16, t, 'lowpass', 380, true);
    pad(220, .9, .08, t);
    pad(261.63, .8, .06, t+.06);
    pad(329.63, .7, .05, t+.12);
    tone(880, .3, .05, t+.2, 'sine', true, 1760);
  },
  reelStop: function(i){
    if (!ctx) init(); var t = now();
    fm(500 + i*90, 180 + i*20, 2.8, .13, .22, t, true);
    tone(140 - i*6, .08, .12, t, 'triangle');
  },
  tumble: function(){
    if (!ctx) init(); var t = now();
    noise(.22, .14, t, 'bandpass', 1400, true);
    tone(2100, .06, .10, t+.08, 'sine', true);
  },
  winSmall: function(){ if (!ctx) init(); var t = now(); pad(523, .35, .07, t); pad(659, .4, .06, t+.1); },
  winMedium: function(){
    if (!ctx) init(); var t = now();
    [523, 659, 784, 1047].forEach(function(f, i){
      pad(f, .45, .075, t + i*.1);
      tone(f*2, .28, .055, t + i*.1, 'sine', true);
    });
  },
  winBig: function(){
    if (!ctx) init(); var t = now();
    noise(.9, .22, t, 'lowpass', 320, true);
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach(function(f, i){
      pad(f, .6, .08, t + i*.07);
      pad(f*0.5, .6, .06, t + i*.07);
    });
    [523, 659, 784, 1047].forEach(function(f){ pad(f, 1.8, .09, t + .6); });
  },
  lose: function(){ if (!ctx) init(); tone(180, .18, .05, null, 'sine', 140, true); }
};

window.OlympusAudio = API;
})();
