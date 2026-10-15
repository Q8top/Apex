/* Apex - Game mode picker (modern black & white). */
(function () {
  'use strict';

  var ROOT_ID = 'apex-mode-picker';
  var CSS_HREF = '/src/css/mode-picker.css?v=1';
  var CSS_ID = 'apex-mode-picker-css';

  var root = null;
  var panel = null;
  var nameEl = null;
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

  function el(t, c, x) {
    var e = document.createElement(t);
    if (c) e.className = c;
    if (x != null) e.textContent = x;
    return e;
  }

  function build() {
    ensureCss();
    root = el('div', 'mp-root');
    root.id = ROOT_ID;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'apex-mp-name');

    var bd = el('div', 'mp-backdrop');
    bd.setAttribute('data-close', '1');

    panel = el('div', 'mp-panel');

    var x = el('button', 'mp-close');
    x.type = 'button';
    x.setAttribute('aria-label', '\u5173\u95ED');
    x.setAttribute('data-close', '1');
    x.innerHTML = '<i class="ri-close-line" aria-hidden="true"></i>';

    var eyebrow = el('p', 'mp-eyebrow',
      '\u9009\u62E9\u6E38\u620F\u6A21\u5F0F');

    nameEl = el('h2', 'mp-name');
    nameEl.id = 'apex-mp-name';

    var actions = el('div', 'mp-actions');

    var demo = el('button', 'mp-btn mp-btn--demo');
    demo.type = 'button';
    demo.setAttribute('data-mode', 'demo');
    demo.textContent = '\u8BD5\u73A9\u6A21\u5F0F';

    var real = el('button', 'mp-btn mp-btn--real');
    real.type = 'button';
    real.setAttribute('data-mode', 'real');
    real.textContent = '\u6B63\u5F0F\u6E38\u620F';

    actions.appendChild(demo);
    actions.appendChild(real);

    panel.appendChild(x);
    panel.appendChild(eyebrow);
    panel.appendChild(nameEl);
    panel.appendChild(actions);

    root.appendChild(bd);
    root.appendChild(panel);
    document.body.appendChild(root);

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('[data-close]')) { close(); return; }
    var m = t.closest('.mp-btn');
    if (!m) return;
    var mode = m.getAttribute('data-mode') || 'demo';
    var g = current || {};
    var gid = g.id || '';
    close();
    var url = '/loading.html?game=' + encodeURIComponent(gid) +
              '&mode=' + encodeURIComponent(mode);
    location.href = url;
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  function open(opts) {
    if (!opts || !opts.game) return;
    if (!root) build();
    current = opts.game;
    lastFocus = document.activeElement;
    if (nameEl) nameEl.textContent = current.n || '';
    root.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () {
      try {
        var b = panel.querySelector('.mp-btn');
        if (b) b.focus();
      } catch (e) {}
    }, 40);
  }

  function close() {
    if (!root) return;
    root.classList.remove('on');
    document.documentElement.style.overflow = '';
    try {
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    } catch (e) {}
  }

  window.ApexModePicker = Object.freeze({ open: open, close: close });
})();
