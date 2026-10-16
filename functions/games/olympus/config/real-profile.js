// Apex Olympus - real math profile (SERVER ONLY).
// Must never be bundled into client assets. Enforced by the RTP target
// leak scanner (check-no-secret-leak.cjs). Under functions/ so it is
// excluded from Cloudflare Pages static asset deployment.
//
// payScale history (200k x 3 seeds unless noted):
//   0.80  3x100k  range [99.78, 108.43] upper bound far over
//   0.70  3x200k  range [85.82, 89.88]  lower bound broke
//   0.73  3x200k  range [89.50, 93.73]  upper bound at 93.73
//   0.72  3x200k  range [88.28, 92.45]  ok but only marginally
//   0.61  3x200k  range [89.13, 91.57]  historical baseline (stale;
//                 later engine changes broke the assumption)
//   0.61  3x100k+20seed obs RTP=103.4%   sim-confirmed break
//   0.534 20x100k        target RTP=90.5%  V0 (obs 95.1%, +5.1%)
//   0.508 30x100k        target RTP=90.5%  <-- V1 (linear correction)
//                 (whole-session cap now active; D-MULT anchor fix)
//                 V0 pending; 30-seed precision pass deferred
window.OlympusRealProfile = (function () {
  'use strict';
  var REAL = Object.freeze({
    payScale: 0.508,
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
