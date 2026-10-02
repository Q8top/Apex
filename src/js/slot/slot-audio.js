/* 幸运水果 · 音效 v3
   - 点击：双音叠加（清脆）
   - 滚动：低频启动 + 循环机械咔哒
   - 停列：FM 合成金属咔
   - 中奖：保留
*/
(function(){
'use strict';

var ctx = null, master = null, reverb = null;
var enabled = true;
var VOLUME = 0.5;

function init() {
  if (ctx) return true;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);

    // 短混响
    var len = Math.floor(ctx.sampleRate * 0.9);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      var rnd = new Uint32Array(len);
      crypto.getRandomValues(rnd);
      for (var i = 0; i < len; i++) {
        var decay = Math.pow(1 - i / len, 3.2);
        d[i] = (rnd[i] / 2147483648 - 1) * decay * 0.5;
      }
    }
    reverb = ctx.createConvolver();
    reverb.buffer = buf;
    var rg = ctx.createGain();
    rg.gain.value = 0.18;
    reverb.connect(rg);
    rg.connect(ctx.destination);
    return true;
  } catch (e) { return false; }
}

function now() { return ctx ? ctx.currentTime : 0; }

/* 单音基础 */
function tone(freq, dur, type, vol, when, rev, slideTo) {
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol == null ? 0.3 : vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  if (rev && reverb) g.connect(reverb);
  o.start(t); o.stop(t + dur + 0.03);
}

/* FM 音：金属打击感 */
function fm(carrier, mod, idx, dur, vol, when) {
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var c = ctx.createOscillator();
  var m = ctx.createOscillator();
  var mg = ctx.createGain();
  var g = ctx.createGain();
  c.type = 'sine'; c.frequency.value = carrier;
  m.type = 'sine'; m.frequency.value = mod;
  mg.gain.value = carrier * idx;
  m.connect(mg); mg.connect(c.frequency);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol == null ? 0.28 : vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  c.connect(g); g.connect(master);
  if (reverb) g.connect(reverb);
  m.start(t); c.start(t);
  m.stop(t + dur + 0.03); c.stop(t + dur + 0.03);
}

/* ---------- 循环滚动声 ---------- */
var _loop = null;
function startSpinLoop() {
  if (!ctx || !enabled) return;
  stopSpinLoop();
  var g = ctx.createGain();
  g.gain.value = 0;
  g.connect(master);
  // 底噪：低频三角波 + 慢颤
  var o1 = ctx.createOscillator();
  o1.type = 'triangle';
  o1.frequency.value = 55;
  var o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = 90;
  var lfo = ctx.createOscillator();
  var lfoGain = ctx.createGain();
  lfo.frequency.value = 18;
  lfoGain.gain.value = 4;
  lfo.connect(lfoGain);
  lfoGain.connect(o2.frequency);
  o1.connect(g); o2.connect(g);
  o1.start(); o2.start(); lfo.start();
  g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.08);
  _loop = { g: g, o1: o1, o2: o2, lfo: lfo };
}
function stopSpinLoop() {
  if (!_loop || !ctx) return;
  var L = _loop; _loop = null;
  try {
    L.g.gain.cancelScheduledValues(ctx.currentTime);
    L.g.gain.setValueAtTime(L.g.gain.value, ctx.currentTime);
    L.g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    setTimeout(function(){
      try { L.o1.stop(); L.o2.stop(); L.lfo.stop(); } catch(e){}
    }, 200);
  } catch(e){}
}

var API = {
  init: init,
  enabled: function(v) {
    if (v === undefined) return enabled;
    enabled = !!v;
    if (ctx && master) master.gain.setTargetAtTime(enabled ? VOLUME : 0, ctx.currentTime, 0.02);
    if (!enabled) stopSpinLoop();
    return enabled;
  },
  volume: function(v) {
    if (v === undefined) return VOLUME;
    VOLUME = Math.max(0, Math.min(1, v));
    if (master) master.gain.value = enabled ? VOLUME : 0;
  },

  /* ---------- UI 点击：清脆双音 ---------- */
  click: function() {
    if (!ctx) init();
    var t = now();
    tone(2400, 0.035, 'sine', 0.13, t);
    tone(1200, 0.05, 'triangle', 0.08, t + 0.005);
  },

  /* ---------- 旋转：启动 + 循环 ---------- */
  spinStart: function() {
    if (!ctx) init();
    var t = now();
    // 低沉启动
    tone(90, 0.4, 'sine', 0.14, t, true, 55);
    tone(180, 0.3, 'triangle', 0.08, t + 0.02, true, 110);
    // 金属启动点缀
    fm(1400, 220, 2.5, 0.18, 0.08, t + 0.03);
    // 启动循环
    setTimeout(startSpinLoop, 120);
  },

  /* 停列：FM 金属咔 */
  reelStop: function(index) {
    if (!ctx) init();
    var t = now();
    var baseF = 380 + index * 60;
    // 金属叮（FM 调制产生泛音）
    fm(baseF, baseF * 1.7, 3.2, 0.16, 0.32, t);
    // 高频清脆层
    tone(baseF * 2.5, 0.05, 'sine', 0.10, t);
    // 低音垫底（机械感）
    tone(100 - index * 5, 0.08, 'triangle', 0.16, t);
    // 最后一列停止时收尾循环
    if (index === 2) {
      setTimeout(stopSpinLoop, 100);
    }
  },

  /* ---------- 中奖（保留）---------- */
  winSmall: function() {
    if (!ctx) init();
    var t = now();
    tone(660, 0.14, 'sine', 0.30, t, true);
    tone(880, 0.20, 'sine', 0.22, t + 0.10, true);
  },
  winMedium: function() {
    if (!ctx) init();
    var t = now();
    [523.25, 659.25, 783.99, 1046.5].forEach(function(f, i) {
      tone(f, 0.28, 'sine', 0.26, t + i * 0.08, true);
      tone(f * 2, 0.16, 'triangle', 0.07, t + i * 0.08, true);
    });
  },
  winBig: function() {
    if (!ctx) init();
    var t = now();
    var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568, 2093];
    notes.forEach(function(f, i) {
      tone(f, 0.32, 'sine', 0.24, t + i * 0.07, true);
      tone(f * 0.5, 0.32, 'triangle', 0.08, t + i * 0.07, true);
    });
    [523.25, 659.25, 783.99].forEach(function(f){
      tone(f, 1.0, 'sine', 0.20, t + 0.55, true);
    });
  },

  lose: function() {
    if (!ctx) init();
    stopSpinLoop();
    tone(196, 0.12, 'sine', 0.06);
  },

  /* 主动停止循环 */
  stopLoop: stopSpinLoop
};

window.SlotAudio = API;
})();
