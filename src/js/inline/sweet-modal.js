/* Apex · Sweet Bonanza 模式选择弹窗 */
(function () {
  'use strict';
  var ROOT_ID = 'apex-sweet-mode-modal';
  var state = { isOpen: false, lastFocused: null, closeTimer: 0 };

var SVG_DEMO = ''
  + '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">'
  +   '<defs>'
  +     '<linearGradient id="swDemoOuter" x1="0" y1="0" x2="1" y2="1">'
  +       '<stop offset="0" stop-color="#f9a8d4"/>'
  +       '<stop offset=".5" stop-color="#ec4899"/>'
  +       '<stop offset="1" stop-color="#a855f7"/>'
  +     '</linearGradient>'
  +     '<radialGradient id="swDemoInner" cx=".35" cy=".3" r=".85">'
  +       '<stop offset="0" stop-color="#fbcfe8"/>'
  +       '<stop offset=".55" stop-color="#ec4899"/>'
  +       '<stop offset="1" stop-color="#9333ea"/>'
  +     '</radialGradient>'
  +   '</defs>'
  +   '<circle cx="12" cy="12" r="10.4" fill="none" stroke="url(#swDemoOuter)" stroke-width=".8" stroke-opacity=".35"/>'
  +   '<circle cx="12" cy="12" r="9" fill="url(#swDemoOuter)" opacity=".18"/>'
  +   '<circle cx="12" cy="12" r="7.6" fill="url(#swDemoInner)"/>'
  +   '<ellipse cx="9.8" cy="8" rx="3.2" ry="1.6" fill="#fff" opacity=".35"/>'
  +   '<path d="M10.2 8.6 L16.5 12 L10.2 15.4 Z" fill="#fff"/>'
  +   '<path d="M18.4 4.2 L18.9 6 L20.8 6.5 L18.9 7 L18.4 8.8 L17.9 7 L16 6.5 L17.9 6 Z" fill="#fff" opacity=".95"/>'
  + '</svg>';

var SVG_REAL = ''
  + '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">'
  +   '<defs>'
  +     '<linearGradient id="swRealOuter" x1="0" y1="0" x2="0" y2="1">'
  +       '<stop offset="0" stop-color="#fcd34d"/>'
  +       '<stop offset=".5" stop-color="#f59e0b"/>'
  +       '<stop offset="1" stop-color="#92400e"/>'
  +     '</linearGradient>'
  +     '<radialGradient id="swRealCore" cx=".35" cy=".3" r=".9">'
  +       '<stop offset="0" stop-color="#fef9c3"/>'
  +       '<stop offset=".5" stop-color="#facc15"/>'
  +       '<stop offset="1" stop-color="#b45309"/>'
  +     '</radialGradient>'
  +     '<linearGradient id="swRealRing" x1="0" y1="0" x2="0" y2="1">'
  +       '<stop offset="0" stop-color="#fff" stop-opacity=".7"/>'
  +       '<stop offset="1" stop-color="#fff" stop-opacity=".1"/>'
  +     '</linearGradient>'
  +   '</defs>'
  +   '<circle cx="12" cy="12" r="10.4" fill="none" stroke="url(#swRealOuter)" stroke-width=".8" stroke-opacity=".4"/>'
  +   '<circle cx="12" cy="12" r="9" fill="url(#swRealOuter)" opacity=".18"/>'
  +   '<circle cx="12" cy="12" r="7.6" fill="url(#swRealCore)"/>'
  +   '<circle cx="12" cy="12" r="6" fill="none" stroke="url(#swRealRing)" stroke-width=".7"/>'
  +   '<path d="M8.6 14.4 L8.6 10.2 L10.4 12 L12 9 L13.6 12 L15.4 10.2 L15.4 14.4 Z" fill="#fff" stroke="#fff" stroke-width=".3" stroke-linejoin="round"/>'
  +   '<rect x="8.6" y="14.4" width="6.8" height="1.1" rx=".55" fill="#fff"/>'
  +   '<path d="M6.6 9.2 Q 8 5.8 12 5.2" stroke="#fff" stroke-width=".9" fill="none" opacity=".65" stroke-linecap="round"/>'
  +   '<circle cx="17.6" cy="6.4" r=".7" fill="#fff" opacity=".85"/>'
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
    +   '<p class="sweet-modal-footer">试玩使用演示数据 · 正式模式使用真实余额</p>'
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
