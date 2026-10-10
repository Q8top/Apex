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

var BOMB_VALUE_DIST = Object.freeze([
  { v: 2, w: 300 }, { v: 3, w: 200 }, { v: 4, w: 150 },
  { v: 5, w: 120 }, { v: 8, w: 80 },  { v: 10, w: 60 },
  { v: 12, w: 40 }, { v: 15, w: 20 }, { v: 20, w: 10 },
  { v: 25, w: 10 }, { v: 50, w: 5 },  { v: 100, w: 5 }
]);
var BOMB_TOTAL_WEIGHT = BOMB_VALUE_DIST.reduce(function (a, b) { return a + b.w; }, 0);

function rollBombValue(rng){
  // P0-6: 加权抽值，rng 需提供 randomInt(max)
  if (!rng || typeof rng.randomInt !== 'function') {
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'rng with randomInt required');
  }
  var roll = rng.randomInt(BOMB_TOTAL_WEIGHT);
  for (var i = 0; i < BOMB_VALUE_DIST.length; i++){
    if (roll < BOMB_VALUE_DIST[i].w) return BOMB_VALUE_DIST[i].v;
    roll -= BOMB_VALUE_DIST[i].w;
  }
  return 2; // unreachable
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
  BOMB_VALUE_DIST: BOMB_VALUE_DIST,
  scatterPayout: scatterPayout,
  resolveBonusTrigger: resolveBonusTrigger,
  resolveRetrigger: resolveRetrigger,
  validateBombValue: validateBombValue,
  rollBombValue: rollBombValue
});
})();
