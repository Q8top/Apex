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
    sfx: 0.7
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

  // 采样音缓存（CC0 from Kenney.nl）
  var samples = {};        // name -> AudioBuffer
  var samplesLoading = {}; // name -> Promise
  var SAMPLES_BASE = '/sfx/';

  function preloadOne(name) {
    if (samples[name]) return Promise.resolve(samples[name]);
    if (samplesLoading[name]) return samplesLoading[name];
    var c = ensureCtx();
    if (!c) return Promise.resolve(null);
    if (typeof fetch !== 'function') return Promise.resolve(null);
    samplesLoading[name] = fetch(SAMPLES_BASE + name + '.wav')
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.arrayBuffer();
      })
      .then(function (ab) { return c.decodeAudioData(ab); })
      .then(function (buf) {
        samples[name] = buf;
        delete samplesLoading[name];
        return buf;
      })
      .catch(function () {
        delete samplesLoading[name];
        return null;
      });
    return samplesLoading[name];
  }

  function preloadSamples() {
    var names = Object.keys(PRESETS_FROZEN);
    var tasks = [];
    for (var i = 0; i < names.length; i++) tasks.push(preloadOne(names[i]));
    return Promise.all(tasks);
  }

  function playBuffer(buf, opts) {
    var c = ensureCtx();
    if (!c) return false;
    var o = opts || {};
    var gainVal = Number.isFinite(o.gain) && o.gain >= 0 ? o.gain : 1;
    var src = c.createBufferSource();
    src.buffer = buf;
    var g = c.createGain();
    g.gain.value = Math.min(1, gainVal);
    src.connect(g);
    g.connect(sfxGain);
    src.onended = function () {
      try { src.disconnect(); } catch (e) {}
      try { g.disconnect(); } catch (e) {}
    };
    try { src.start(0); return true; } catch (e) { return false; }
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
    var durSec = dur / 1000;
    var attackSec = 0.020;             // 20ms attack（防咔哒）
    var releaseSec = 0.035;            // 35ms release
    if (attackSec + releaseSec > durSec * 0.9) {
      attackSec = durSec * 0.3;
      releaseSec = durSec * 0.3;
    }
    var sustainEnd = now + durSec - releaseSec;
    var peak = gain;

    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqTo !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqTo), now + durSec);
    }
    // ADSR 包络：0 → peak(20ms) → peak(sustain) → 0.15*peak → 0(35ms)
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(peak, now + attackSec);
    g.gain.linearRampToValueAtTime(peak, sustainEnd);
    g.gain.linearRampToValueAtTime(Math.max(0.0001, peak * 0.15), sustainEnd + releaseSec * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

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
    // UI：柔和的三角波"点"（原为 square 刺耳）
    'ui-tap':      function () { tone({ freq: 900, dur: 60, type: 'triangle', gain: 0.06 }); },
    // Spin：温和上升
    'spin-start':  function () { tone({ freq: 380, freqTo: 620, dur: 160, type: 'triangle', gain: 0.09 }); },
    'spin-stop':   function () { tone({ freq: 620, freqTo: 380, dur: 130, type: 'triangle', gain: 0.08 }); },
    // Tumble：低沉轻"呼"（原为 sawtooth）
    'tumble':      function () { tone({ freq: 260, freqTo: 160, dur: 110, type: 'triangle', gain: 0.07 }); },

    // 中奖：由低到高的 2~3 音
    'win-normal':  function () {
      tone({ freq: 660, dur: 140, type: 'sine', gain: 0.10 });
      tone({ freq: 990, dur: 180, type: 'sine', gain: 0.09, delay: 0.10 });
    },
    'big-win':     function () {
      [523, 659, 784].forEach(function (f, i) {
        tone({ freq: f, dur: 180, type: 'sine', gain: 0.10, delay: i * 0.10 });
      });
    },
    'mega-win':    function () {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone({ freq: f, dur: 200, type: 'sine', gain: 0.11, delay: i * 0.09 });
      });
    },
    'super-win':   function () {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone({ freq: f, dur: 240, type: 'sine', gain: 0.11, delay: i * 0.08 });
      });
      tone({ freq: 1318, dur: 500, type: 'sine', gain: 0.08, delay: 0.42 });
    },
    'epic-win':    function () {
      // 4 音琶音 + 1 收尾（原为 8 音，太噪）
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone({ freq: f, dur: 260, type: 'sine', gain: 0.12, delay: i * 0.07 });
      });
      tone({ freq: 1568, dur: 700, type: 'sine', gain: 0.09, delay: 0.40 });
    },
    'ultra-win':   function () {
      // 5 音琶音 + 2 长尾（原为 10 音）
      [523, 659, 784, 1047, 1318].forEach(function (f, i) {
        tone({ freq: f, dur: 280, type: 'sine', gain: 0.12, delay: i * 0.06 });
      });
      tone({ freq: 1568, dur: 900, type: 'sine', gain: 0.09, delay: 0.42 });
      tone({ freq: 1047, dur: 600, type: 'triangle', gain: 0.07, delay: 0.75 });
    },

    // Bonus / FS
    'bonus':       function () {
      [440, 554, 659].forEach(function (f, i) {
        tone({ freq: f, dur: 220, type: 'triangle', gain: 0.09, delay: i * 0.11 });
      });
    },
    // 倍率：轻点（原为 square 1400Hz 尖啸）
    'multiplier':  function () { tone({ freq: 1180, dur: 80, type: 'triangle', gain: 0.05 }); },

    // Tumble 落点：木质"嗒"（去掉 square 900 的尖）
    'tumble-land': function () {
      tone({ freq: 170, freqTo: 120, dur: 70, type: 'triangle', gain: 0.08 });
    },

    // FS 炸弹爆炸：低频 + 轻体感（原为 sawtooth 0.18 + sine 0.25 爆音）
    'bomb-explode': function (opts) {
      var intensity = Math.min(100, Math.max(2, (opts && opts.value) || 2));
      var dur = 220 + intensity * 1.2;
      tone({ freq: 140, freqTo: 55, dur: dur, type: 'triangle', gain: 0.12 });
      tone({ freq: 90, freqTo: 50, dur: Math.max(120, dur * 0.6), type: 'sine', gain: 0.10, delay: 0.04 });
    },
    'fs-enter':    function () {
      [523, 659, 784].forEach(function (f, i) {
        tone({ freq: f, dur: 260, type: 'triangle', gain: 0.10, delay: i * 0.13 });
      });
    },
    'fs-loop':     function () {
      [784, 988].forEach(function (f, i) {
        tone({ freq: f, dur: 160, type: 'sine', gain: 0.06, delay: i * 0.09 });
      });
    }
  };

  var PRESETS_FROZEN = Object.freeze(PRESETS);

  function play(name, opts) {
    resume();
    // 采样音优先（有则用），否则回退合成音
    var buf = samples[name];
    if (buf) {
      var ok = playBuffer(buf, opts);
      if (ok) return true;
    } else {
      // 后台预加载
      try { preloadOne(name); } catch (e) {}
    }
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

  function isRunning() {
    return !!(ctx && ctx.state === 'running');
  }

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
    preloadSamples: preloadSamples,
    setMasterVolume: setMasterVolume,
    setMusicVolume: setMusicVolume,
    setSfxVolume: setSfxVolume,
    setEnabled: setEnabled,
    suspend: suspend,
    resume: resumeCtx,
    isRunning: isRunning,
    getVolumes: getVolumes,
    hasSupport: function () { return !!(window.AudioContext || window.webkitAudioContext); }
  });
})();
