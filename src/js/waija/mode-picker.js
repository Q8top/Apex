/* Apex - Game mode picker. Click a live card -> pick demo or real. */
(function () {
  'use strict';

  var ROOT_ID  = 'apex-mode-picker';
  var CSS_HREF = '/src/css/waija-mode-picker.css?v=1';
  var CSS_ID   = 'apex-mode-picker-css';

  var root = null;
  var panel = null;
  var lastFocus = null;
  var current = null;

  function ensureCss() {
    if (document.getElementById(CSS_ID)) return;
    var l = document.createElement('link');
    l.id = CSS_ID;
    l.rel = 'stylesheet';
    l.href = CSS_HREF;
    document.head.appendChild(l);
  }

  function build() {
    ensureCss();
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'mp-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');

    var bd = document.createElement('div');
    bd.className = 'mp-backdrop';
    bd.setAttribute('data-close', '1');

    panel = document.createElement('div');
    panel.className = 'mp-panel';

    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'mp-close';
    x.setAttribute('aria-label', 'Close');
    x.textContent = '\u00d7';
    x.setAttribute('data-close', '1');

    var img = document.createElement('img');
    img.className = 'mp-icon';
    img.alt = '';
    img.setAttribute('draggable', 'false');

    var title = document.createElement('h2');
    title.className = 'mp-title';

    var demo = document.createElement('button');
    demo.type = 'button';
    demo.className = 'mp-btn mp-btn--demo';
    demo.setAttribute('data-mode', 'demo');
    demo.textContent = '\u8bd5\u73a9\u6a21\u5f0f';

    var real = document.createElement('button');
    real.type = 'button';
    real.className = 'mp-btn mp-btn--real';
    real.setAttribute('data-mode', 'real');
    real.textContent = '\u6b63\u5f0f\u6e38\u620f';

    panel.appendChild(x);
    panel.appendChild(img);
    panel.appendChild(title);
    panel.appendChild(demo);
    panel.appendChild(real);
    root.appendChild(bd);
    root.appendChild(panel);
    document.body.appendChild(root);
    root.addEventListener('click', onRootClick);
    root.addEventListener('keydown', onKey);
  }

  function onRootClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('[data-close]')) { close(); return; }
    var m = t.closest('.mp-btn');
    if (!m) return;
    var mode = m.getAttribute('data-mode');
    if (mode === 'demo') {
      var g = current;
      close();
      if (g && g.waijaId && window.ApexWaijaHome &&
          typeof window.ApexWaijaHome.launch === 'function') {
        window.ApexWaijaHome.launch(g.waijaId, g.n);
      }
      return;
    }
    if (mode === 'real') {
      alert('\u6b63\u5f0f\u6e38\u620f\u656c\u8bf7\u671f\u5f85');
      close();
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  }

  function open(opts) {
    if (!opts || !opts.game) return;
    if (!root) build();
    current = opts.game;
    lastFocus = document.activeElement;
    var img = panel.querySelector('.mp-icon');
    var title = panel.querySelector('.mp-title');
    if (img) { img.src = current.src || ''; }
    if (title) title.textContent = current.n || '';
    root.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    try { panel.focus(); } catch (e) {}
  }

  function close() {
    if (!root) return;
    root.classList.remove('on');
    document.documentElement.style.overflow = '';
    try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e) {}
  }

  window.ApexModePicker = Object.freeze({
    open: open,
    close: close
  });
})();
