// Apex Olympus - DEMO math profile (client).
// Real parameters live in functions/games/olympus/config/real-profile.js
// (server-only). Enforced by check-no-secret-leak.cjs: no RTP targets,
// no payScale bounds, no RTP target ranges in client code.
window.OlympusMathProfile = (function () {
  'use strict';

  var DEMO = Object.freeze({
    payScale: 0.510,
    maxWinX: 25000,
    pityRate: 0.45,
    pityTargetCount: 8,
    pitySymbol: 'sym-8',
    multChance: 0.015,
    maxSteps: 40
  });

  function getProfile(mode) {
    if (mode === 'demo') return DEMO;
    if (mode === 'real') {
      throw new Error('OlympusMathProfile: real profile is server-only');
    }
    throw new Error('OlympusMathProfile: unknown mode ' + mode);
  }

  return Object.freeze({ DEMO: DEMO, getProfile: getProfile });
})();
