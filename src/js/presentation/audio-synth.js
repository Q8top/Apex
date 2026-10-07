/* Apex · Web Audio 合成器
 * 用 OscillatorNode 生成简单音效，零音频文件
 */
(function () {
  'use strict';

  var ctx = null;
  var master = null;

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
    return ctx;
  }

  function resume() {
    var c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
  }

  function tone(opts) {
    var c = ensureCtx();
    if (!c) return;
    var o = opts || {};
    var freq = Number(o.freq) || 800;
    var freqTo = Number(o.freqTo) || freq;
    var dur = Number(o.dur) || 120;
    var type = o.type || 'sine';
    var gain = Number(o.gain) || 0.15;
    var delay = Number(o.delay) || 0;

    var now = c.currentTime + delay;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqTo !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqTo), now + dur / 1000);
    }
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur / 1000);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + dur / 1000 + 0.05);
  }

  var PRESETS = {
    'ui-tap':      function () { tone({ freq: 800, dur: 60, type: 'square', gain: 0.10 }); },
    'spin-start':  function () { tone({ freq: 400, freqTo: 700, dur: 140, type: 'triangle', gain: 0.14 }); },
    'spin-stop':   function () { tone({ freq: 700, freqTo: 400, dur: 120, type: 'triangle', gain: 0.12 }); },
    'tumble':      function () { tone({ freq: 320, freqTo: 180, dur: 90, type: 'sawtooth', gain: 0.09 }); },
    'win-normal':  function () {
      tone({ freq: 800, dur: 120, type: 'sine', gain: 0.14 });
      tone({ freq: 1200, dur: 140, type: 'sine', gain: 0.12, delay: 0.10 });
    },
    'big-win':     function () {
      [660, 880, 1100].forEach(function (f, i) {
        tone({ freq: f, dur: 160, type: 'sine', gain: 0.14, delay: i * 0.09 });
      });
    },
    'mega-win':    function () {
      [660, 880, 1100, 1320].forEach(function (f, i) {
        tone({ freq: f, dur: 180, type: 'sine', gain: 0.15, delay: i * 0.08 });
      });
    },
    'super-win':   function () {
      [523, 659, 784, 1047, 1319].forEach(function (f, i) {
        tone({ freq: f, dur: 220, type: 'sine', gain: 0.16, delay: i * 0.07 });
      });
      tone({ freq: 1568, dur: 600, type: 'sine', gain: 0.10, delay: 0.4 });
    },
    'bonus':       function () {
      [440, 554, 659, 880].forEach(function (f, i) {
        tone({ freq: f, dur: 200, type: 'triangle', gain: 0.13, delay: i * 0.10 });
      });
    },
    'multiplier':  function () { tone({ freq: 1400, dur: 100, type: 'square', gain: 0.10 }); }
  };

  function play(name, opts) {
    resume();
    var fn = PRESETS[name];
    if (!fn) return false;
    try { fn(opts); return true; }
    catch (e) { return false; }
  }

  function setMasterVolume(v) {
    var n = Math.max(0, Math.min(1, Number(v) || 0));
    if (!master) ensureCtx();
    if (master) master.gain.value = n;
  }

  function suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); }
  function resumeCtx() { resume(); }

  window.ApexAudioSynth = {
    PRESETS: PRESETS,
    play: play,
    setMasterVolume: setMasterVolume,
    suspend: suspend,
    resume: resumeCtx,
    hasSupport: function () { return !!(window.AudioContext || window.webkitAudioContext); }
  };
})();
