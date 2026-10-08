/* Apex · Web Audio 合成器
 * 用 OscillatorNode 生成简单音效，零音频文件
 *
 * 节点链：
 *   osc → gain(包络) → sfxGain ─┐
 *                                ├→ masterGain → destination
 *                  （music 未启用）┘
 *
 * 契约（与 audio.js 对齐）：
 *   - setMasterVolume / setMusicVolume / setSfxVolume / setEnabled
 *   - suspend / resume
 *   - 首次 play 前会 resume()，处理 Chrome/Safari 手势解锁
 *   - tone 结束后 disconnect()，防长会话内存泄漏
 */
(function () {
  'use strict';

  var ctx = null;
  var masterGain = null;
  var musicGain = null;
  var sfxGain = null;

  var vols = {
    enabled: true,
    master: 0.8,
    music: 0.6,
    sfx: 0.9
  };

  function clamp01(v, fallback) {
    if (v === undefined) return fallback;
    var n = Number(v);
    if (!Number.isFinite(n)) throw new Error('synth: volume non-finite');
    return Math.max(0, Math.min(1, n));
  }

  function applyGains() {
    if (!masterGain) return;
    masterGain.gain.value = vols.enabled ? vols.master : 0;
    musicGain.gain.value = vols.music;
    sfxGain.gain.value = vols.sfx;
  }

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    musicGain = ctx.createGain();
    sfxGain = ctx.createGain();
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(ctx.destination);
    applyGains();
    return ctx;
  }

  function resume() {
    var c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended' && typeof c.resume === 'function') {
      try {
        var p = c.resume();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (e) {}
    }
  }

  function tone(opts) {
    var c = ensureCtx();
    if (!c) return false;
    var o = opts || {};

    var freqRaw = Number(o.freq);
    var freq = Number.isFinite(freqRaw) && freqRaw > 0 ? freqRaw : 800;

    var freqToRaw = Number(o.freqTo);
    var freqTo = Number.isFinite(freqToRaw) && freqToRaw > 0 ? freqToRaw : freq;

    var durRaw = Number(o.dur);
    var dur = Number.isFinite(durRaw) && durRaw > 0 ? durRaw : 120;

    var gainRaw = Number(o.gain);
    var gain = Number.isFinite(gainRaw) && gainRaw >= 0 ? gainRaw : 0.15;

    var delayRaw = Number(o.delay);
    var delay = Number.isFinite(delayRaw) && delayRaw >= 0 ? delayRaw : 0;

    var type = o.type || 'sine';
    var bus = (o.bus === 'music') ? musicGain : sfxGain;

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
    g.connect(bus);

    // 显式 disconnect，防长会话内存泄漏
    osc.onended = function () {
      try { osc.disconnect(); } catch (e) {}
      try { g.disconnect(); } catch (e) {}
    };

    osc.start(now);
    osc.stop(now + dur / 1000 + 0.05);
    return true;
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
    'epic-win':    function () {
      [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) {
        tone({ freq: f, dur: 240, type: 'sine', gain: 0.17, delay: i * 0.06 });
      });
      tone({ freq: 2093, dur: 800, type: 'sine', gain: 0.12, delay: 0.42 });
      tone({ freq: 1047, dur: 400, type: 'triangle', gain: 0.10, delay: 0.6 });
    },
    'ultra-win':   function () {
      [523, 659, 784, 1047, 1319, 1568, 2093].forEach(function (f, i) {
        tone({ freq: f, dur: 260, type: 'sine', gain: 0.18, delay: i * 0.055 });
      });
      tone({ freq: 2637, dur: 1000, type: 'sine', gain: 0.13, delay: 0.42 });
      tone({ freq: 1568, dur: 600, type: 'triangle', gain: 0.12, delay: 0.7 });
      tone({ freq: 2093, dur: 800, type: 'triangle', gain: 0.10, delay: 0.9 });
    },
    'bonus':       function () {
      [440, 554, 659, 880].forEach(function (f, i) {
        tone({ freq: f, dur: 200, type: 'triangle', gain: 0.13, delay: i * 0.10 });
      });
    },
    'multiplier':  function () { tone({ freq: 1400, dur: 100, type: 'square', gain: 0.10 }); }
  };

  var PRESETS_FROZEN = Object.freeze(PRESETS);

  function play(name, opts) {
    resume();
    var fn = PRESETS_FROZEN[name];
    if (!fn) return false;
    try { fn(opts); return true; }
    catch (e) { return false; }
  }

  function setMasterVolume(v) {
    vols.master = clamp01(v, vols.master);
    applyGains();
    return vols.master;
  }
  function setMusicVolume(v) {
    vols.music = clamp01(v, vols.music);
    applyGains();
    return vols.music;
  }
  function setSfxVolume(v) {
    vols.sfx = clamp01(v, vols.sfx);
    applyGains();
    return vols.sfx;
  }
  function setEnabled(v) {
    vols.enabled = !!v;
    applyGains();
    return vols.enabled;
  }

  function suspend() {
    if (ctx && ctx.state === 'running' && typeof ctx.suspend === 'function') {
      try {
        var p = ctx.suspend();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (e) {}
    }
  }
  function resumeCtx() { resume(); }

  function getVolumes() {
    return Object.freeze({
      enabled: vols.enabled,
      master: vols.master,
      music: vols.music,
      sfx: vols.sfx
    });
  }

  window.ApexAudioSynth = Object.freeze({
    PRESETS: PRESETS_FROZEN,
    play: play,
    setMasterVolume: setMasterVolume,
    setMusicVolume: setMusicVolume,
    setSfxVolume: setSfxVolume,
    setEnabled: setEnabled,
    suspend: suspend,
    resume: resumeCtx,
    getVolumes: getVolumes,
    hasSupport: function () { return !!(window.AudioContext || window.webkitAudioContext); }
  });
})();
