/* Apex · Sweet Bonanza 模式选择弹窗 */
(function () {
  'use strict';
  var ROOT_ID = 'apex-sweet-mode-modal';
  var state = { isOpen: false, lastFocused: null, closeTimer: 0 };

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
    +       '<span class="sweet-mode-badge sweet-mode-badge--demo"><i class="ri-play-circle-line" aria-hidden="true"></i></span>'
    +       '<span class="sweet-mode-text"><span class="sweet-mode-title">试玩模式</span><span class="sweet-mode-desc">免费体验 · 无需充值</span></span>'
    +       '<i class="ri-arrow-right-s-line sweet-mode-arrow" aria-hidden="true"></i>'
    +     '</button>'
    +     '<button type="button" class="sweet-mode sweet-mode--real" data-mode="real" aria-label="正式模式">'
    +       '<span class="sweet-mode-badge sweet-mode-badge--real"><i class="ri-vip-crown-2-line" aria-hidden="true"></i></span>'
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
