/* Apex - Animator (C-5 RAF scheduler)
 *
 * Absolute-time RAF scheduler with:
 *   - delay(ms, fn)   : setTimeout replacement, cancellable, pauses on hide
 *   - raf(fn)         : one-shot next frame
 *   - loop(fn)        : per-frame, fn returns false to stop
 *   - cancel(handle)  : idempotent
 *   - cancelAll()
 *   - pause()/resume(): manual, plus auto on visibilitychange
 *   - reduced-motion  : delay fires immediately, loop fires once
 *
 * Design: deadlines stored as absolute ms (now + delay).
 * Pause records (now, remaining); resume re-schedules from remaining.
 * Not using dt accumulation, so no drift.
 */
(function () {
  'use strict';

  function defaultNow() {
    if (typeof performance !== 'undefined' && performance.now) return performance.now();
    return Date.now();
  }
  function defaultRaf(fn) { return requestAnimationFrame(fn); }
  function defaultCancelRaf(id) { if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); }

  function readReduced() {
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches === true;
      }
    } catch (e) {}
    return false;
  }

  function Animator(opts) {
    opts = opts || {};
    var now = typeof opts.now === 'function' ? opts.now : defaultNow;
    var rafFn = typeof opts.requestFrame === 'function' ? opts.requestFrame : defaultRaf;
    var cancelRaf = typeof opts.cancelFrame === 'function' ? opts.cancelFrame : defaultCancelRaf;
    var doc = opts.doc || (typeof document !== 'undefined' ? document : null);
    var reduced = opts.prefersReducedMotion != null ? !!opts.prefersReducedMotion : readReduced();

    var handles = [];      // active handles
    var seq = 1;
    var paused = false;
    var pausedAt = 0;

    function makeHandle(kind, extra) {
      var h = { id: seq++, kind: kind, alive: true, rafId: 0, deadline: 0, fn: null };
      if (extra) for (var k in extra) if (extra[k] !== undefined) h[k] = extra[k];
      return h;
    }

    function add(h) { handles.push(h); return h; }

    function remove(h) {
      h.alive = false;
      for (var i = 0; i < handles.length; i++) {
        if (handles[i] === h) { handles.splice(i, 1); break; }
      }
    }

    function schedule(h) {
      if (!h.alive) return;
      if (h.kind === 'loop') {
        h.rafId = rafFn(function () { tickLoop(h); });
      } else if (h.kind === 'delay') {
        h.rafId = rafFn(function () { tickDelay(h); });
      } else {
        h.rafId = rafFn(function () { tickOnce(h); });
      }
    }

    function tickOnce(h) {
      if (!h.alive) return;
      remove(h);
      try { h.fn(now()); } catch (e) {}
    }

    function tickDelay(h) {
      if (!h.alive) return;
      if (paused) return;   // will be rescheduled on resume
      if (now() < h.deadline) { schedule(h); return; }
      remove(h);
      try { h.fn(); } catch (e) {}
    }

    function tickLoop(h) {
      if (!h.alive) return;
      if (paused) return;
      var keep = false;
      try { keep = h.fn(now()) !== false; } catch (e) { keep = false; }
      if (keep && h.alive) schedule(h);
      else remove(h);
    }

    function delay(ms, fn) {
      var d = Number(ms);
      if (!Number.isFinite(d) || d < 0) d = 0;
      var h = add(makeHandle('delay', { deadline: now() + d, fn: fn }));
      if (reduced) {
        remove(h);
        try { fn(); } catch (e) {}
        return h;
      }
      if (!paused) schedule(h);
      return h;
    }

    function raf(fn) {
      var h = add(makeHandle('raf', { fn: fn }));
      if (reduced) {
        remove(h);
        try { fn(now()); } catch (e) {}
        return h;
      }
      if (!paused) schedule(h);
      return h;
    }

    function loop(fn) {
      var h = add(makeHandle('loop', { fn: fn }));
      if (reduced) {
        remove(h);
        try { fn(now()); } catch (e) {}
        return h;
      }
      if (!paused) schedule(h);
      return h;
    }

    function cancel(handle) {
      if (!handle || !handle.alive) return false;
      if (handle.rafId) {
        try { cancelRaf(handle.rafId); } catch (e) {}
        handle.rafId = 0;
      }
      remove(handle);
      return true;
    }

    function cancelAll() {
      for (var i = handles.length - 1; i >= 0; i--) cancel(handles[i]);
      handles.length = 0;
    }

    function pause() {
      if (paused) return false;
      paused = true;
      pausedAt = now();
      for (var i = 0; i < handles.length; i++) {
        var h = handles[i];
        if (h.rafId) {
          try { cancelRaf(h.rafId); } catch (e) {}
          h.rafId = 0;
        }
      }
      return true;
    }

    function resume() {
      if (!paused) return false;
      paused = false;
      var offset = now() - pausedAt;
      for (var i = 0; i < handles.length; i++) {
        var h = handles[i];
        if (h.kind === 'delay') h.deadline += offset;
        if (h.alive) schedule(h);
      }
      return true;
    }

    function isPaused() { return paused; }
    function size() { return handles.length; }
    function isReduced() { return reduced; }

    if (doc && doc.addEventListener) {
      try {
        doc.addEventListener('visibilitychange', function () {
          if (doc.hidden) pause(); else resume();
        });
      } catch (e) {}
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        var onChange = function (e) { reduced = !!e.matches; };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else if (mq.addListener) mq.addListener(onChange);
      } catch (e) {}
    }

    return Object.freeze({
      delay: delay, raf: raf, loop: loop,
      cancel: cancel, cancelAll: cancelAll,
      pause: pause, resume: resume,
      isPaused: isPaused, isReduced: isReduced, size: size
    });
  }

  window.ApexAnimator = Object.freeze({ create: Animator });
})();
