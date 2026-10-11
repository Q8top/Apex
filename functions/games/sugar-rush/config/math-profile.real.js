(function(){
'use strict';
/* Apex Sugar Rush - math profile (REAL ONLY).
 * P0-3: server-side only. NEVER loaded by browser.
 * Loaded by functions/_sugar-rush-bridge.js
 */
var VERSION = '0.1.0';
var REAL_PROFILE = Object.freeze({
  real: Object.freeze({
    baseWeights: Object.freeze({
      BLUE_CANDY: 22, GREEN_CANDY: 20, PURPLE_CANDY: 18, RED_CANDY: 16,
      STRAWBERRY: 14, ORANGE: 12, MANGO: 5
    }),
    scatterWeight: 1,
    multiplierWeight: 0,
    fsMultiplierWeight: 1,
    payScale: 3.55,
    maxWinMultiplier: 5000,
    pityRate: 0.0,
    pityMin: 0,
    pityRange: 0,
    targetRtp: Object.freeze({ min: 0.88, max: 0.93, target: 0.90 }),
    targetHitRate: Object.freeze({ min: 0.20, max: 0.35 })
  }),
});
window.ApexSugarRushMathProfileReal = Object.freeze({
  VERSION: VERSION,
  getReal: function(){ return REAL_PROFILE.real; }
});
})();
