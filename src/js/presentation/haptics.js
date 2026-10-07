/* Apex · Haptics Manager
 * 尊重 prefers-reduced-motion 与用户开关
 */
(function () {
  'use strict';

  var PATTERNS = Object.freeze({
    tap:      8,
    spin:     12,
    win:      [12, 20, 12],
    big:      [20, 25, 30],
    mega:     [25, 30, 40],
    super:    [30, 40, 30, 40],
    bonus:    [15, 30, 15, 40],
    tumble:   [8, 12, 8]
  });

  function HapticsManager() {
    var enabled = true;

    function available() {
      return typeof navigator !== 'undefined' &&
             typeof navigator.vibrate === 'function';
    }

    function reduced() {
      return typeof window !== 'undefined' &&
             window.matchMedia &&
             window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function setEnabled(v) { enabled = !!v; }
    function isEnabled() { return enabled; }

    function pulse(kind) {
      if (!enabled || !available() || reduced()) return false;
      var pattern = PATTERNS[kind];
      if (!pattern) return false;
      try { navigator.vibrate(pattern); return true; }
      catch (e) { return false; }
    }

    function winPulse(multiplier) {
      if (multiplier >= 50) return pulse('super');
      if (multiplier >= 25) return pulse('mega');
      if (multiplier >= 10) return pulse('big');
      return pulse('win');
    }

    return {
      PATTERNS: PATTERNS,
      available: available,
      isEnabled: isEnabled,
      setEnabled: setEnabled,
      pulse: pulse,
      winPulse: winPulse
    };
  }

  window.ApexHaptics = { create: HapticsManager };
})();
