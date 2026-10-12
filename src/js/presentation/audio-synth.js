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

  var reverbNode = null;
  var reverbGain = null;
  var compressorNode = null;
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
    compressorNode = ctx.createDynamicsCompressor();
    try {
      compressorNode.threshold.value = -18;
      compressorNode.knee.value = 24;
      compressorNode.ratio.value = 3;
      compressorNode.attack.value = 0.005;
      compressorNode.release.value = 0.18;
    } catch (e) {}
    reverbNode = ctx.createConvolver();
    try { reverbNode.buffer = _makeIR(ctx, 2.4, 2.6); } catch (e) { reverbNode = null; }
    reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.22;
    masterGain.connect(compressorNode);
    compressorNode.connect(ctx.destination);
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    if (reverbNode && reverbGain) {
      sfxGain.connect(reverbGain);
      reverbGain.connect(reverbNode);
      reverbNode.connect(masterGain);
    }
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
    // S1.4-2: iOS AudioContext 'interrupted' 状态也需尝试 resume
    if (c.state !== 'running' && typeof c.resume === 'function') {
      try {
        var p = c.resume();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (e) {}
    }
  }

  var _randBuf = new Uint32Array(1);
  function _rand(){ // uniform [-1, 1); crypto-only, no Math.random
    var c = (typeof crypto !== 'undefined' && crypto &&
             typeof crypto.getRandomValues === 'function') ? crypto : null;
    if (!c) return 0;
    c.getRandomValues(_randBuf);
    return (_randBuf[0] / 0x80000000) - 1;
  }

  function _makeIR(c, seconds, decay) {
    var rate = c.sampleRate || 44100;
    var len = Math.max(1, Math.floor(rate * seconds));
    var buf = c.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        var t = i / len;
        d[i] = _rand() * Math.pow(1 - t, decay);
      }
    }
    return buf;
  }

  function noise(opts) {
    var c = ensureCtx();
    if (!c) return false;
    var o = opts || {};
    var dur = Number.isFinite(o.dur) && o.dur > 0 ? o.dur : 140;
    var gainVal = Number.isFinite(o.gain) && o.gain >= 0 ? o.gain : 0.08;
    var filterType = o.filter || 'lowpass';
    var freqFrom = Number.isFinite(o.freq) && o.freq > 0 ? o.freq : 2000;
    var freqTo = Number.isFinite(o.freqTo) && o.freqTo > 0 ? o.freqTo : freqFrom;
    var delay = Number.isFinite(o.delay) && o.delay >= 0 ? o.delay : 0;
    var bus = (o.bus === 'music') ? musicGain : sfxGain;
    var now = c.currentTime + delay;
    var durSec = dur / 1000;
    var rate = c.sampleRate || 44100;
    var len = Math.max(1, Math.floor(rate * durSec));
    var buf = c.createBuffer(1, len, rate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = _rand();
    var src = c.createBufferSource();
    src.buffer = buf;
    var flt = c.createBiquadFilter();
    flt.type = filterType;
    flt.frequency.setValueAtTime(freqFrom, now);
    if (freqTo !== freqFrom) {
      flt.frequency.exponentialRampToValueAtTime(Math.max(40, freqTo), now + durSec);
    }
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gainVal, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durSec);
    src.connect(flt);
    flt.connect(g);
    g.connect(bus);
    src.onended = function () {
      try { src.disconnect(); } catch (e) {}
      try { flt.disconnect(); } catch (e) {}
      try { g.disconnect(); } catch (e) {}
    };
    try { src.start(now); src.stop(now + durSec + 0.02); return true; } catch (e) { return false; }
  }

  function fm(opts) {
    var c = ensureCtx();
    if (!c) return false;
    var o = opts || {};
    var carrierFreq = Number.isFinite(o.freq) && o.freq > 0 ? o.freq : 440;
    var modRatio = Number.isFinite(o.ratio) ? o.ratio : 2;
    var modDepth = Number.isFinite(o.depth) ? o.depth : carrierFreq * 1.5;
    var dur = Number.isFinite(o.dur) && o.dur > 0 ? o.dur : 220;
    var gainVal = Number.isFinite(o.gain) && o.gain >= 0 ? o.gain : 0.10;
    var delay = Number.isFinite(o.delay) && o.delay >= 0 ? o.delay : 0;
    var bus = (o.bus === 'music') ? musicGain : sfxGain;
    var now = c.currentTime + delay;
    var durSec = dur / 1000;
    var mod = c.createOscillator();
    mod.type = 'sine';
    mod.frequency.value = carrierFreq * modRatio;
    var modGain = c.createGain();
    modGain.gain.value = modDepth;
    mod.connect(modGain);
    var car = c.createOscillator();
    car.type = o.type || 'sine';
    car.frequency.value = carrierFreq;
    modGain.connect(car.frequency);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gainVal, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durSec);
    car.connect(g);
    g.connect(bus);
    mod.onended = function () {
      try { mod.disconnect(); modGain.disconnect(); car.disconnect(); g.disconnect(); } catch (e) {}
    };
    try { mod.start(now); car.start(now); mod.stop(now + durSec + 0.02); car.stop(now + durSec + 0.02); return true; } catch (e) { return false; }
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

  // Commercial-grade presets. All rely on tone/noise/fm primitives.
  // KISS: no external assets, no randomness in volume, deterministic.
  var PRESETS = {
    'ui-tap': function () {
      tone({ freq: 1240, freqTo: 880, dur: 55, type: 'sine', gain: 0.06 });
    },
    'spin-start': function () {
      noise({ freq: 2400, freqTo: 380, dur: 480, gain: 0.10, filter: 'lowpass' });
      tone({ freq: 220, freqTo: 320, dur: 400, type: 'sine', gain: 0.05, delay: 0.02 });
    },
    'spin-stop': function () {
      tone({ freq: 1320, dur: 45, type: 'sine', gain: 0.09 });
      tone({ freq: 1760, dur: 60, type: 'triangle', gain: 0.06, delay: 0.04 });
    },
    'tumble': function () {
      noise({ freq: 800, freqTo: 1800, dur: 110, gain: 0.08, filter: 'bandpass' });
      tone({ freq: 180, freqTo: 120, dur: 90, type: 'sine', gain: 0.05 });
    },
    'tumble-land': function () {
      noise({ freq: 1600, freqTo: 600, dur: 70, gain: 0.10, filter: 'highpass' });
      tone({ freq: 140, freqTo: 90, dur: 90, type: 'sine', gain: 0.06, delay: 0.01 });
    },
    'win-normal': function () {
      // Marimba-like 3-note phrase: C5-E5-G5 with quick decay
      [523.25, 659.25, 783.99].forEach(function (f, i) {
        tone({ freq: f, dur: 220, type: 'triangle', gain: 0.10, delay: i * 0.10 });
        tone({ freq: f * 2, dur: 160, type: 'sine', gain: 0.04, delay: i * 0.10 });
      });
    },
    'big-win': function () {
      // 5-note ascending + pad sweep
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function (f, i) {
        tone({ freq: f, dur: 260, type: 'triangle', gain: 0.11, delay: i * 0.085 });
        tone({ freq: f * 2, dur: 180, type: 'sine', gain: 0.04, delay: i * 0.085 });
      });
      tone({ freq: 261.63, dur: 900, type: 'sine', gain: 0.05, delay: 0.05 });
      tone({ freq: 329.63, dur: 900, type: 'sine', gain: 0.05, delay: 0.05 });
    },
    'mega-win': function () {
      [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach(function (f, i) {
        tone({ freq: f, dur: 280, type: 'triangle', gain: 0.11, delay: i * 0.075 });
        tone({ freq: f * 2, dur: 200, type: 'sine', gain: 0.045, delay: i * 0.075 });
      });
      fm({ freq: 523.25, ratio: 1.5, depth: 400, dur: 1200, gain: 0.05, delay: 0.10 });
    },
    'super-win': function () {
      [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1318.51].forEach(function (f, i) {
        tone({ freq: f, dur: 300, type: 'triangle', gain: 0.12, delay: i * 0.065 });
        tone({ freq: f * 2, dur: 220, type: 'sine', gain: 0.05, delay: i * 0.065 });
      });
      fm({ freq: 261.63, ratio: 2, depth: 600, dur: 1600, gain: 0.06, delay: 0.15 });
      noise({ freq: 4000, freqTo: 600, dur: 900, gain: 0.04, filter: 'lowpass', delay: 0.20 });
    },
    'epic-win': function () {
      [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00].forEach(function (f, i) {
        tone({ freq: f, dur: 320, type: 'triangle', gain: 0.12, delay: i * 0.06 });
        tone({ freq: f * 2, dur: 240, type: 'sine', gain: 0.05, delay: i * 0.06 });
      });
      fm({ freq: 261.63, ratio: 1.5, depth: 700, dur: 2000, gain: 0.06, delay: 0.10 });
      noise({ freq: 5000, freqTo: 400, dur: 1400, gain: 0.05, filter: 'lowpass', delay: 0.30 });
      tone({ freq: 2093.00, dur: 1400, type: 'sine', gain: 0.06, delay: 0.55 });
    },
    'ultra-win': function () {
      [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 1046.50, 1174.66, 1318.51].forEach(function (f, i) {
        tone({ freq: f, dur: 340, type: 'triangle', gain: 0.12, delay: i * 0.055 });
        tone({ freq: f * 2, dur: 260, type: 'sine', gain: 0.05, delay: i * 0.055 });
      });
      fm({ freq: 261.63, ratio: 2, depth: 900, dur: 2400, gain: 0.07, delay: 0.10 });
      fm({ freq: 392.00, ratio: 1.5, depth: 700, dur: 2400, gain: 0.05, delay: 0.20 });
      noise({ freq: 6000, freqTo: 300, dur: 1800, gain: 0.05, filter: 'lowpass', delay: 0.40 });
      tone({ freq: 2637.02, dur: 1600, type: 'sine', gain: 0.06, delay: 0.60 });
    },
    'bonus': function () {
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function (f, i) {
        tone({ freq: f, dur: 280, type: 'triangle', gain: 0.10, delay: i * 0.10 });
      });
      fm({ freq: 261.63, ratio: 1.5, depth: 500, dur: 1800, gain: 0.05, delay: 0.10 });
      noise({ freq: 5000, freqTo: 500, dur: 1200, gain: 0.045, filter: 'lowpass', delay: 0.20 });
    },
    'multiplier': function () {
      fm({ freq: 1100, ratio: 3, depth: 800, dur: 130, gain: 0.06 });
    },
    'bomb-explode': function (opts) {
      var intensity = Math.min(100, Math.max(2, (opts && opts.value) || 2));
      var dur = 260 + intensity * 1.5;
      noise({ freq: 3000, freqTo: 100, dur: dur, gain: 0.14, filter: 'lowpass' });
      tone({ freq: 120, freqTo: 45, dur: dur, type: 'sine', gain: 0.13 });
      tone({ freq: 60, freqTo: 30, dur: Math.max(160, dur * 0.7), type: 'sine', gain: 0.10, delay: 0.04 });
    },
    'fs-enter': function () {
      [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 1046.50].forEach(function (f, i) {
        tone({ freq: f, dur: 320, type: 'triangle', gain: 0.10, delay: i * 0.10 });
      });
      fm({ freq: 261.63, ratio: 2, depth: 600, dur: 2200, gain: 0.055, delay: 0.15 });
    },
    'anticipation': function () {
      tone({ freq: 220, freqTo: 165, dur: 140, type: 'sine', gain: 0.09 });
      tone({ freq: 220, freqTo: 165, dur: 140, type: 'sine', gain: 0.09, delay: 0.32 });
      tone({ freq: 165, freqTo: 110, dur: 180, type: 'sine', gain: 0.07, delay: 0.66 });
    },
    'fs-loop': function () {
      [783.99, 987.77].forEach(function (f, i) {
        tone({ freq: f, dur: 180, type: 'sine', gain: 0.05, delay: i * 0.10 });
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

/* P3e-2/3/4: register with ApexAudioLifecycle */
if (typeof window !== 'undefined' && window.ApexAudioLifecycle){
  try {
    window.ApexAudioLifecycle.register('synth', {
      getCtx: function(){ return ctx; }
    });
  } catch (e) {}
}
})();
