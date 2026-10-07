/* Apex · Audio Manager
 * 只提供 API 与静音开关，未接入音源前全部 silent
 * 正式音源就位后只需替换 load/play 实现
 */
(function () {
  'use strict';

  var CATEGORIES = ['ui', 'spin', 'symbol', 'win', 'big-win',
                    'mega-win', 'super-win', 'bonus', 'multiplier',
                    'tumble', 'ambient'];

  function AudioManager() {
    var state = {
      enabled: true,
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 0.9,
      currentBgm: null,
      loaded: {}
    };

    function isEnabled() { return state.enabled === true; }

    function setEnabled(v) {
      state.enabled = !!v;
      if (!state.enabled && state.currentBgm) {
        stop(state.currentBgm);
      }
    }

    function setVolume(kind, v) {
      var n = Math.max(0, Math.min(1, Number(v) || 0));
      if (kind === 'master') state.masterVolume = n;
      else if (kind === 'music') state.musicVolume = n;
      else if (kind === 'sfx') state.sfxVolume = n;
    }

    function preload(name, url) {
      if (!name || !url) return;
      state.loaded[name] = { url: url, ready: false };
    }

    function play(name, opts) {
      if (!isEnabled()) return null;
      var entry = state.loaded[name];
      if (!entry) return null;
      // 音源接入后此处播放；当前静默
      return { name: name, category: classify(name), opts: opts || {} };
    }

    function stop(handle) { void handle; }

    function classify(name) {
      var n = String(name || '');
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

    return {
      CATEGORIES: CATEGORIES,
      isEnabled: isEnabled,
      setEnabled: setEnabled,
      setVolume: setVolume,
      preload: preload,
      play: play,
      stop: stop,
      _state: state
    };
  }

  window.ApexAudio = { create: AudioManager };
})();
