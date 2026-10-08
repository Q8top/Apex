/* Apex · Haptics Manager
 * 尊重 prefers-reduced-motion 与用户开关
 *
 * 约定（与 audio / audio-synth 对齐）：
 *   - setEnabled 返回新值（链式调用友好）
 *   - 新增 hasSupport() 别名 available()（命名风格统一）
 *   - 新增 getState() 返回冻结快照
 *   - pulse 同 kind 节流，避免快速 tumble 叠震
 *   - 导出对象冻结
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

  // 同 kind 最小触发间隔（ms），防快速 tumble 叠震
  var MIN_INTERVAL = Object.freeze({
    tap:      40,
    spin:     120,
    win:      200,
    big:      200,
    mega:     200,
    super:    200,
    bonus:    200,
    tumble:   60
  });

  function HapticsManager(opts) {
    opts = opts || {};
    var enabled = opts.enabled !== false;
    var lastAt = {};
    var now = (typeof performance !== 'undefined' && performance.now)
      ? function () { return performance.now(); }
      : function () { return Date.now(); };

    function available() {
      return typeof navigator !== 'undefined' &&
             typeof navigator.vibrate === 'function';
    }

    function reduced() {
      return typeof window !== 'undefined' &&
             window.matchMedia &&
             window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function setEnabled(v) {
      enabled = !!v;
      return enabled;
    }

    function isEnabled() { return enabled; }

    function shouldThrottle(kind) {
      var gap = MIN_INTERVAL[kind] || 0;
      if (gap <= 0) return false;
      var t = now();
      var last = lastAt[kind];
      if (last !== undefined && t - last < gap) return true;
      lastAt[kind] = t;
      return false;
    }

    function pulse(kind) {
      if (!enabled || !available() || reduced()) return false;
      var pattern = PATTERNS[kind];
      if (!pattern) return false;
      if (shouldThrottle(kind)) return false;
      try { navigator.vibrate(pattern); return true; }
      catch (e) { return false; }
    }

    function winPulse(multiplier) {
      var m = Number(multiplier);
      if (!Number.isFinite(m)) m = 0;
      if (m >= 50) return pulse('super');
      if (m >= 25) return pulse('mega');
      if (m >= 10) return pulse('big');
      return pulse('win');
    }

    function getState() {
      return Object.freeze({
        enabled: enabled,
        available: available(),
        reduced: reduced()
      });
    }

    return Object.freeze({
      PATTERNS: PATTERNS,
      MIN_INTERVAL: MIN_INTERVAL,
      available: available,
      hasSupport: available,
      isEnabled: isEnabled,
      setEnabled: setEnabled,
      pulse: pulse,
      winPulse: winPulse,
      getState: getState
    });
  }

  window.ApexHaptics = Object.freeze({ create: HapticsManager });
})();
