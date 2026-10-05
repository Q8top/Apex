/* Apex · 音效引擎（Web Audio API 合成，无外部文件） */
(function () {
  'use strict';

  var AC = null;
  var masterGain = null;
  var enabled = true;
  var unlocked = false;

  var _rb = new Uint32Array(1024), _rp = _rb.length;
  function randSigned() {
    if (_rp >= _rb.length) { (window.crypto || window.msCrypto).getRandomValues(_rb); _rp = 0; }
    return (_rb[_rp++] / 2147483648) - 1;   /* 范围 -1 ~ +1 */
  }

  function ctx() {
    if (!AC) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      AC = new C();
      masterGain = AC.createGain();
      masterGain.gain.value = 0.28;
      masterGain.connect(AC.destination);
    }
    return AC;
  }

  /* 用户手势解锁（iOS 必需） */
  function unlock() {
    if (unlocked) return;
    var c = ctx(); if (!c) return;
    if (c.state === 'suspended') c.resume();
    /* 播放一个静音 tick 解锁 */
    try {
      var o = c.createOscillator(), g = c.createGain();
      g.gain.value = 0.0001;
      o.connect(g); g.connect(masterGain);
      o.start(); o.stop(c.currentTime + 0.001);
    } catch (e) {}
    unlocked = true;
  }

  /* 基础音：频率 f0 → f1，时长 dur，波形 type，音量 gain */
  function tone(f0, f1, dur, type, gain) {
    if (!enabled) return;
    var c = ctx(); if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    var t0 = c.currentTime;
    o.frequency.setValueAtTime(f0, t0);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.5, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(masterGain);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  /* 白噪声脉冲（做"咔"声） */
  function noise(dur, gain) {
    if (!enabled) return;
    var c = ctx(); if (!c) return;
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var ch = buf.getChannelData(0);
    for (var i = 0; i < len; i++) ch[i] = randSigned() * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var g = c.createGain(); g.gain.value = gain || 0.4;
    var f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1200;
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start();
  }

  /* 和弦（多个 tone 同时） */
  function chord(freqs, dur, gain) {
    for (var i = 0; i < freqs.length; i++) {
      tone(freqs[i], freqs[i], dur, 'triangle', (gain || 0.35) / freqs.length);
    }
  }

  /* ============ 公开音效 ============ */

  var Sounds = {
    click:    function () { tone(900, 600, 0.05, 'square', 0.15); },
    spin:     function () { tone(180, 720, 0.35, 'sawtooth', 0.25); },
    land:     function () { noise(0.08, 0.35); },
    drop:     function () { tone(220, 140, 0.12, 'sine', 0.25); },
    ball:     function () { tone(600, 1400, 0.4, 'triangle', 0.35); },
    fsTrigger:function () { chord([523, 659, 784, 1046], 0.6, 0.5); },
    scatters: function () { tone(880, 1320, 0.25, 'triangle', 0.3); },

    /* 连锁 N 次：音调越高 */
    chain:    function (n) {
      var base = 440;
      var f = base * Math.pow(1.12, Math.max(0, Math.min(n, 10) - 1));
      tone(f, f * 1.3, 0.28, 'triangle', 0.35);
    },

    /* 中奖金额分级 */
    win:      function (amount, bet) {
      var r = amount / Math.max(1, bet);
      if (r >= 50)      { chord([523, 659, 784, 1046, 1318], 0.9, 0.55); }
      else if (r >= 10) { chord([523, 659, 784], 0.6, 0.45); }
      else if (r >= 3)  { chord([523, 659], 0.4, 0.35); }
      else              { tone(880, 1100, 0.15, 'sine', 0.3); }
    },

    /* Free Spins 内每转 */
    fsSpin:   function () { tone(660, 990, 0.3, 'triangle', 0.28); },
    fsEnd:    function () { chord([784, 988, 1175], 0.7, 0.5); },

    /* 余额不足 / 错误 */
    error:    function () { tone(240, 140, 0.25, 'square', 0.28); }
  };

  window.ApexAudio = {
    sounds: Sounds,
    play: function (name) {
      if (!enabled) return;
      var s = Sounds[name];
      if (s) s.apply(null, Array.prototype.slice.call(arguments, 1));
    },
    unlock: unlock,
    setEnabled: function (v) { enabled = !!v; },
    isEnabled: function () { return enabled; }
  };

  /* 首次任意指针 / 键盘事件 → 解锁 */
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function once() {
      unlock();
      ['pointerdown', 'touchstart', 'keydown'].forEach(function (e2) {
        document.removeEventListener(e2, once);
      });
    }, { once: false });
  });
})();
