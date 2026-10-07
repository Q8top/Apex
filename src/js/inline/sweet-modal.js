/* Apex · Sweet Bonanza 模式选择弹窗 */
(function () {
  'use strict';
  var ROOT_ID = 'apex-sweet-mode-modal';
  var state = { isOpen: false, lastFocused: null, closeTimer: 0 };

  var SVG_DEMO = ''
    + '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">'
    +   '<defs>'
    +     '<linearGradient id="swDemoG" x1="0" y1="0" x2="1" y2="1">'
    +       '<stop offset="0" stop-color="#ff8fc1"/>'
    +       '<stop offset="1" stop-color="#c026d3"/>'
    +     '</linearGradient>'
    +   '</defs>'
    +   '<circle cx="12" cy="12" r="9" fill="none" stroke="url(#swDemoG)" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="47 10" stroke-dashoffset="12"/>'
    +   '<circle cx="12" cy="12" r="5.6" fill="url(#swDemoG)"/>'
    +   '<path d="M10.6 9.4 L15.4 12 L10.6 14.6 Z" fill="#fff"/>'
    + '</svg>';

  var SVG_REAL = ''
    + '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">'
    +   '<defs>'
    +     '<linearGradient id="swRealG" x1="0" y1="0" x2="0" y2="1">'
    +       '<stop offset="0" stop-color="#fbbf24"/>'
    +       '<stop offset="1" stop-color="#b45309"/>'
    +     '</linearGradient>'
    +     '<linearGradient id="swRealHi" x1="0" y1="0" x2="0" y2="1">'
    +       '<stop offset="0" stop-color="#fef3c7"/>'
    +       '<stop offset="1" stop-color="#fbbf24"/>'
    +     '</linearGradient>'
    +   '</defs>'
    +   '<path d="M12 2.6 L21.4 9.6 L12 21.4 L2.6 9.6 Z" fill="url(#swRealG)" stroke="rgba(120,72,0,.2)" stroke-width=".8" stroke-linejoin="round"/>'
    +   '<path d="M12 2.6 L17.2 9.6 L6.8 9.6 Z" fill="url(#swRealHi)" opacity=".95"/>'
    +   '<path d="M2.6 9.6 L21.4 9.6" stroke="rgba(120,72,0,.35)" stroke-width=".7"/>'
    +   '<path d="M12 2.6 L12 21.4" stroke="rgba(255,255,255,.25)" stroke-width=".5"/>'
    +   '<path d="M6.8 9.6 L12 21.4" stroke="rgba(255,255,255,.15)" stroke-width=".5"/>'
    +   '<path d="M17.2 9.6 L12 21.4" stroke="rgba(255,255,255,.15)" stroke-width=".5"/>'
    +   '<circle cx="9.8" cy="5.8" r=".9" fill="#fff" opacity=".95"/>'
    + '</svg>';


  var MARKUP = ''
    + '<div class="sweet-modal-backdrop" data-close="1"></div>'
    + '<div class="sweet-modal-panel" role="dialog" aria-modal="true" aria-labelledby="apex-sweet-modal-title">'
    +   '<button type="button" class="sweet-modal-close" aria-label="关闭" data-close="1"><i class="ri-close-line" aria-hidden="true"></i></button>'
    +   '<header class="sweet-modal-header">'
    +     '<div class="sweet-modal-cover"><img src="/assets/games/sweet.webp" alt="" draggable="false"></div>'
    +     '<h2 id="apex-sweet-modal-title" class="sweet-modal-title">糖果连连爆</h2>'
    +     '<p class="sweet-modal-subtitle">Sweet Bonanza · 选择游戏模式</p>'
    +   '</header>'
    +   '<div class="sweet-modal-actions">'
    +     '<button type="button" class="sweet-mode sweet-mode--demo" data-mode="demo" aria-label="试玩模式">'
    +       '<span class="sweet-mode-badge sweet-mode-badge--demo">' + SVG_DEMO + '</span>'
    +       '<span class="sweet-mode-text"><span class="sweet-mode-title">试玩模式</span><span class="sweet-mode-desc">免费体验 · 无需充值</span></span>'
    +       '<i class="ri-arrow-right-s-line sweet-mode-arrow" aria-hidden="true"></i>'
    +     '</button>'
    +     '<button type="button" class="sweet-mode sweet-mode--real" data-mode="real" aria-label="正式模式">'
    +       '<span class="sweet-mode-badge sweet-mode-badge--real">' + SVG_REAL + '</span>'
    +       '<span class="sweet-mode-text"><span class="sweet-mode-title">正式模式</span><span class="sweet-mode-desc">真实游戏 · 立即开始</span></span>'
    +       '<i class="ri-arrow-right-s-line sweet-mode-arrow" aria-hidden="true"></i>'
    +     '</button>'
    +   '</div>'
    +   '<p class="sweet-modal-footer">首次进入正式模式前需要完成身份验证</p>'
    + '</div>';

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
        try { window.dispatchEvent(new CustomEvent('apex:sweet-mode', { detail: { mode: m.getAttribute('data-mode') || '' } })); } catch (x) {}
        close();
      }
    });
    document.body.appendChild(r);
    return r;
  }

  function onKey(e) {
    if (!state.isOpen) return;
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var r = document.getElementById(ROOT_ID);
    if (!r) return;
    var n = r.querySelectorAll('button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])');
    if (!n.length) return;
    var f = n[0], l = n[n.length - 1];
    if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
    else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
  }

  function open() {
    if (state.isOpen) return;
    var r = ensureRoot();
    if (state.closeTimer) { clearTimeout(state.closeTimer); state.closeTimer = 0; }
    state.lastFocused = document.activeElement;
    state.isOpen = true;
    r.removeAttribute('hidden');
    void r.offsetWidth;
    r.classList.add('is-open');
    document.body.classList.add('sweet-modal-locked');
    document.addEventListener('keydown', onKey, true);
    setTimeout(function () {
      var b = r.querySelector('.sweet-mode');
      if (b) { try { b.focus(); } catch (e) {} }
    }, 40);
  }

  function close() {
    if (!state.isOpen) return;
    var r = document.getElementById(ROOT_ID);
    if (!r) return;
    state.isOpen = false;
    r.classList.remove('is-open');
    document.body.classList.remove('sweet-modal-locked');
    document.removeEventListener('keydown', onKey, true);
    if (state.closeTimer) clearTimeout(state.closeTimer);
    state.closeTimer = setTimeout(function () {
      r.setAttribute('hidden', '');
      state.closeTimer = 0;
      if (state.lastFocused && state.lastFocused.focus) {
        try { state.lastFocused.focus(); } catch (e) {}
      }
      state.lastFocused = null;
    }, 220);
  }

  window.ApexSweetModal = { open: open, close: close, isOpen: function () { return state.isOpen; } };
})();
