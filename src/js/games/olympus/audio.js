/* Gates of Olympus · 音效（Web Audio 纯合成） */
(function () {
  'use strict';

  var ctx = null;
  var masterGain = null;
  var muted = false;
  var unlocked = false;

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.28;
      masterGain.connect(ctx.destination);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  // iOS Safari：必须在用户手势内 resume
  function unlock() {
    var c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') {
      c.resume().catch(function () {});
    }
    unlocked = true;
  }

  function tone(freq, dur, type, vol, delay) {
    if (muted) return;
    var c = ensureCtx();
    if (!c || c.state !== 'running') return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.35, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  var SFX = {
    click: function () { tone(880, 0.06, 'square', 0.18, 0); },
    spinStart: function () {
      tone(220, 0.08, 'sawtooth', 0.2, 0);
      tone(330, 0.12, 'sawtooth', 0.18, 0.06);
    },
    reelStop: function (i) {
      tone(440 + (i || 0) * 40, 0.07, 'triangle', 0.28, 0);
    },
    land: function () { tone(660, 0.05, 'triangle', 0.22, 0); },
    win: function (level) {
      var base = 660;
      var n = Math.min(5, 1 + (level || 0));
      for (var i = 0; i < n; i++) {
        tone(base * (1 + i * 0.18), 0.14, 'sine', 0.32, i * 0.07);
      }
    },
    bigWin: function () {
      var notes = [523, 659, 784, 1047, 1319];
      for (var i = 0; i < notes.length; i++) {
        tone(notes[i], 0.28, 'sine', 0.42, i * 0.13);
        tone(notes[i] * 2, 0.22, 'triangle', 0.16, i * 0.13);
      }
    },
    scatter: function () {
      tone(1320, 0.1, 'sine', 0.3, 0);
      tone(1760, 0.14, 'sine', 0.3, 0.08);
    },
    error: function () { tone(180, 0.18, 'sawtooth', 0.28, 0); }
  };

  function setMuted(v) { muted = !!v; }
  function isMuted() { return muted; }
  function isUnlocked() { return unlocked; }

  window.olympusAudio = {
    unlock: unlock,
    play: function (name, arg) {
      if (muted) return;
      var fn = SFX[name];
      if (fn) fn(arg);
    },
    setMuted: setMuted,
    isMuted: isMuted,
    isUnlocked: isUnlocked
  };
})();
