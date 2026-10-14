/* Apex - Game mode picker. White panel, two side-by-side buttons. */
(function () {
  'use strict';

  var ROOT_ID  = 'apex-mode-picker';
  var CSS_HREF = '/src/css/waija-mode-picker.css?v=2';
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

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function build() {
    ensureCss();
    root = el('div', 'mp-root');
    root.id = ROOT_ID;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');

    var bd = el('div', 'mp-backdrop');
    bd.setAttribute('data-close', '1');

    panel = el('div', 'mp-panel');

    var x = el('button', 'mp-close');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.textContent = '\u00d7';
    x.setAttribute('data-close', '1');

    var img = el('img', 'mp-icon');
    img.alt = '';
    img.setAttribute('draggable', 'false');

    var title = el('h2', 'mp-title');
    var sub   = el('p',  'mp-sub', '\u9009\u62E9\u6E38\u620F\u6A21\u5F0F');

    var actions = el('div', 'mp-actions');

    var demo = el('button', 'mp-btn mp-btn--demo');
    demo.type = 'button';
    demo.setAttribute('data-mode', 'demo');
    demo.appendChild(el('span', 'mp-btn-label', '\u8BD5\u73A9\u6A21\u5F0F'));
    demo.appendChild(el('span', 'mp-btn-desc', 'DEMO'));

    var real = el('button', 'mp-btn mp-btn--real');
    real.type = 'button';
    real.setAttribute('data-mode', 'real');
    real.appendChild(el('span', 'mp-btn-label', '\u6B63\u5F0F\u6E38\u620F'));
    real.appendChild(el('span', 'mp-btn-desc', 'REAL'));

    actions.appendChild(demo);
    actions.appendChild(real);

    panel.appendChild(x);
    panel.appendChild(img);
    panel.appendChild(title);
    panel.appendChild(sub);
    panel.appendChild(actions);
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
      alert('\u6B63\u5F0F\u6E38\u620F\u656C\u8BF7\u671F\u5F85');
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
    if (img) img.src = current.src || '';
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
