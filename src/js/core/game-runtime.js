/* Apex Game Runtime · 骨架
 * 承载状态机 + 事件总线 + Provider 调用
 */
(function () {
  'use strict';

  function Runtime(opts) {
    opts = opts || {};
    var events = opts.events || (window.ApexEventBus && window.ApexEventBus());
    var sm = window.ApexGameState.create(events);
    var provider = opts.provider || null;

    function getPhase() { return sm.get(); }
    function isIdle() { return sm.get() === sm.PHASE.IDLE; }
    function attachProvider(p) { provider = p; }

    function startSpin(bet) {
      if (!isIdle()) return { ok: false, reason: 'busy' };
      if (!provider) return { ok: false, reason: 'no_provider' };
      try {
        sm.transition(sm.PHASE.SPIN_REQUEST);
        events.emit('game:spin-start', { bet: bet });
      } catch (e) {
        events.emit('game:error', { stage: 'spin-start', error: e });
        return { ok: false, reason: 'transition' };
      }
      Promise.resolve(provider.spin({ bet: bet }))
        .then(function (result) {
          sm.transition(sm.PHASE.SPINNING);
          events.emit('game:spin-result', result);
          sm.transition(sm.PHASE.EVALUATING);
          sm.transition(sm.PHASE.FINALIZING);
          sm.transition(sm.PHASE.IDLE);
        })
        .catch(function (err) {
          events.emit('game:error', { stage: 'spin', error: err });
          // ERROR 状态仅作瞬态标记；外部通过 game:error 事件感知错误
          try { sm.transition(sm.PHASE.ERROR); } catch (e) {}
          try { sm.transition(sm.PHASE.IDLE); } catch (e) {}
        });
      return { ok: true };
    }

    return {
      events: events,
      state: sm,
      getPhase: getPhase,
      isIdle: isIdle,
      getProvider: function () { return provider; },
      attachProvider: attachProvider,
      startSpin: startSpin
    };
  }

  window.ApexGameRuntime = { create: Runtime };
})();
