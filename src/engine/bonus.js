(function(){
'use strict';
var _err = window.ApexEngineErrors;

var BONUS_RULES = Object.freeze({
  triggerScatterCount: 4,
  initialSpins: 10,
  retriggerScatterCount: 4,
  retriggerSpins: 2,
  scatterPayouts: Object.freeze({ 4: 3, 5: 5, 6: 100 }),
  bombMin: 2,
  bombMax: 100
});

function scatterPayout(scatterCount){
  var t = BONUS_RULES.scatterPayouts;
  if (scatterCount >= 6) return t[6];
  if (scatterCount >= 5) return t[5];
  if (scatterCount >= 4) return t[4];
  return 0;
}

function resolveBonusTrigger(scatterCount){
  return scatterCount >= BONUS_RULES.triggerScatterCount;
}

function resolveRetrigger(scatterCount){
  if (scatterCount < BONUS_RULES.retriggerScatterCount) return 0;
  return BONUS_RULES.retriggerSpins;
}

function validateBombValue(v){
  if (!Number.isFinite(v)) throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'bomb non-finite');
  if (v < BONUS_RULES.bombMin || v > BONUS_RULES.bombMax){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'bomb out of range');
  }
  return true;
}

window.ApexEngineBonus = Object.freeze({
  BONUS_RULES: BONUS_RULES,
  scatterPayout: scatterPayout,
  resolveBonusTrigger: resolveBonusTrigger,
  resolveRetrigger: resolveRetrigger,
  validateBombValue: validateBombValue
});
})();
