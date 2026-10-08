/* Apex · Sweet Bonanza 模式选择弹窗
 *
 * 不变量：
 *   - 导出对象冻结
 *   - 焦点陷阱：Tab / Shift+Tab 时若 activeElement 跑出 modal 则强制拉回
 *   - open 时保存的 lastFocused 只在非 body 时生效
 *   - open 的 40ms focus 定时器在 close 后自我作废
 *   - mode 值走白名单（demo / real），非法值按 demo 处理
 *
 * TODO(P2-1)：MARKUP 硬编码中文，待 UI 层接入 ApexI18n
 *             (game.demo / game.title / btn.spin 等已有键)
 * TODO(P2-2)：body 锁用 class（sweet-modal-locked）而非 ApexSheetLock，
 *             机制与三份 sheet 不统一。改 CSS 风险大，暂保留。
 */
(function () {
  'use strict';

  var ROOT_ID = 'apex-sweet-mode-modal';
  var MODE_WHITELIST = Object.freeze(['demo', 'real']);
  var state = { isOpen: false, lastFocused: null, closeTimer: 0, focusTimer: 0 };

  var SVG_DEMO = ''
    + '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">'
    +   '<defs>'
    +     '<linearGradient id="swDemoG" x1="0" y1="0" x2="1" y2="1">'
    +       '<stop offset="0" stop-color="#ff7ab8"/>'
    +       '<stop offset="1" stop-color="#ff4fa3"/>'
    +     '</linearGradient>'
    +   '</defs>'
    +   '<circle cx="12" cy="12" r="9.5" fill="url(#swDemoG)"/>'
    +   '<path d="M10 8.6 L16.2 12 L10 15.4 Z" fill="#fff"/>'
    + '</svg>';

  var SVG_REAL = ''
    + '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">'
    +   '<defs>'
    +     '<linearGradient id="swRealG" x1="0" y1="0" x2="1" y2="0">'
    +       '<stop offset="0" stop-color="#e6c781"/>'
    +       '<stop offset="1" stop-color="#d9b45b"/>'
    +     '</linearGradient>'
    +   '</defs>'
    +   '<circle cx="12" cy="12" r="9.5" fill="#111111"/>'
    +   '<path d="M8 12 L14.5 12" stroke="url(#swRealG)" stroke-width="1.8" stroke-linecap="round" fill="none"/>'
    +   '<path d="M11.2 8.8 L14.6 12 L11.2 15.2" stroke="url(#swRealG)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    + '</svg>';

  var MARKUP = ''
    + '<div class="sweet-modal-backdrop" data-close="1"></div>'
    + '<div class="sweet-modal-panel" role="dialog" aria-modal="true" aria-labelledby="apex-sweet-modal-title">'
    +   '<button type="button" class="sweet-modal-close" aria-label="关闭" data-close="1"><i class="ri-close-line" aria-hidden="true"></i></button>'
    +   '<header class="sweet-modal-header">'
    +     '<div class="sweet-modal-cover"><img src="/assets/games/sweet.webp" alt="" draggable="false"></div>'
    +     '<p class="sweet-modal-eyebrow">Sweet Bonanza</p>'
    +     '<h2 id="apex-sweet-modal-title" class="sweet-modal-title">糖果连连爆</h2>'
    +     '<p class="sweet-modal-subtitle">选择游戏模式</p>'
    +   '</header>'
    +   '<div class="sweet-modal-actions">'
    +     '<button type="button" class="sweet-mode sweet-mode--demo" data-mode="demo" aria-label="试玩模式">'
    +       '<span class="sweet-mode-badge sweet-mode-badge--demo">' + SVG_DEMO + '</span>'
    +       '<span class="sweet-mode-text">'
    +         '<span class="sweet-mode-title">试玩模式</span>'
    +         '<span class="sweet-mode-desc">免费体验 · 熟悉玩法</span>'
    +       '</span>'
    +       '<i class="ri-arrow-right-s-line sweet-mode-arrow" aria-hidden="true"></i>'
    +     '</button>'
    +     '<button type="button" class="sweet-mode sweet-mode--real" data-mode="real" aria-label="正式游戏">'
    +       '<span class="sweet-mode-badge sweet-mode-badge--real">' + SVG_REAL + '</span>'
    +       '<span class="sweet-mode-text">'
    +         '<span class="sweet-mode-title">正式游戏</span>'
    +         '<span class="sweet-mode-desc">进入正式游戏 · 立即开始</span>'
    +       '</span>'
    +       '<i class="ri-arrow-right-s-line sweet-mode-arrow" aria-hidden="true"></i>'
    +     '</button>'
    +   '</div>'
    +   '<p class="sweet-modal-footer">试玩模式用于熟悉游戏玩法与规则</p>'
    + '</div>';

  function normalizeMode(v) {
    return (typeof v === 'string' && MODE_WHITELIST.indexOf(v) !== -1) ? v : 'demo';
  }

  function ensureRoot() {
    var r = document.getElementById(ROOT_ID);
    if (r) return r;
    r = document.createElement('div');
    r.id = ROOT_ID;
    r.className = 'sweet-modal-root';
    r.setAttribute('hidden', '');
    r.innerHTML = MARKUP;
    r.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;
      if (t.closest('[data-close]')) { e.preventDefault(); close(); return; }
      var m = t.closest('.sweet-mode');
      if (m) {
        e.preventDefault();
        var mode = normalizeMode(m.getAttribute('data-mode'));
        try {
          window.dispatchEvent(new CustomEvent('apex:sweet-mode', { detail: { mode: mode } }));
        } catch (_) {}
        close();
        setTimeout(function () {
          window.location.href = '/sweet-demo.html?mode=' + encodeURIComponent(mode);
        }, 220);
      }
    });
    document.body.appendChild(r);
    return r;
  }

  function getFocusable(root) {
    return root.querySelectorAll(
      'button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])'
    );
  }

  function onKey(e) {
    if (!state.isOpen) return;
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;

    var r = document.getElementById(ROOT_ID);
    if (!r) return;
    var n = getFocusable(r);
    if (!n.length) return;

    var f = n[0], l = n[n.length - 1];

    // 关键：若 activeElement 跑出 modal，强制拉回第一个
    var active = document.activeElement;
    if (!active || !r.contains(active)) {
      e.preventDefault();
      (e.shiftKey ? l : f).focus();
      return;
    }

    if (e.shiftKey && active === f) { e.preventDefault(); l.focus(); }
    else if (!e.shiftKey && active === l) { e.preventDefault(); f.focus(); }
  }

  function open() {
    if (state.isOpen) return;
    var r = ensureRoot();

    if (state.closeTimer) { clearTimeout(state.closeTimer); state.closeTimer = 0; }
    if (state.focusTimer) { clearTimeout(state.focusTimer); state.focusTimer = 0; }

    var ae = document.activeElement;
    state.lastFocused = (ae && ae !== document.body) ? ae : null;

    state.isOpen = true;
    r.removeAttribute('hidden');
    void r.offsetWidth;
    r.classList.add('is-open');
    document.body.classList.add('sweet-modal-locked');
    document.addEventListener('keydown', onKey, true);

    state.focusTimer = setTimeout(function () {
      state.focusTimer = 0;
      if (!state.isOpen) return;                          // close 后自我作废
      var b = r.querySelector('.sweet-mode');
      if (b && typeof b.focus === 'function') {
        try { b.focus(); } catch (_) {}
      }
    }, 40);
  }

  function close() {
    if (!state.isOpen) return;
    var r = document.getElementById(ROOT_ID);
    if (!r) return;

    state.isOpen = false;
    if (state.focusTimer) { clearTimeout(state.focusTimer); state.focusTimer = 0; }

    r.classList.remove('is-open');
    document.body.classList.remove('sweet-modal-locked');
    document.removeEventListener('keydown', onKey, true);

    if (state.closeTimer) clearTimeout(state.closeTimer);
    state.closeTimer = setTimeout(function () {
      state.closeTimer = 0;
      r.setAttribute('hidden', '');
      if (state.lastFocused && typeof state.lastFocused.focus === 'function') {
        try { state.lastFocused.focus(); } catch (_) {}
      }
      state.lastFocused = null;
    }, 220);
  }

  window.ApexSweetModal = Object.freeze({
    open: open,
    close: close,
    isOpen: function () { return state.isOpen; }
  });
})();
