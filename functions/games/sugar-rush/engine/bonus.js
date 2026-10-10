(function(){
'use strict';
var _err = window.ApexSugarRushErrors;

var BONUS_RULES = Object.freeze({
  triggerScatterCount: 3,
  initialSpins: Object.freeze({ 3: 10, 4: 12, 5: 15, 6: 20 }),
  retriggerScatterCount: 3,
  retriggerSpins: 3,
  scatterPayout: Object.freeze({ 3: 2, 4: 5, 5: 20, 6: 100 }),
  bombMin: 2,
  bombMax: 100
});

function scatterPayout(scatterCount){
  var t = BONUS_RULES.scatterPayout;
  if (scatterCount >= 6) return t[6];
  if (scatterCount >= 5) return t[5];
  if (scatterCount >= 4) return t[4];
  if (scatterCount >= 3) return t[3];
  return 0;
}
function resolveBonusTrigger(scatterCount){
  return scatterCount >= BONUS_RULES.triggerScatterCount;
}
function resolveInitialSpins(scatterCount){
  var t = BONUS_RULES.initialSpins;
  if (scatterCount >= 6) return t[6];
  if (scatterCount >= 5) return t[5];
  if (scatterCount >= 4) return t[4];
  if (scatterCount >= 3) return t[3];
  return 0;
}
function resolveRetrigger(scatterCount){
  if (scatterCount < BONUS_RULES.retriggerScatterCount) return 0;
  return BONUS_RULES.retriggerSpins;
}

var BOMB_VALUE_DIST = Object.freeze([
  Object.freeze({ v: 2, w: 300 }),  Object.freeze({ v: 3, w: 200 }),
  Object.freeze({ v: 4, w: 150 }),  Object.freeze({ v: 5, w: 120 }),
  Object.freeze({ v: 6, w: 80 }),   Object.freeze({ v: 8, w: 80 }),
  Object.freeze({ v: 10, w: 60 }),  Object.freeze({ v: 12, w: 40 }),
  Object.freeze({ v: 15, w: 30 }),  Object.freeze({ v: 20, w: 20 }),
  Object.freeze({ v: 25, w: 15 }),  Object.freeze({ v: 30, w: 10 }),
  Object.freeze({ v: 50, w: 5 }),   Object.freeze({ v: 100, w: 3 })
]);
var BOMB_TOTAL_WEIGHT = BOMB_VALUE_DIST.reduce(function(a,b){ return a + b.w; }, 0);

function rollBombValue(rng){
  if (!rng || typeof rng.randomInt !== 'function'){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'rng with randomInt required');
  }
  var roll = rng.randomInt(BOMB_TOTAL_WEIGHT);
  for (var i = 0; i < BOMB_VALUE_DIST.length; i++){
    if (roll < BOMB_VALUE_DIST[i].w) return BOMB_VALUE_DIST[i].v;
    roll -= BOMB_VALUE_DIST[i].w;
  }
  return 2;
}
function validateBombValue(v){
  if (!Number.isFinite(v)) throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'bomb non-finite');
  if (v < BONUS_RULES.bombMin || v > BONUS_RULES.bombMax){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'bomb out of range');
  }
  return true;
}

window.ApexSugarRushBonus = Object.freeze({
  BONUS_RULES: BONUS_RULES,
  BOMB_VALUE_DIST: BOMB_VALUE_DIST,
  scatterPayout: scatterPayout,
  resolveBonusTrigger: resolveBonusTrigger,
  resolveInitialSpins: resolveInitialSpins,
  resolveRetrigger: resolveRetrigger,
  validateBombValue: validateBombValue,
  rollBombValue: rollBombValue
});
})();
