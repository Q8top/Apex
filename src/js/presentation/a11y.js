/* Apex - a11y toolkit (C-7)
 *
 * Unified accessibility helpers:
 *   - focus trap (into container, Tab loop, Esc close)
 *   - live region announcer (polite / assertive)
 *   - prefers-reduced-motion query + subscribe
 *   - keyboard activator (Enter/Space on role=button)
 *   - focus restore stack
 *
 * All functions are no-op safe when document/window missing.
 */
(function () {
  'use strict';

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var FOCUSABLE = [
    'a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])',
    'textarea:not([disabled])', 'button:not([disabled])', 'iframe',
    'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function focusables(root) {
    if (!root) return [];
    var all = qsa(FOCUSABLE, root);
    var out = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.offsetParent === null && el !== document.activeElement) continue;
      var cs;
      try { cs = window.getComputedStyle(el); } catch (e) { cs = null; }
      if (cs && (cs.visibility === 'hidden' || cs.display === 'none')) continue;
      out.push(el);
    }
    return out;
  }

  /* ---------- focus trap ---------- */
  function trapFocus(container, opts) {
    if (!container) return { release: function () {} };
    opts = opts || {};
    var prevActive = document.activeElement;
    var released = false;

    var onKey = function (e) {
      if (released) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (typeof opts.onEscape === 'function') opts.onEscape(e);
        return;
      }
      if (e.key !== 'Tab') return;
      var list = focusables(container);
      if (list.length === 0) { e.preventDefault(); return; }
      var first = list[0];
      var last = list[list.length - 1];
      var active = document.activeElement;
      if (e.shiftKey && active === first) { e.preventDefault(); try { last.focus(); } catch (er) {} }
      else if (!e.shiftKey && active === last) { e.preventDefault(); try { first.focus(); } catch (er) {} }
    };

    document.addEventListener('keydown', onKey, true);

    if (opts.autoFocus !== false) {
      var list = focusables(container);
      var target = opts.initialFocus || list[0] || container;
      setTimeout(function () {
        try { if (target && target.focus) target.focus(); } catch (e) {}
      }, 30);
    }

    function release() {
      if (released) return false;
      released = true;
      document.removeEventListener('keydown', onKey, true);
      if (opts.restoreFocus !== false) {
        try { if (prevActive && prevActive.focus) prevActive.focus(); } catch (e) {}
      }
      return true;
    }

    return Object.freeze({ release: release, isActive: function () { return !released; } });
  }

  /* ---------- live region announcer ---------- */
  function createAnnouncer(opts) {
    opts = opts || {};
    var politeEl = null, assertiveEl = null;
    var lastMsg = { polite: '', assertive: '' };
    var lastAt = { polite: 0, assertive: 0 };
    var DEDUP_MS = Number.isFinite(opts.dedupMs) ? opts.dedupMs : 1500;
    var now = function () { return Date.now(); };

    function ensure(kind) {
      if (typeof document === 'undefined') return null;
      var ref = kind === 'assertive' ? assertiveEl : politeEl;
      if (ref) return ref;
      var el = document.createElement('div');
      el.setAttribute('aria-live', kind);
      el.setAttribute('aria-atomic', 'true');
      el.className = 'sr-only apex-sr-live apex-sr-live--' + kind;
      el.style.cssText = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);border:0;';
      document.body.appendChild(el);
      if (kind === 'assertive') assertiveEl = el; else politeEl = el;
      return el;
    }

    function say(msg, kind) {
      if (typeof msg !== 'string' || msg.length === 0) return false;
      kind = kind === 'assertive' ? 'assertive' : 'polite';
      var t = now();
      if (msg === lastMsg[kind] && (t - lastAt[kind]) < DEDUP_MS) return false;
      var el = ensure(kind);
      if (!el) return false;
      lastMsg[kind] = msg;
      lastAt[kind] = t;
      // 清空再写：强制 SR 重复播报同消息
      el.textContent = '';
      setTimeout(function () { try { el.textContent = msg; } catch (e) {} }, 20);
      return true;
    }

    function clear(kind) {
      var list = kind ? [kind === 'assertive' ? assertiveEl : politeEl] : [politeEl, assertiveEl];
      for (var i = 0; i < list.length; i++) {
        if (list[i]) try { list[i].textContent = ''; } catch (e) {}
      }
    }

    return Object.freeze({
      say: say,
      polite: function (m) { return say(m, 'polite'); },
      assertive: function (m) { return say(m, 'assertive'); },
      clear: clear,
      element: function (k) { return k === 'assertive' ? assertiveEl : politeEl; }
    });
  }

  /* ---------- reduced motion ---------- */
  function prefersReducedMotion() {
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches === true;
      }
    } catch (e) {}
    return false;
  }

  function onReducedMotionChange(fn) {
    if (typeof fn !== 'function') return function () {};
    try {
      if (typeof window === 'undefined' || !window.matchMedia) return function () {};
      var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      var handler = function (e) { try { fn(!!e.matches); } catch (er) {} };
      if (mq.addEventListener) mq.addEventListener('change', handler);
      else if (mq.addListener) mq.addListener(handler);
      return function () {
        try {
          if (mq.removeEventListener) mq.removeEventListener('change', handler);
          else if (mq.removeListener) mq.removeListener(handler);
        } catch (e) {}
      };
    } catch (e) {
      return function () {};
    }
  }

  /* ---------- keyboard activator ---------- */
  function activateOnEnterSpace(el, fn, opts) {
    if (!el || typeof fn !== 'function') return function () {};
    opts = opts || {};
    var handler = function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        if (opts.preventDefault !== false) e.preventDefault();
        try { fn(e); } catch (er) {}
      }
    };
    el.addEventListener('keydown', handler);
    return function () { try { el.removeEventListener('keydown', handler); } catch (e) {} };
  }

  /* ---------- focus restore ---------- */
  function createFocusStack() {
    var stack = [];
    return Object.freeze({
      save: function () {
        try { stack.push(document.activeElement); } catch (e) { stack.push(null); }
        return stack.length;
      },
      restore: function () {
        var el = stack.pop();
        if (el && typeof el.focus === 'function') {
          try { el.focus(); return true; } catch (e) {}
        }
        return false;
      },
      depth: function () { return stack.length; },
      clear: function () { stack.length = 0; }
    });
  }

  window.ApexA11y = Object.freeze({
    focusables: focusables,
    trapFocus: trapFocus,
    createAnnouncer: createAnnouncer,
    prefersReducedMotion: prefersReducedMotion,
    onReducedMotionChange: onReducedMotionChange,
    activateOnEnterSpace: activateOnEnterSpace,
    createFocusStack: createFocusStack
  });
})();
