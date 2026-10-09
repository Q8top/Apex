/* Apex - AutoSpin state machine (C-6)
 *
 * States: idle -> waiting -> spinning -> waiting | stopped
 *
 * Contract:
 *   var auto = ApexAutoSpin.create({
 *     spinFn: function(){ return Promise; },     // required
 *     delay: 500,                                 // ms between spins
 *     maxSpins: 100,                              // 0 = unlimited
 *     onState: function(state){},                 // optional
 *     onFinish: function(reason){},               // optional
 *     scheduler: { delay: fn, cancel: fn }        // optional, default uses animator or setTimeout
 *   });
 *   auto.start(); auto.stop(); auto.isRunning();
 *
 * Stop reasons: 'user' | 'max_spins' | 'spin_error' | 'insufficient' | 'timeout'
 *
 * No leaks: stop() always clears the pending timer; second stop() no-op.
 * spinFn throw or reject -> stopped with 'spin_error'.
 * If spinFn returns object with stop:true -> stopped with 'insufficient' (or custom).
 */
(function () {
  'use strict';

  var STATE = Object.freeze({
    IDLE: 'idle',
    WAITING: 'waiting',
    SPINNING: 'spinning',
    STOPPED: 'stopped'
  });

  function defaultScheduler() {
    return {
      delay: function (ms, fn) { return setTimeout(fn, ms); },
      cancel: function (id) { clearTimeout(id); }
    };
  }

  function AutoSpin(opts) {
    opts = opts || {};

    var spinFn = typeof opts.spinFn === 'function' ? opts.spinFn : null;
    var delayMs = Number.isFinite(opts.delay) && opts.delay >= 0 ? opts.delay : 500;
    var maxSpins = Number.isSafeInteger(opts.maxSpins) && opts.maxSpins > 0 ? opts.maxSpins : 0;
    var onState = typeof opts.onState === 'function' ? opts.onState : function () {};
    var onFinish = typeof opts.onFinish === 'function' ? opts.onFinish : function () {};

    var sched = opts.scheduler && typeof opts.scheduler.delay === 'function'
      ? opts.scheduler : defaultScheduler();

    var state = STATE.IDLE;
    var count = 0;
    var pendingTimer = 0;
    var running = false;

    function setState(next) {
      if (state === next) return;
      state = next;
      try { onState(state); } catch (e) {}
    }

    function clearTimer() {
      if (pendingTimer) {
        try { sched.cancel(pendingTimer); } catch (e) {}
        pendingTimer = 0;
      }
    }

    function finish(reason) {
      running = false;
      clearTimer();
      setState(STATE.STOPPED);
      try { onFinish(reason); } catch (e) {}
    }

    function scheduleNext() {
      if (!running) return;
      setState(STATE.WAITING);
      pendingTimer = sched.delay(delayMs, function () {
        pendingTimer = 0;
        if (!running) return;
        doSpin();
      });
    }

    function doSpin() {
      if (!running) return;
      if (maxSpins > 0 && count >= maxSpins) {
        finish('max_spins');
        return;
      }
      setState(STATE.SPINNING);
      var out;
      try {
        out = spinFn();
      } catch (e) {
        finish('spin_error');
        return;
      }
      if (out && typeof out.then === 'function') {
        out.then(function (res) {
          if (!running) return;
          count++;
          if (res && res.stop) {
            finish(res.stopReason || 'insufficient');
            return;
          }
          if (maxSpins > 0 && count >= maxSpins) {
            finish('max_spins');
            return;
          }
          scheduleNext();
        }, function () {
          if (!running) return;
          finish('spin_error');
        });
      } else {
        // 同步返回值也视为一次完成
        count++;
        if (out && out.stop) {
          finish(out.stopReason || 'insufficient');
          return;
        }
        if (maxSpins > 0 && count >= maxSpins) {
          finish('max_spins');
          return;
        }
        scheduleNext();
      }
    }

    function start() {
      if (running) return false;
      if (!spinFn) return false;
      running = true;
      count = 0;
      setState(STATE.IDLE);
      // 首局立即开始，不等待 delay
      doSpin();
      return true;
    }

    function stop() {
      if (!running) return false;
      finish('user');
      return true;
    }

    function isRunning() { return running; }
    function getState() { return state; }
    function getCount() { return count; }

    return Object.freeze({
      start: start,
      stop: stop,
      isRunning: isRunning,
      getState: getState,
      getCount: getCount,
      STATE: STATE
    });
  }

  window.ApexAutoSpin = Object.freeze({
    create: AutoSpin,
    STATE: STATE
  });
})();
