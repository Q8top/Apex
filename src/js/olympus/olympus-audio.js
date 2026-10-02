/* 奥林匹斯之门 · 音效 v2
   目标：史诗感 + 神秘感 + 金币坠落（纯合成）
   技术：
   - 大教堂卷积混响（5s 衰减）
   - 弦乐 pad：多层 detune sine 叠加
   - 硬币：FM 高频打击
   - 雷声：白噪 + 低频包络
   - 动态压缩：master 链
*/
(function(){
'use strict';

var ctx = null, master = null, comp = null, reverb = null, revGain = null, dryGain = null;
var enabled = true, VOL = 0.55;

function init(){
  if (ctx) return true;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    // ---- 主链路：mix → compressor → destination ----
    master = ctx.createGain();
    master.gain.value = VOL;

    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;

    master.connect(comp);
    comp.connect(ctx.destination);

    // ---- 大教堂混响（5s 衰减 + 立体声）----
    var revLen = Math.floor(ctx.sampleRate * 4.8);
    var revBuf = ctx.createBuffer(2, revLen, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = revBuf.getChannelData(ch);
      var rnd = new Uint32Array(revLen);
      crypto.getRandomValues(rnd);
      // 早期反射 + 长尾
      for (var i = 0; i < revLen; i++) {
        var t = i / revLen;
        // 双指数衰减：前 15% 强反射，后面长尾
        var decay = t < 0.15
          ? Math.pow(1 - t / 0.15, 1.5) * 0.85
          : Math.pow(1 - (t - 0.15) / 0.85, 3.5) * 0.75;
        d[i] = (rnd[i] / 2147483648 - 1) * decay * 0.55;
      }
    }
    reverb = ctx.createConvolver();
    reverb.buffer = revBuf;

    revGain = ctx.createGain();
    revGain.gain.value = 0.35;
    dryGain = ctx.createGain();
    dryGain.gain.value = 0.7;

    reverb.connect(revGain);
    revGain.connect(master);
    dryGain.connect(master);

    return true;
  } catch(e) { return false; }
}
function now(){ return ctx ? ctx.currentTime : 0; }

/* 基础音：干湿分离 */
function tone(freq, dur, vol, when, type, slideTo, rev){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || .25, t + .01);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g);
  g.connect(dryGain);
  if (rev) g.connect(reverb);
  o.start(t); o.stop(t + dur + .05);
}

/* 弦乐 pad：多层 detune 叠加（关键：让电子音有"人味"） */
function stringPad(freq, dur, vol, when){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  // 3 层 detune：-7 音分 / 0 / +7 音分
  [0.996, 1, 1.004].forEach(function(mult, i){
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; // 锯齿波 + 滤波 → 弦乐感
    o.frequency.value = freq * mult;
    // 慢速 vibrato
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.frequency.value = 5 + i * 0.3;
    lfoGain.gain.value = freq * 0.004;
    lfo.connect(lfoGain); lfoGain.connect(o.frequency);
    lfo.start(t); lfo.stop(t + dur + .05);

    // 低通滤波（去高频刺耳）
    var flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = 2200;
    flt.Q.value = 0.7;

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime((vol || .08) * (1 - i * 0.15), t + dur * 0.15);
    g.gain.setValueAtTime((vol || .08) * (1 - i * 0.15), t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);

    o.connect(flt); flt.connect(g);
    g.connect(dryGain); g.connect(reverb);
    o.start(t); o.stop(t + dur + .05);
  });
}

/* FM 打击：金属 / 硬币 */
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
  c.connect(g);
  g.connect(dryGain);
  if (rev) g.connect(reverb);
  m.start(t); c.start(t);
  m.stop(t + dur + .03); c.stop(t + dur + .03);
}

/* 白噪 */
function noise(dur, vol, when, filterType, cutoff, rev){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var len = Math.floor(ctx.sampleRate * dur);
  var buf = ctx.createBuffer(1, len, ctx.sampleRate);
  var d = buf.getChannelData(0);
  var rnd = new Uint32Array(len);
  crypto.getRandomValues(rnd);
  for (var i = 0; i < len; i++) d[i] = (rnd[i] / 2147483648 - 1) * (1 - i / len);
  var src = ctx.createBufferSource(); src.buffer = buf;
  var node = src;
  if (filterType) {
    var f = ctx.createBiquadFilter();
    f.type = filterType; f.frequency.value = cutoff || 1000; f.Q.value = 1;
    src.connect(f); node = f;
  }
  var g = ctx.createGain(); g.gain.value = vol || .15;
  node.connect(g);
  g.connect(dryGain);
  if (rev) g.connect(reverb);
  src.start(t);
}

/* 金币坠落：多枚叠加速度感 */
function coinDrop(count, when){
  if (!enabled || !ctx) return;
  var t = when != null ? when : now();
  var rnd = new Uint32Array(count * 3); crypto.getRandomValues(rnd);
  for (var i = 0; i < count; i++) {
    var delay = (rnd[i] % 800) / 1000;
    var f = 2200 + (rnd[count + i] % 1800);
    fm(f, f * 1.5, 2.5, 0.11, 0.13, t + delay, true);
  }
}

/* 合成人声 "Oh Zeus!" —— 强制女声 + 高亢拖尾 */
var FEMALE_NAMES = ['Samantha','Victoria','Karen','Moira','Tessa','Serena','Allison','Ava','Susan','Zira','Jenny','Aria','Female','Woman','女'];
function speakZeus(){
  if (!enabled) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance('Oh Zeus');
    u.lang = 'en-US';
    u.pitch = 1.5;
    u.rate = 0.7;
    u.volume = 0.85;
    var voices = window.speechSynthesis.getVoices() || [];
    var female = null;
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (!v.lang || v.lang.toLowerCase().indexOf('en') !== 0) continue;
      var nm = String(v.name || '');
      for (var j = 0; j < FEMALE_NAMES.length; j++) {
        if (nm.indexOf(FEMALE_NAMES[j]) !== -1) { female = v; break; }
      }
      if (female) break;
      if (/female/i.test(nm)) { female = v; break; }
    }
    if (female) u.voice = female;
    window.speechSynthesis.speak(u);
  } catch(e) {}
}
function rand01(){ var b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] / 4294967296; }
var API = {
  init: init,
  enabled: function(v){
    if (v === undefined) return enabled;
    enabled = !!v;
    if (master) master.gain.setTargetAtTime(enabled ? VOL : 0, ctx.currentTime, .03);
    return enabled;
  },

  /* UI 点击 */
  click: function(){
    if (!ctx) init();
    var t = now();
    fm(1600, 2800, 3, .04, .09, t);
    tone(800, .05, .05, t + .005, 'triangle');
  },

  /* 旋转启动：史诗弦乐 + 雷声 */
  spinStart: function(){
    if (!ctx) init();
    var t = now();
    // 雷声（白噪 + 低频滤波 + 长衰减）
    noise(.6, .22, t, 'lowpass', 380, true);
    noise(1.2, .12, t + .05, 'lowpass', 200, true);
    // 弦乐 pad 上行（A 小调）
    stringPad(220, 1.0, .09, t);
    stringPad(261.63, .9, .07, t + .06);
    stringPad(329.63, .8, .06, t + .12);
    // 上升箭头
    tone(880, .35, .06, t + .2, 'sine', 1760, true);
  },

  /* 停列：FM 金属咔 + 短促弦乐 */
  reelStop: function(index){
    if (!ctx) init();
    var t = now();
    fm(500 + index * 90, 180 + index * 20, 2.8, .14, .26, t, true);
    stringPad(180 + index * 30, .12, .05, t);
    noise(.05, .08, t, 'highpass', 2500);
  },

  /* Tumble：whoosh + 玻璃叮 */
  tumble: function(){
    if (!ctx) init();
    var t = now();
    noise(.28, .16, t, 'bandpass', 1400, true);
    tone(2100, .07, .12, t + .08, 'sine', null, true);
    tone(2800, .06, .08, t + .13, 'sine', null, true);
  },

  /* 小中奖 */
  winSmall: function(){
    if (!ctx) init();
    var t = now();
    stringPad(523, .4, .08, t);
    stringPad(659, .5, .07, t + .1);
    coinDrop(3, t + .1);
  },

  /* 中奖：弦乐琶音 + 金币坠落 */
  winMedium: function(){
    if (!ctx) init();
    var t = now();
    [523, 659, 784, 1047].forEach(function(f, i){
      stringPad(f, .5, .08, t + i * .11);
      tone(f * 2, .3, .06, t + i * .11, 'sine', null, true);
    });
    coinDrop(8, t + .2);
  },

  /* 大赢：史诗弦乐 + 雷声 + 金币雨 */
  winBig: function(){
    if (!ctx) init();
    var t = now();
    // 雷声收尾
    noise(1.0, .28, t, 'lowpass', 320, true);
    // A 大调和弦上行（弦乐）
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach(function(f, i){
      stringPad(f, .7, .09, t + i * .08);
      stringPad(f * 0.5, .7, .07, t + i * .08);
    });
    // 尾部和弦（长 sustain）
    [523, 659, 784, 1047].forEach(function(f){
      stringPad(f, 2.0, .1, t + .7);
    });
    // 金币雨
    coinDrop(20, t + .5);
  },

  lose: function(){
    if (!ctx) init();
    tone(180, .2, .06, null, 'sine', 140, true);
  }
};

window.OlympusAudio = API;
})();
