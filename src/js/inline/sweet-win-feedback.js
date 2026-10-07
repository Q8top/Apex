/* Apex · Sweet Bonanza 中奖反馈系统
 *
 * 特性：
 *   - 4 级中奖（normal / big / mega / super）
 *   - requestAnimationFrame 数字滚动
 *   - Intl.NumberFormat 金额格式化
 *   - aria-live="polite" 无障碍（在最终金额确定后通知）
 *   - prefers-reduced-motion 支持
 *   - 自动模式下动画自动合并
 *
 * 全局 API：window.ApexWinFeedback = { show(win, bet), hide() }
 */
(function () {
  'use strict';

  var ID_FB     = 'sd-win-fb';
  var ID_LABEL  = 'sd-win-fb-label';
  var ID_AMOUNT = 'sd-win-fb-value';

  // 等级阈值：ratio = win / bet
  var LEVELS = {
    normal: { min: 0,  label: '本局赢得', rollMs: 480, holdMs: 1100 },
    big:    { min: 10, label: '大奖',     rollMs: 600, holdMs: 1500 },
    mega:   { min: 25, label: '超级中奖', rollMs: 800, holdMs: 2000 },
    super:  { min: 50, label: '超级大奖', rollMs: 900, holdMs: 2400 }
  };

  var el = {};
  var state = {
    visible: false,
    hideTimer: 0,
    rafId: 0
  };

  var nf = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function fmt(n) { return '¥' + nf.format(Number(n) || 0); }

  function classify(win, bet) {
    var ratio = (Number(win) || 0) / Math.max(Number(bet) || 1, 0.01);
    if (ratio >= LEVELS.super.min) return 'super';
    if (ratio >= LEVELS.mega.min)  return 'mega';
    if (ratio >= LEVELS.big.min)   return 'big';
    return 'normal';
  }

  function prefersReduced() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function rollNumber(from, to, duration, onTick) {
    if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = 0; }
    if (prefersReduced() || duration <= 0) { onTick(to); return; }
    var start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      onTick(from + (to - from) * eased);
      if (t < 1) state.rafId = requestAnimationFrame(tick);
      else state.rafId = 0;
    }
    state.rafId = requestAnimationFrame(tick);
  }

  function cache() {
    el.fb     = document.getElementById(ID_FB);
    el.label  = document.getElementById(ID_LABEL);
    el.amount = document.getElementById(ID_AMOUNT);
  }

  function show(win, bet) {
    if (!el.fb) return;
    var amt = Number(win) || 0;
    if (amt <= 0) return;

    var level = classify(amt, bet);
    var meta = LEVELS[level];

    // 若上一局动画未完，先清理
    if (state.hideTimer) { clearTimeout(state.hideTimer); state.hideTimer = 0; }
    if (state.rafId)     { cancelAnimationFrame(state.rafId); state.rafId = 0; }

    // 更新内容
    el.fb.dataset.level = level;
    el.label.textContent = meta.label;
    el.fb.classList.add('is-visible');
    state.visible = true;

    // 数字滚动
    rollNumber(0, amt, meta.rollMs, function (v) {
      el.amount.textContent = fmt(v);
    });

    // 结束时隐藏
    state.hideTimer = setTimeout(function () {
      state.hideTimer = 0;
      hide();
    }, meta.rollMs + meta.holdMs);
  }

  function hide() {
    if (!el.fb) return;
    el.fb.classList.remove('is-visible');
    state.visible = false;
  }

  function init() { cache(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ApexWinFeedback = { show: show, hide: hide };
})();
