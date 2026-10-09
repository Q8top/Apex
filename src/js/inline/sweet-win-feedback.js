/* Apex · 中奖反馈系统
 *
 * 特性：
 *   - 4 级中奖（normal / big / mega / super）
 *   - requestAnimationFrame 数字滚动
 *   - Intl.NumberFormat 金额格式化
 *   - aria-live="polite" 无障碍（在最终金额确定后通知）
 *   - prefers-reduced-motion 支持
 *   - 自动模式下动画自动合并
 *
 * 全局 API：window.ApexWinFeedback = { show, hide, isShowing, refresh }
 *
 * 不变量：
 *   - LEVELS / 导出对象冻结
 *   - show 对 win/bet 做 Number.isFinite 校验，非法输入不显示
 *   - hide() 清理 hideTimer 和 rafId，防止状态泄漏
 *   - rollNumber 的 onTick 第二参 done 表示"最后一次"，不靠浮点相等
 *   - cache() 可重复调用（refresh 触发），支持 DOM 重建
 *
 * TODO(P2)：LEVELS.label 与 fmt 的 ¥ 硬编码，待 UI 层统一接入
 *           ApexI18n / rec.currency 后动态化。
 */
(function () {
  'use strict';

  var ID_FB     = 'sd-win-fb';
  var ID_LABEL  = 'sd-win-fb-label';
  var ID_AMOUNT = 'sd-win-fb-value';

  // 等级阈值：ratio = win / bet
  var LEVELS = Object.freeze({
    normal: Object.freeze({ min: 0,   label: '本局赢得', rollMs: 480, holdMs: 1100 }),
    big:    Object.freeze({ min: 5,   label: '大奖',     rollMs: 600, holdMs: 1500 }),
    mega:   Object.freeze({ min: 20,  label: '超级中奖', rollMs: 800, holdMs: 2000 }),
    epic:   Object.freeze({ min: 50,  label: '史诗大奖', rollMs: 900, holdMs: 2400 }),
    ultra:  Object.freeze({ min: 100, label: '至尊大奖', rollMs: 1100, holdMs: 3000 })
  });

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

  function safeNum(v, fallback) {
    var n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function fmt(n) {
    var x = Number(n);
    if (!Number.isFinite(x)) x = 0;
    return '¥' + nf.format(x);
  }

  function classify(win, bet) {
    var w = safeNum(win, 0);
    var b = safeNum(bet, 0);
    if (b <= 0) b = 1;                          // 防御：bet 必须正数，否则按 1 计
    var ratio = w / b;
    if (ratio >= LEVELS.ultra.min) return 'ultra';
    if (ratio >= LEVELS.epic.min)  return 'epic';
    if (ratio >= LEVELS.mega.min)  return 'mega';
    if (ratio >= LEVELS.big.min)   return 'big';
    return 'normal';
  }

  function prefersReduced() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // onTick(value, isLast)
  function rollNumber(from, to, duration, onTick) {
    if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = 0; }
    if (prefersReduced() || !(duration > 0)) { onTick(to, true); return; }
    var start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      var last = t >= 1;
      onTick(from + (to - from) * eased, last);
      if (!last) state.rafId = requestAnimationFrame(tick);
      else state.rafId = 0;
    }
    state.rafId = requestAnimationFrame(tick);
  }

  function cache() {
    el.fb     = document.getElementById(ID_FB);
    el.label  = document.getElementById(ID_LABEL);
    el.amount = document.getElementById(ID_AMOUNT);
  }

  function clearPending() {
    if (state.hideTimer) { clearTimeout(state.hideTimer); state.hideTimer = 0; }
    if (state.rafId)     { cancelAnimationFrame(state.rafId); state.rafId = 0; }
  }

  function show(win, bet) {
    if (!el.fb) return false;
    var amt = Number(win);
    if (!Number.isFinite(amt) || amt <= 0) return false;

    var level = classify(amt, bet);
    var meta = LEVELS[level];

    clearPending();

    el.fb.dataset.level = level;
    el.label.textContent = meta.label;
    el.fb.classList.add('is-visible');
    state.visible = true;

    var liveRegion = el.fb.parentElement;
    if (liveRegion) liveRegion.setAttribute('aria-live', 'off');

    rollNumber(0, amt, meta.rollMs, function (v, last) {
      el.amount.textContent = fmt(v);
      if (last && liveRegion) liveRegion.setAttribute('aria-live', 'polite');
    });

    state.hideTimer = setTimeout(function () {
      state.hideTimer = 0;
      hide();
    }, meta.rollMs + meta.holdMs);

    return true;
  }

  function hide() {
    clearPending();
    if (!el.fb) return;
    el.fb.classList.remove('is-visible');
    state.visible = false;
  }

  function isShowing() { return state.visible === true; }

  function init() { cache(); }

  // DOM 重建后调用，重新抓取元素引用
  function refresh() { cache(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ApexWinFeedback = Object.freeze({
    show: show,
    hide: hide,
    isShowing: isShowing,
    refresh: refresh,
    LEVELS: LEVELS
  });
})();
