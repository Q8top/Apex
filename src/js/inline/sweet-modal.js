/* Apex · 模式选择弹窗
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
 * P1-10 review: body 锁保留 class-based 实现；index.html 不引入 sheet-lock.js，
 *             机制与三份 sheet 不统一。改 CSS 风险大，暂保留。
 */
(function () {
  'use strict';

  var ROOT_ID = 'apex-sweet-mode-modal';
  var MODE_WHITELIST = Object.freeze(['demo', 'real']);
  var state = { isOpen: false, lastFocused: null, closeTimer: 0, focusTimer: 0, currentTarget: '/sweet-demo.html' };

  var SVG_DEMO = ''
    + '<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false">'
    +   '<path d="M9.2 6.6 L18.6 12 L9.2 17.4 Z" fill="#ffffff"/>'
    + '</svg>';

  var SVG_REAL = ''
    + '<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false">'
    +   '<path d="M12 3.4 L20 12 L12 20.6 L4 12 Z" fill="#f3d582"/>'
    +   '<path d="M12 6.2 L17.4 12 L12 17.8 L6.6 12 Z" fill="#fff7e2" opacity=".55"/>'
    + '</svg>';

  var MARKUP = ''
    + '<div class="sweet-modal-backdrop" data-close="1"></div>'
    + '<div class="sweet-modal-panel" role="dialog" aria-modal="true" aria-labelledby="apex-sweet-modal-title">'
    +   '<button type="button" class="sweet-modal-close" aria-label="关闭" data-close="1"><i class="ri-close-line" aria-hidden="true"></i></button>'
    +   '<header class="sweet-modal-header">'
    +     '<div class="sweet-modal-cover"><img src="/assets/games/sweet.webp" alt="" draggable="false"></div>'
    +     '<h2 id="apex-sweet-modal-title" class="sweet-modal-title">糖果连连爆</h2>'
    +   '</header>'
    +   '<div class="sweet-modal-actions">'
    +     '<button type="button" class="sweet-mode sweet-mode--demo" data-mode="demo" aria-label="试玩模式">'
    +       '<span class="sweet-mode-title">试玩模式</span>'
    +     '</button>'
    +     '<button type="button" class="sweet-mode sweet-mode--real" data-mode="real" aria-label="正式游戏">'
    +       '<span class="sweet-mode-title">正式游戏</span>'
    +     '</button>'
    +   '</div>'
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
          window.location.href = (state.currentTarget || '/sweet-demo.html') + '?mode=' + encodeURIComponent(mode);
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

  function applyContent(opts) {
    opts = opts || {};
    state.currentTarget = opts.target || '/sweet-demo.html';
    var r = document.getElementById(ROOT_ID);
    if (!r) return;
    var img = r.querySelector('.sweet-modal-cover img');
    if (img && opts.cover) img.setAttribute('src', opts.cover);
    var h = r.querySelector('.sweet-modal-title');
    if (h && opts.title) h.textContent = opts.title;
    var sub = r.querySelector('.sweet-modal-subtitle');
    if (sub && opts.subtitle) sub.textContent = opts.subtitle;
    if (opts.brand) r.setAttribute('data-brand', String(opts.brand));
    else r.removeAttribute('data-brand');
  }

  function open(opts) {
    if (state.isOpen) return;
    var r = ensureRoot();
    applyContent(opts);

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
