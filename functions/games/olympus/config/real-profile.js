// Apex Olympus - real math profile (SERVER ONLY).
// Must never be bundled into client assets. Enforced by the RTP target
// leak scanner (check-no-secret-leak.cjs). Under functions/ so it is
// excluded from Cloudflare Pages static asset deployment.
//
// payScale history (5 seeds x 200k unless noted):
//   1.70  5x80k   range [85.52, 90.65]  lower bound broke
//   1.72  5x80k   range [86.52, 91.71]  lower bound broke
//   1.75  5x200k  range [90.49, 94.42]  upper bound broke (94.42)
//   1.71  5x200k  <-- current
window.OlympusRealProfile = (function () {
  'use strict';
  var REAL = Object.freeze({
    payScale: 0.80,
    maxWinX: 5000,
    pityRate: 0.05,
    pityTargetCount: 8,
    pitySymbol: 'sym-8',
    multChance: 0.010,
    targetRtp: Object.freeze({ min: 0.88, max: 0.93, target: 0.905 }),
    targetHitRate: Object.freeze({ min: 0.20, max: 0.35 })
  });
  return Object.freeze({ REAL: REAL });
})();
