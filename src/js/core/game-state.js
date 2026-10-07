/* Apex Game Runtime · State Machine
 * 严格状态迁移，任何非法迁移抛错
 */
(function () {
  'use strict';

  var PHASE = Object.freeze({
    IDLE:             'idle',
    SPIN_REQUEST:     'spin_request',
    SPINNING:         'spinning',
    EVALUATING:       'evaluating',
    WIN_PRESENTATION: 'win_presentation',
    TUMBLING:         'tumbling',
    BONUS_INTRO:      'bonus_intro',
    BONUS_SPIN:       'bonus_spin',
    BONUS_OUTRO:      'bonus_outro',
    FINALIZING:       'finalizing',
    ERROR:            'error'
  });

  var TRANSITIONS = {
    idle:             ['spin_request', 'error'],
    spin_request:     ['spinning', 'error'],
    spinning:         ['evaluating', 'error'],
    evaluating:       ['win_presentation', 'tumbling', 'bonus_intro', 'finalizing', 'error'],
    win_presentation: ['tumbling', 'bonus_intro', 'finalizing', 'error'],
    tumbling:         ['evaluating', 'error'],
    bonus_intro:      ['bonus_spin', 'error'],
    bonus_spin:       ['evaluating', 'bonus_outro', 'error'],
    bonus_outro:      ['finalizing', 'error'],
    finalizing:       ['idle', 'error'],
    error:            ['idle']
  };

  function StateMachine(events) {
    var phase = PHASE.IDLE;

    function get() { return phase; }

    function can(next) {
      var allowed = TRANSITIONS[phase];
      return !!(allowed && allowed.indexOf(next) !== -1);
    }

    function transition(next) {
      var from = phase;
      if (next === from) return phase;
      if (!can(next)) {
        throw new Error('Invalid transition: ' + from + ' -> ' + next);
      }
      phase = next;
      if (events) events.emit('statechange', { from: from, to: next });
      return phase;
    }

    function reset() {
      var from = phase;
      phase = PHASE.IDLE;
      if (events) events.emit('statechange', { from: from, to: PHASE.IDLE });
    }

    return { PHASE: PHASE, get: get, can: can, transition: transition, reset: reset };
  }

  window.ApexGameState = { PHASE: PHASE, TRANSITIONS: TRANSITIONS, create: StateMachine };
})();
