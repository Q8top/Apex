/* 幸运水果 · 音频系统
   用 Web Audio 合成，无需外部音频文件
   - click / spin / tick / stop / win 分级
   - 首次用户交互时自动初始化
*/
(function(){
'use strict';

var ctx = null;
var enabled = true;
var masterGain = null;

function init() {
  if (ctx) return true;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
    return true;
  } catch (e) { return false; }
}

function now() { return ctx ? ctx.currentTime : 0; }

/* ---------- 基础音：单个正弦/三角波 + ADSR ---------- */
function tone(freq, dur, type, vol, when) {
  if (!enabled || !ctx) return;
  var t = (when || now());
  var osc = ctx.createOscillator();
  var g = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol == null ? 0.3 : vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/* ---------- 噪声：短促 click ---------- */
function noise(dur, vol, when) {
  if (!enabled || !ctx) return;
  var t = when || now();
  var len = Math.floor(ctx.sampleRate * dur);
  var buf = ctx.createBuffer(1, len, ctx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  var src = ctx.createBufferSource();
  src.buffer = buf;
  var g = ctx.createGain();
  g.gain.value = vol == null ? 0.15 : vol;
  src.connect(g);
  g.connect(masterGain);
  src.start(t);
}

/* ---------- 对外 API ---------- */
var API = {
  init: init,
  enabled: function(v) {
    if (v === undefined) return enabled;
    enabled = !!v;
    return enabled;
  },

  click: function() {
    if (!enabled) return;
    if (!ctx) init();
    tone(880, 0.05, 'triangle', 0.18);
  },

  spinStart: function() {
    if (!enabled) return;
    if (!ctx) init();
    var t = now();
    for (var i = 0; i < 3; i++) {
      tone(200 + i * 60, 0.12, 'sawtooth', 0.10, t + i * 0.06);
    }
  },

  reelStop: function(index) {
    if (!enabled) return;
    if (!ctx) init();
    noise(0.06, 0.20);
    tone(140 - index * 8, 0.14, 'triangle', 0.22);
  },

  winSmall: function() {
    if (!enabled) return;
    if (!ctx) init();
    var t = now();
    tone(660, 0.12, 'sine', 0.28, t);
    tone(880, 0.16, 'sine', 0.24, t + 0.09);
    tone(1100, 0.22, 'sine', 0.20, t + 0.19);
  },

  winMedium: function() {
    if (!enabled) return;
    if (!ctx) init();
    var t = now();
    [660, 880, 1100, 1320].forEach(function(f, i) {
      tone(f, 0.20, 'sine', 0.26, t + i * 0.09);
    });
  },

  winBig: function() {
    if (!enabled) return;
    if (!ctx) init();
    var t = now();
    [523, 659, 784, 1047, 1319, 1568].forEach(function(f, i) {
      tone(f, 0.28, 'sine', 0.24, t + i * 0.08);
      tone(f * 2, 0.20, 'triangle', 0.08, t + i * 0.08);
    });
  },

  lose: function() {
    if (!enabled) return;
    if (!ctx) init();
    tone(220, 0.10, 'sine', 0.10);
  }
};

window.SlotAudio = API;
})();
