/* Apex · Audio Manager
 * 只提供 API 与静音开关，未接入音源前全部 silent
 * 正式音源就位后只需替换 load/play 实现
 *
 * 约定：
 *   - 所有 setter 走统一通知链，master/music/sfx 均派发给 ApexAudioSynth
 *   - _state 已废弃，改用 getState() 返回冻结快照（外部只读）
 *   - NaN / Infinity / 非数字入参在 setter 抛错或归零，不静默污染
 */
(function () {
  'use strict';

  var CATEGORIES = Object.freeze([
    'ui', 'spin', 'symbol', 'win', 'big-win',
    'mega-win', 'super-win', 'bonus', 'multiplier',
    'tumble', 'ambient'
  ]);

  function notifySynth(kind, value) {
    var s = window.ApexAudioSynth;
    if (!s) return;
    try {
      if (kind === 'master' && typeof s.setMasterVolume === 'function') {
        s.setMasterVolume(value);
      } else if (kind === 'music' && typeof s.setMusicVolume === 'function') {
        s.setMusicVolume(value);
      } else if (kind === 'sfx' && typeof s.setSfxVolume === 'function') {
        s.setSfxVolume(value);
      } else if (kind === 'enabled' && typeof s.setEnabled === 'function') {
        s.setEnabled(value);
      }
    } catch (e) {}
  }

  function AudioManager(opts) {
    opts = opts || {};

    var state = {
      enabled: opts.enabled !== false,
      masterVolume: clamp01(opts.masterVolume, 0.8),
      musicVolume:  clamp01(opts.musicVolume,  0.6),
      sfxVolume:    clamp01(opts.sfxVolume,    0.9),
      currentBgm: null,
      loaded: {}
    };

    function clamp01(v, fallback) {
      if (v === undefined) return fallback;
      var n = Number(v);
      if (!Number.isFinite(n)) throw new Error('audio: volume non-finite');
      return Math.max(0, Math.min(1, n));
    }

    function isEnabled() { return state.enabled === true; }

    function setEnabled(v) {
      var next = !!v;
      if (next === state.enabled) return state.enabled;
      state.enabled = next;
      if (!next && state.currentBgm) stop(state.currentBgm);
      notifySynth('enabled', next);
      return state.enabled;
    }

    function setVolume(kind, v) {
      var n = clamp01(v, undefined);
      if (kind === 'master') {
        state.masterVolume = n;
        notifySynth('master', n);
      } else if (kind === 'music') {
        state.musicVolume = n;
        notifySynth('music', n);
      } else if (kind === 'sfx') {
        state.sfxVolume = n;
        notifySynth('sfx', n);
      } else {
        throw new Error('audio: 未知音量类型 ' + kind);
      }
      return n;
    }

    function preload(name, url) {
      if (!name || !url) return;
      state.loaded[name] = { url: url, ready: false };
    }

    function play(name, opts) {
      if (!isEnabled()) return null;
      var handle = { name: name, category: classify(name), opts: opts || {} };
      if (window.ApexAudioSynth && typeof window.ApexAudioSynth.play === 'function') {
        try { handle.played = window.ApexAudioSynth.play(name, opts); } catch (e) {}
      }
      return handle;
    }

    function stop(handle) { void handle; }

    function classify(name) {
      var n = String(name == null ? '' : name);
      if (n.indexOf('bonus') === 0) return 'bonus';
      if (n.indexOf('big') === 0) return 'big-win';
      if (n.indexOf('mega') === 0) return 'mega-win';
      if (n.indexOf('super') === 0) return 'super-win';
      if (n.indexOf('win') === 0) return 'win';
      if (n.indexOf('spin') === 0) return 'spin';
      if (n.indexOf('tumble') === 0) return 'tumble';
      if (n.indexOf('ui') === 0) return 'ui';
      return 'ui';
    }

    // 只读快照：外部只能读，改不了内部 state
    function getState() {
      return Object.freeze({
        enabled: state.enabled,
        masterVolume: state.masterVolume,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        currentBgm: state.currentBgm,
        loaded: Object.freeze(Object.assign({}, state.loaded))
      });
    }

    return Object.freeze({
      CATEGORIES: CATEGORIES,
      isEnabled: isEnabled,
      setEnabled: setEnabled,
      setVolume: setVolume,
      preload: preload,
      play: play,
      stop: stop,
      classify: classify,
      getState: getState
    });
  }

  window.ApexAudio = Object.freeze({ create: AudioManager });
})();
