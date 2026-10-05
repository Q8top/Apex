/* Apex Olympus 音效引擎 —— Web Audio API 纯合成
 * 无外部音频文件，全部程序生成
 */
(function(){
'use strict';

var ctx = null;
var masterGain = null;
var enabled = true;

/* 安全随机（项目硬约束） */
function rnd(){
  var buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
}

function init(){
  if (ctx) return;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
  } catch (e) {
    ctx = null;
  }
}

/* 用户手势后解锁（浏览器策略） */
function unlock(){
  if (!ctx) init();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function setEnabled(v){ enabled = !!v; }

/* ============ 基础音色 ============ */
/* 单音：type / freq / duration / gain / decay */
function tone(type, freq, dur, gain, when){
  if (!ctx || !enabled) return;
  var t0 = when || ctx.currentTime;
  var osc = ctx.createOscillator();
  var g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/* 频率扫动（whoosh / 上升） */
function sweep(type, f0, f1, dur, gain){
  if (!ctx || !enabled) return;
  var t0 = ctx.currentTime;
  var osc = ctx.createOscillator();
  var g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t0);
  osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/* 白噪声（掉落 / 粒子） */
function noise(dur, gain, filterHz){
  if (!ctx || !enabled) return;
  var t0 = ctx.currentTime;
  var bufSize = Math.floor(ctx.sampleRate * dur);
  var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) data[i] = (rnd() * 2 - 1) * 0.5;
  var src = ctx.createBufferSource();
  src.buffer = buf;
  var filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterHz || 1200;
  filter.Q.value = 1.5;
  var g = ctx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  src.start(t0);
  src.stop(t0 + dur);
}

/* ============ 音效 ============ */
/* 旋转按钮点击 */
function sSpin(){
  unlock();
  tone('triangle', 440, 0.06, 0.15);
  setTimeout(function(){ tone('triangle', 660, 0.08, 0.12); }, 60);
}

/* 每列掉落（依次 6 列） */
function sDrop(){
  for (var i = 0; i < 6; i++) {
    setTimeout(function(){
      noise(0.08, 0.08, 900 + Math.floor(rnd() * 400));
    }, i * 35);
  }
}

/* 单次中奖 */
function sWin(tier){
  unlock();
  var base = tier === 2 ? 880 : (tier === 1 ? 660 : 523);
  tone('sine', base, 0.18, 0.18);
  setTimeout(function(){ tone('sine', base * 1.25, 0.18, 0.15); }, 80);
  setTimeout(function(){ tone('sine', base * 1.5, 0.25, 0.12); }, 160);
}

/* 大赢（金额高 / 倍数高） */
function sBigWin(){
  unlock();
  var notes = [523, 659, 784, 1047, 1319];
  notes.forEach(function(f, i){
    setTimeout(function(){ tone('sine', f, 0.25, 0.2); }, i * 90);
  });
}

/* 免费旋转触发 */
function sScatter(){
  unlock();
  sweep('sawtooth', 200, 1200, 0.4, 0.15);
  setTimeout(function(){ sweep('sawtooth', 400, 1600, 0.4, 0.12); }, 200);
}

/* 免费旋转每轮开始 */
function sFsTick(n){
  unlock();
  tone('square', 880, 0.08, 0.12);
}

/* 免费旋转结束 */
function sFsEnd(){
  unlock();
  sweep('triangle', 1200, 400, 0.5, 0.15);
}

/* Tumble 掉落补位 */
function sTumble(){
  noise(0.12, 0.1, 1500);
}

/* 按钮通用反馈 */
function sClick(){
  unlock();
  tone('square', 1000, 0.04, 0.08);
}

/* ============ 导出 ============ */
window.ApexAudio = {
  init: init,
  unlock: unlock,
  setEnabled: setEnabled,
  sSpin: sSpin,
  sDrop: sDrop,
  sWin: sWin,
  sBigWin: sBigWin,
  sScatter: sScatter,
  sFsTick: sFsTick,
  sFsEnd: sFsEnd,
  sTumble: sTumble,
  sClick: sClick
};

})();
