/* 幸运水果 · 音效系统 v2
   - 混响（convolution，程序生成 impulse）
   - 和弦（多音符同时/连奏）
   - 分级中奖音阶
   - 开关 + 静音
*/
(function(){
'use strict';

var ctx = null, master = null, reverb = null;
var enabled = true;
var VOLUME = 0.45;

function init() {
  if (ctx) return true;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);

    // 程序生成混响 impulse（避免外部文件）
    var len = Math.floor(ctx.sampleRate * 1.2);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      var rnd = new Uint32Array(len);
      crypto.getRandomValues(rnd);
      for (var i = 0; i < len; i++) {
        var decay = Math.pow(1 - i / len, 2.6);
        d[i] = (rnd[i] / 2147483648 - 1) * decay * 0.6;
      }
    }
    reverb = ctx.createConvolver();
    reverb.buffer = buf;
    var revGain = ctx.createGain();
    revGain.gain.value = 0.22;
    reverb.connect(revGain);
    revGain.connect(ctx.destination);
    return true;
  } catch (e) { return false; }
}

function now() { return ctx ? ctx.currentTime : 0; }

/* 单音 */
function tone(freq, dur, type, vol, when, toReverb) {
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var osc = ctx.createOscillator();
  var g = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol == null ? 0.3 : vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(master);
  if (toReverb && reverb) g.connect(reverb);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/* 噪声 click */
function noise(dur, vol, when, bandpass) {
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var len = Math.floor(ctx.sampleRate * dur);
  var buf = ctx.createBuffer(1, len, ctx.sampleRate);
  var d = buf.getChannelData(0);
  var rnd = new Uint32Array(len);
  crypto.getRandomValues(rnd);
  for (var i = 0; i < len; i++) d[i] = (rnd[i] / 2147483648 - 1) * (1 - i / len);
  var src = ctx.createBufferSource();
  src.buffer = buf;
  var g = ctx.createGain();
  g.gain.value = vol == null ? 0.15 : vol;
  var node = src;
  if (bandpass && ctx.createBiquadFilter) {
    var f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = bandpass;
    f.Q.value = 1.5;
    src.connect(f);
    node = f;
  }
  node.connect(g);
  g.connect(master);
  src.start(t);
}

var API = {
  init: init,
  enabled: function(v) {
    if (v === undefined) return enabled;
    enabled = !!v;
    if (ctx && master) {
      master.gain.setTargetAtTime(enabled ? VOLUME : 0, ctx.currentTime, 0.02);
    }
    return enabled;
  },
  volume: function(v) {
    if (v === undefined) return VOLUME;
    VOLUME = Math.max(0, Math.min(1, v));
    if (master) master.gain.value = enabled ? VOLUME : 0;
  },

  /* ---------- UI ---------- */
  click: function() {
    if (!ctx) init();
    tone(1200, 0.05, 'triangle', 0.10);
    noise(0.03, 0.06, null, 3000);
  },

  /* ---------- 转轮 ---------- */
  spinStart: function() {
    if (!ctx) init();
    var t = now();
    // 低频 whoosh + 上行音符
    tone(180, 0.28, 'sawtooth', 0.12, t);
    tone(270, 0.22, 'sawtooth', 0.09, t + 0.06);
    tone(360, 0.18, 'sawtooth', 0.06, t + 0.12);
  },

  reelStop: function(index) {
    if (!ctx) init();
    var t = now();
    // 机械咔 + 音高随列递增
    noise(0.05, 0.24, t, 2200);
    tone(120 - index * 6, 0.18, 'square', 0.22, t + 0.01);
  },

  /* ---------- 中奖分级 ---------- */
  winSmall: function() {
    if (!ctx) init();
    var t = now();
    tone(660, 0.14, 'sine', 0.28, t, true);
    tone(880, 0.20, 'sine', 0.22, t + 0.10, true);
  },

  winMedium: function() {
    if (!ctx) init();
    var t = now();
    // C 大三和弦 + 琶音
    [523.25, 659.25, 783.99, 1046.5].forEach(function(f, i) {
      tone(f, 0.26, 'sine', 0.24, t + i * 0.08, true);
      tone(f * 2, 0.16, 'triangle', 0.06, t + i * 0.08, true);
    });
  },

  winBig: function() {
    if (!ctx) init();
    var t = now();
    // 上行大调音阶 + 和弦
    var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568, 2093];
    notes.forEach(function(f, i) {
      tone(f, 0.32, 'sine', 0.22, t + i * 0.07, true);
      tone(f * 0.5, 0.32, 'triangle', 0.07, t + i * 0.07, true);
    });
    // 尾部和弦
    [523.25, 659.25, 783.99].forEach(function(f){
      tone(f, 0.9, 'sine', 0.18, t + 0.55, true);
    });
  },

  lose: function() {
    if (!ctx) init();
    tone(196, 0.09, 'sine', 0.08);
  }
};

window.SlotAudio = API;
})();
