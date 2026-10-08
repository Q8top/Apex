(function(){
'use strict';
var INITIAL_STATE = Object.freeze({
  phase: 'idle',
  mode: 'demo',
  balanceMinor: 100000,
  betMinor: 200,
  spinId: null,
  totalWinMinor: 0,
  currentWinMinor: 0,
  freeSpins: Object.freeze({
    active: false,
    remaining: 0,
    awarded: 0,
    completed: 0
  }),
  grid: null,
  lastResult: null
});

var ALLOWED = Object.freeze({
  idle:     Object.freeze(['spinning', 'bonus']),
  spinning: Object.freeze(['idle', 'bonus']),
  bonus:    Object.freeze(['bonus', 'idle'])
});

function isValidTransition(from, to){
  var list = ALLOWED[from];
  return !!(list && list.indexOf(to) >= 0);
}

function reduce(state, action){
  action = action || {};
  switch(action.type){
    case 'SPIN_STARTED':
      return Object.assign({}, state, {
        phase: 'spinning',
        spinId: action.spinId || null,
        totalWinMinor: 0,
        currentWinMinor: 0
      });
    case 'SPIN_RESOLVED':
      if (!action.result) return state;
      return Object.assign({}, state, {
        phase: 'idle',
        lastResult: action.result,
        totalWinMinor: action.result.totalWinMinor,
        currentWinMinor: action.result.totalWinMinor,
        grid: action.result.grid || state.grid,
        balanceMinor: (typeof action.balanceMinor === 'number')
          ? action.balanceMinor : state.balanceMinor
      });
    case 'SPIN_FAILED':
      return Object.assign({}, state, { phase: 'idle' });

    case 'BONUS_STARTED':
      return Object.assign({}, state, {
        phase: 'bonus',
        freeSpins: Object.assign({}, state.freeSpins, {
          active: true,
          remaining: action.spins || 0,
          awarded: action.spins || 0,
          completed: 0
        })
      });
    case 'BONUS_SPIN_COMPLETED':
      return Object.assign({}, state, {
        freeSpins: Object.assign({}, state.freeSpins, {
          remaining: Math.max(0, state.freeSpins.remaining - 1),
          completed: state.freeSpins.completed + 1
        })
      });
    case 'BONUS_ENDED':
      return Object.assign({}, state, {
        phase: 'idle',
        freeSpins: Object.assign({}, state.freeSpins, { active: false, remaining: 0 })
      });
    case 'BALANCE_UPDATED':
      if (!Number.isSafeInteger(action.balanceMinor)) return state;
      return Object.assign({}, state, { balanceMinor: action.balanceMinor });
    case 'BET_CHANGED':
      if (!Number.isSafeInteger(action.betMinor) || action.betMinor <= 0) return state;
      return Object.assign({}, state, { betMinor: action.betMinor });
    case 'MODE_CHANGED':
      if (action.mode !== 'demo' && action.mode !== 'real') return state;
      return Object.assign({}, state, { mode: action.mode });
    default:
      return state;
  }
}

window.ApexCoreState = Object.freeze({
  INITIAL_STATE: INITIAL_STATE,
  ALLOWED: ALLOWED,
  reduce: reduce,
  isValidTransition: isValidTransition
});
})();
