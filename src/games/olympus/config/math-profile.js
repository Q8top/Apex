// Apex Olympus - math profile (CLIENT, demo only).
// Real parameters live in functions/games/olympus/config/real-profile.js
// (server-only). The client engine must NOT contain real RTP targets,
// payScale, or maxWin values - enforced by check-no-secret-leak.cjs.
window.OlympusMathProfile = (function () {
  'use strict';
  var DEMO = Object.freeze({
    payScale: 1.83,
    maxWinX: 25000,
    pityRate: 0.45,
    pityTargetCount: 8,
    pitySymbol: 'sym-8',
    multChance: 0.015
  });
  function getProfile(mode) {
    if (mode === 'demo') return DEMO;
    if (mode === 'real') {
      // Real parameters are server-only. Client must never receive them.
      throw new Error('OlympusMathProfile: real profile is server-only');
    }
    throw new Error('OlympusMathProfile: unknown mode ' + mode);
  }
  return Object.freeze({ DEMO: DEMO, getProfile: getProfile });
})();
