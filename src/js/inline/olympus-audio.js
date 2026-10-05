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

function setEnabled(v){
  enabled = !!v;
  if (ctx && masterGain) {
    masterGain.gain.setTargetAtTime(enabled ? 0.35 : 0, ctx.currentTime, 0.05);
  }
}

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

/* ============ BGM 背景音乐（Web Audio 合成）============ */
/* 架构：2 个 pad + 1 条旋律 + 打击乐循环 */
var bgm = {
  playing: false,
  mode: 'idle',       // 'idle' | 'base' | 'fs'
  timer: null,
  step: 0,
  nextTime: 0,
  lookahead: 0.15,    // 提前 150ms 调度
  bpm: 84
};

/* 主旋律音阶：D 小调五声音阶（神秘感） */
var SCALE = [293.66, 329.63, 349.23, 440.00, 466.16, 587.33, 698.46, 880.00];
/* FS 模式音阶（更激昂）：升一个八度 + 大调感 */
var SCALE_FS = [587.33, 659.25, 698.46, 880.00, 932.33, 1174.66, 1396.91, 1760.00];

/* 低音 pad 频率（D 小调和声：D - A - Bb） */
var PAD_CHORDS = [
  [73.42, 110.00, 146.83],   // D2 A2 D3
  [82.41, 123.47, 164.81],   // E2 B2 E3
  [87.31, 130.81, 174.61],   // F2 C3 F3
  [73.42, 110.00, 146.83]    // D2 A2 D3
];

function pad(freqs, when, dur, gain){
  if (!ctx || !enabled) return;
  for (var i = 0; i < freqs.length; i++) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqs[i], when);
    // 轻微 detune 制造丰富感
    osc.detune.setValueAtTime((i - 1) * 4, when);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.8);
    g.gain.linearRampToValueAtTime(0, when + dur);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(when);
    osc.stop(when + dur + 0.1);
  }
}

function pluck(freq, when, gain){
  if (!ctx || !enabled) return;
  var osc = ctx.createOscillator();
  var g = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.55);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(when);
  osc.stop(when + 0.6);
}

function drum(when, isKick){
  if (!ctx || !enabled) return;
  var dur = isKick ? 0.18 : 0.12;
  var bufSize = Math.floor(ctx.sampleRate * dur);
  var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) data[i] = (rnd() * 2 - 1);
  var src = ctx.createBufferSource();
  src.buffer = buf;
  var filter = ctx.createBiquadFilter();
  filter.type = isKick ? 'lowpass' : 'highpass';
  filter.frequency.value = isKick ? 180 : 4000;
  filter.Q.value = 1.2;
  var g = ctx.createGain();
  g.gain.setValueAtTime(isKick ? 0.14 : 0.05, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  src.start(when);
  src.stop(when + dur + 0.02);
}

/* BGM 调度：每 16 分音符 tick 一次 */
function bgmSchedule(){
  if (!ctx || !bgm.playing) return;
  var now = ctx.currentTime;
  var lookahead = bgm.lookahead;

  while (bgm.nextTime < now + lookahead) {
    var step = bgm.step;
    var isFS = (bgm.mode === 'fs');
    var beat = 60 / bgm.bpm / 4;   // 16 分音符时长

    // Pad 每 16 拍换一次和弦
    if (step % 16 === 0) {
      var chordIdx = Math.floor(step / 16) % PAD_CHORDS.length;
      var chord = PAD_CHORDS[chordIdx];
      pad(chord, bgm.nextTime, beat * 16, isFS ? 0.055 : 0.035);
    }

    // 旋律：每 2 拍一个音符
    if (step % 2 === 0) {
      var scale = isFS ? SCALE_FS : SCALE;
      // 使用基于步进的确定性模式（无随机）
      var pattern = [0, 2, 4, 6, 4, 2, 3, 5, 7, 5, 3, 2, 4, 6, 5, 3];
      var noteIdx = pattern[Math.floor(step / 2) % pattern.length];
      var freq = scale[noteIdx % scale.length];
      var gain = isFS ? 0.06 : 0.035;
      pluck(freq, bgm.nextTime, gain);
    }

    // 打击乐：每 4 拍一记 kick
    if (step % 4 === 0) drum(bgm.nextTime, true);
    // 每 8 拍一记 hi-hat
    if (step % 8 === 4) drum(bgm.nextTime, false);

    bgm.nextTime += beat;
    bgm.step++;
    if (bgm.step > 256) bgm.step = 0;   // 循环
  }

  bgm.timer = setTimeout(bgmSchedule, 60);
}

function bgmStart(mode){
  init();
  unlock();
  if (!ctx) return;
  if (bgm.playing && bgm.mode === mode) return;
  bgm.mode = mode || 'base';
  if (bgm.playing) return;   // 已在播，只切换 mode
  bgm.playing = true;
  bgm.step = 0;
  bgm.nextTime = ctx.currentTime + 0.05;
  bgmSchedule();
}

function bgmStop(){
  bgm.playing = false;
  if (bgm.timer) { clearTimeout(bgm.timer); bgm.timer = null; }
}

function bgmSetMode(mode){
  if (bgm.mode === mode) return;
  bgm.mode = mode;
}

/* 音量随 enabled 切换 */
function bgmMute(v){
  if (masterGain) {
    masterGain.gain.setTargetAtTime(v ? 0 : 0.35, ctx.currentTime, 0.05);
  }
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
  sClick: sClick,
  bgmStart: bgmStart,
  bgmStop: bgmStop,
  bgmSetMode: bgmSetMode
};

})();
