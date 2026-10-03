/* 幸运水果 · 音效 v4（经典老虎机风）
   - 转动：机械齿轮周期咔哒
   - 停列：清脆铁片敲击（短瞬态）
   - 中奖：金币洒落 + 上行和弦
   - 点击：机械按钮
*/
(function(){
'use strict';

var ctx = null, master = null, reverb = null;
var enabled = true;
var VOLUME = 0.55;

function init(){
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch(e){}
  if (ctx) {
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch(e){} }
    return true;
  }
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch(e){} }
    master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);

    // 小房间混响（短）
    var len = Math.floor(ctx.sampleRate * 0.55);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      var rnd = new Uint32Array(len);
      crypto.getRandomValues(rnd);
      for (var i = 0; i < len; i++) {
        d[i] = (rnd[i] / 2147483648 - 1) * Math.pow(1 - i / len, 3.5) * 0.4;
      }
    }
    reverb = ctx.createConvolver();
    reverb.buffer = buf;
    var rg = ctx.createGain();
    rg.gain.value = 0.15;
    reverb.connect(rg);
    rg.connect(ctx.destination);
    return true;
  } catch (e) { return false; }
}

function now() { return ctx ? ctx.currentTime : 0; }

/* 短瞬态脉冲（可做敲击/咔哒）*/
function ping(freq, dur, vol, when, type, rev) {
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || 0.3, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  if (rev && reverb) g.connect(reverb);
  o.start(t); o.stop(t + dur + 0.02);
}

/* 高通噪声 click（铁片感）*/
function click(centerF, dur, vol, when) {
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var len = Math.floor(ctx.sampleRate * dur);
  var buf = ctx.createBuffer(1, len, ctx.sampleRate);
  var d = buf.getChannelData(0);
  var rnd = new Uint32Array(len);
  crypto.getRandomValues(rnd);
  for (var i = 0; i < len; i++) {
    d[i] = (rnd[i] / 2147483648 - 1) * Math.pow(1 - i / len, 2);
  }
  var src = ctx.createBufferSource();
  src.buffer = buf;
  var f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = centerF;
  f.Q.value = 4;
  var g = ctx.createGain();
  g.gain.value = vol || 0.2;
  src.connect(f); f.connect(g); g.connect(master);
  if (reverb) g.connect(reverb);
  src.start(t);
}

/* ---------- 转动齿轮循环 ---------- */
var _loop = null;
function startGearLoop() {
  if (!ctx || !enabled) return;
  stopGearLoop();
  var g = ctx.createGain();
  g.gain.value = 0;
  g.connect(master);
  // 低频震颤
  var o1 = ctx.createOscillator();
  o1.type = 'triangle';
  o1.frequency.value = 48;
  var o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = 72;
  o1.connect(g); o2.connect(g);
  o1.start(); o2.start();
  g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
  // 每秒 14 次的机械咔哒
  var tick = 0;
  var iv = setInterval(function(){
    if (!ctx) return;
    click(3200 + (tick % 2) * 400, 0.02, 0.05);
    tick++;
  }, 70);
  _loop = { g: g, o1: o1, o2: o2, iv: iv };
}
function stopGearLoop() {
  if (!_loop || !ctx) return;
  var L = _loop; _loop = null;
  clearInterval(L.iv);
  try {
    L.g.gain.cancelScheduledValues(ctx.currentTime);
    L.g.gain.setValueAtTime(L.g.gain.value, ctx.currentTime);
    L.g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    setTimeout(function(){
      try { L.o1.stop(); L.o2.stop(); } catch(e){}
    }, 220);
  } catch(e){}
}

var API = {
  init: init,
  enabled: function(v) {
    if (v === undefined) return enabled;
    enabled = !!v;
    if (ctx && master) master.gain.setTargetAtTime(enabled ? VOLUME : 0, ctx.currentTime, 0.02);
    if (!enabled) stopGearLoop();
    return enabled;
  },
  volume: function(v) {
    if (v === undefined) return VOLUME;
    VOLUME = Math.max(0, Math.min(1, v));
    if (master) master.gain.value = enabled ? VOLUME : 0;
  },

  /* 机械按钮：圆润短促 */
  click: function() {
    if (!ctx) init();
    var t = now();
    ping(900, 0.04, 0.10, t);
    click(2400, 0.02, 0.05, t);
  },

  /* 旋转启动：机械弹簧 + 齿轮声开始 */
  spinStart: function() {
    if (!ctx) init();
    var t = now();
    ping(140, 0.28, 0.14, t, 'triangle');
    ping(70, 0.36, 0.10, t + 0.02, 'sine');
    click(1800, 0.04, 0.08, t + 0.05);
    setTimeout(startGearLoop, 100);
  },

  /* 停列：清脆铁片敲击 + 低音垫底 */
  reelStop: function(index) {
    if (!ctx) init();
    var t = now();
    // 金属瞬态（各列音高递增）
    var f = 1100 + index * 120;
    click(f, 0.03, 0.25, t);
    ping(f * 1.4, 0.06, 0.15, t + 0.002, 'triangle');
    // 低音"咚"
    ping(90 - index * 5, 0.10, 0.18, t, 'sine');
    if (index === 2) {
      setTimeout(stopGearLoop, 120);
    }
  },

  /* ---------- 中奖 ---------- */
  winSmall: function() {
    if (!ctx) init();
    var t = now();
    ping(880, 0.10, 0.26, t, 'sine', true);
    ping(1320, 0.16, 0.22, t + 0.08, 'sine', true);
  },
  winMedium: function() {
    if (!ctx) init();
    var t = now();
    [784, 988, 1175, 1568].forEach(function(f, i) {
      ping(f, 0.22, 0.22, t + i * 0.075, 'sine', true);
    });
    // 金币洒落
    for (var i = 0; i < 5; i++) {
      click(4200 + 0, 0.015, 0.06, t + 0.15 + i * 0.04);
    }
  },
  winBig: function() {
    if (!ctx) init();
    var t = now();
    var notes = [523, 659, 784, 1047, 1319, 1568, 2093];
    notes.forEach(function(f, i) {
      ping(f, 0.28, 0.22, t + i * 0.07, 'sine', true);
      ping(f * 0.5, 0.24, 0.08, t + i * 0.07, 'triangle', true);
    });
    [523, 659, 784, 1047].forEach(function(f){
      ping(f, 1.0, 0.16, t + 0.55, 'sine', true);
    });
    // 金币雨
    var rndBuf = new Uint32Array(12);
    crypto.getRandomValues(rndBuf);
    for (var i = 0; i < 12; i++) {
      click(3600 + (rndBuf[i] % 2400), 0.018, 0.07, t + 0.4 + i * 0.06);
    }
  },

  lose: function() {
    if (!ctx) init();
    stopGearLoop();
    ping(220, 0.08, 0.06, null, 'sine');
  },

  stopLoop: stopGearLoop
};

window.SlotAudio = API;
})();
