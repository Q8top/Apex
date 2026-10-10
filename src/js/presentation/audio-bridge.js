/* Apex · Audio Bridge（C-2 统一事件门面）
 * 职责：事件名 -> synth preset、节流、并发上限、自动播放降级、
 *       页面隐藏暂停、reduced-motion 策略。
 * 不改 audio.js / audio-synth.js 的语义，仅在它们之上加一层。
 */
(function () {
  'use strict';

  var ALIASES = Object.freeze({
    'ui.tap':      'ui-tap',
    'spin.start':  'spin-start',
    'spin.stop':   'spin-stop',
    'tumble':      'tumble',
    'win.normal':  'win-normal',
    'win.big':     'big-win',
    'win.mega':    'mega-win',
    'win.super':   'super-win',
    'win.epic':    'epic-win',
    'win.ultra':   'ultra-win',
    'bonus':       'bonus',
    'multiplier':  'multiplier'
  });

  var THROTTLE = Object.freeze({
    'ui-tap': 40, 'spin-start': 100, 'spin-stop': 100,
    'tumble': 60, 'multiplier': 80, 'win-normal': 150,
    'big-win': 300, 'mega-win': 300, 'super-win': 300,
    'epic-win': 300, 'ultra-win': 300, 'bonus': 300
  });

  var REDUCED_BLOCKED = Object.freeze([
    'spin-start', 'spin-stop', 'tumble', 'multiplier'
  ]);

  var VOICE_WINDOW_MS = 150;
  var MAX_VOICES_IN_WINDOW = 6;

  function AudioBridge(opts) {
    opts = opts || {};
    var enabled = opts.enabled !== false;
    var unlocked = false;
    var reducedMotion = false;
    var voiceTimes = [];
    var lastAt = {};

    var now = (typeof performance !== 'undefined' && performance.now)
      ? function () { return performance.now(); }
      : function () { return Date.now(); };

    function getSynth() { return window.ApexAudioSynth; }

    function supportsAudio() {
      var s = getSynth();
      return !!(s && typeof s.play === 'function');
    }

    function resolveName(name) {
      if (!name) return null;
      var n = String(name);
      return ALIASES[n] ? ALIASES[n] : n;
    }

    function shouldThrottle(preset) {
      var gap = THROTTLE[preset] || 0;
      if (gap <= 0) return false;
      var t = now();
      var last = lastAt[preset];
      if (last !== undefined && t - last < gap) return true;
      lastAt[preset] = t;
      return false;
    }

    function tooManyVoices() {
      var t = now();
      var cutoff = t - VOICE_WINDOW_MS;
      while (voiceTimes.length && voiceTimes[0] < cutoff) voiceTimes.shift();
      if (voiceTimes.length >= MAX_VOICES_IN_WINDOW) return true;
      voiceTimes.push(t);
      return false;
    }

    function readReducedMotion() {
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches === true;
        }
      } catch (e) {}
      return false;
    }

    function isBlockedByReduced(preset) {
      if (!reducedMotion) return false;
      for (var i = 0; i < REDUCED_BLOCKED.length; i++) {
        if (REDUCED_BLOCKED[i] === preset) return true;
      }
      return false;
    }

    function tryUnlock() {
      if (unlocked) return true;
      var s = getSynth();
      if (!s) return false;
      try {
        if (typeof s.resume === 'function') s.resume();
        if (typeof s.isRunning === 'function') unlocked = s.isRunning();
        else unlocked = true;  // 无 isRunning 时保守视为已解锁
      } catch (e) { unlocked = false; }
      return unlocked;
    }

    function play(name, playOpts) {
      if (!enabled) return false;
      var preset = resolveName(name);
      if (!preset) return false;
      if (isBlockedByReduced(preset)) return false;
      if (shouldThrottle(preset)) return false;
      if (tooManyVoices()) return false;

      var s = getSynth();
      if (!s || typeof s.play !== 'function') return false;

      if (!unlocked) tryUnlock();
      try {
        return s.play(preset, playOpts) === true;
      } catch (e) {
        return false;
      }
    }

    function installGestureUnlock() {
      if (typeof window === 'undefined' || !window.addEventListener) return;
      // P1-5: do NOT use { once: true }.
      // iOS Safari may reject the first resume() if AudioContext was
      // constructed outside the gesture callback; isRunning() will
      // then report false. Retry on every gesture until it reports
      // true, then remove all listeners manually.
      var fn = function () {
        if (tryUnlock()) {
          try { window.removeEventListener('pointerdown', fn, true); } catch (e) {}
          try { window.removeEventListener('keydown', fn, true); } catch (e) {}
          try { window.removeEventListener('touchstart', fn, true); } catch (e) {}
        }
      };
      try {
        window.addEventListener('pointerdown', fn, { capture: true, passive: true });
        window.addEventListener('keydown', fn, { capture: true });
        window.addEventListener('touchstart', fn, { capture: true, passive: true });
      } catch (e) {}
    }

    function installVisibilityHandler() {
      if (typeof document === 'undefined' || !document.addEventListener) return;
      try {
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            var s = getSynth();
            if (s && typeof s.suspend === 'function') {
              try { s.suspend(); } catch (e) {}
            }
          }
        });
      } catch (e) {}
    }

    function installReducedMotionHandler() {
      reducedMotion = readReducedMotion();
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
          var cb = function (e) { reducedMotion = !!e.matches; };
          if (mq.addEventListener) mq.addEventListener('change', cb);
          else if (mq.addListener) mq.addListener(cb);
        }
      } catch (e) {}
    }

    function setEnabled(v) { enabled = !!v; return enabled; }
    function isEnabled() { return enabled; }

    function getState() {
      return Object.freeze({
        enabled: enabled,
        unlocked: unlocked,
        reducedMotion: reducedMotion,
        supportsAudio: supportsAudio()
      });
    }

    installReducedMotionHandler();
    installGestureUnlock();
    installVisibilityHandler();

    return Object.freeze({
      play: play,
      unlock: tryUnlock,
      isUnlocked: function () { return unlocked; },
      setEnabled: setEnabled,
      isEnabled: isEnabled,
      getState: getState
    });
  }

  window.ApexAudioBridge = Object.freeze({
    create: AudioBridge,
    ALIASES: ALIASES,
    THROTTLE: THROTTLE,
    REDUCED_BLOCKED: REDUCED_BLOCKED
  });
})();
