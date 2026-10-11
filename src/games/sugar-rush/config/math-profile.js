(function(){
'use strict';
/* Apex Sugar Rush - math profile (DEMO ONLY).
 * P0-3: real parameters physically isolated to math-profile.real.js
 *       (server-only). Do NOT re-add real block here.
 */
var VERSION = '0.2.0';
var PROFILES = Object.freeze({
  demo: Object.freeze({
    baseWeights: Object.freeze({
      BLUE_CANDY: 22, GREEN_CANDY: 20, PURPLE_CANDY: 18, RED_CANDY: 16,
      STRAWBERRY: 14, ORANGE: 12, MANGO: 5
    }),
    scatterWeight: 3,
    multiplierWeight: 0,
    fsMultiplierWeight: 2,
    payScale: 1.55,
    maxWinMultiplier: 25000,
    pityRate: 0.35,
    pityMin: 0.5,
    pityRange: 150,
    targetRtp: Object.freeze({ min: 1.30, max: 2.50, target: 1.78 }),
    targetHitRate: Object.freeze({ min: 0.45, max: 0.60 })
  })
});
var ID_MAP = Object.freeze({
  BLUE_CANDY: 'blue_candy', GREEN_CANDY: 'green_candy',
  PURPLE_CANDY: 'purple_candy', RED_CANDY: 'red_candy',
  STRAWBERRY: 'strawberry', ORANGE: 'orange', CHERRY: 'cherry',
  GRAPE: 'grape', MANGO: 'mango',
  LOLLIPOP: 'lollipop', CANDY_BOMB: 'candy_bomb'
});
function getProfile(mode){
  if (mode !== 'demo'){
    throw new Error('SUGAR_MATH_PROFILE: mode ' + mode + ' not available on client');
  }
  return PROFILES.demo;
}
function buildRngWeights(mode, opts){
  opts = opts || {};
  var p = getProfile(mode);
  var out = {};
  var keys = Object.keys(p.baseWeights);
  for (var i = 0; i < keys.length; i++){
    var id = ID_MAP[keys[i]] || keys[i].toLowerCase();
    out[id] = p.baseWeights[keys[i]];
  }
  if (p.scatterWeight > 0) out.lollipop = p.scatterWeight;
  var mw = opts.fsMode ? p.fsMultiplierWeight : p.multiplierWeight;
  if (mw > 0) out.candy_bomb = mw;
  return out;
}
function validate(){
  var p = PROFILES.demo;
  var keys = Object.keys(p.baseWeights);
  if (keys.length !== 7) throw new Error('SUGAR_MATH_PROFILE: 7 regular required');
  if (!Number.isSafeInteger(p.scatterWeight) || p.scatterWeight < 0) throw new Error('scatterWeight invalid');
  if (!Number.isFinite(p.payScale) || p.payScale <= 0) throw new Error('payScale invalid');
  if (!p.targetRtp || p.targetRtp.min >= p.targetRtp.max) throw new Error('targetRtp invalid');
  return true;
}
window.ApexSugarRushMathProfile = Object.freeze({
  VERSION: VERSION, PROFILES: PROFILES, ID_MAP: ID_MAP,
  getProfile: getProfile, buildRngWeights: buildRngWeights, validate: validate
});
})();
