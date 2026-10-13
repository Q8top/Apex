'use strict';
/* P1-M3: engine / spin.js / demo-adapter must agree on payout rounding. */
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
if (!globalThis.crypto) globalThis.crypto = require('crypto').webcrypto;
if (typeof global.window === 'undefined') global.window = {};

[
  '/src/config/version.js','/src/config/math-profile.js',
  '/src/config/symbols.locked.js','/src/config/paytable.locked.js',
  '/src/engine/errors.js','/src/engine/grid.js','/src/engine/rng.js',
  '/src/engine/multiplier.js','/src/engine/evaluator.js','/src/engine/tumble.js',
  '/src/engine/bonus.js','/src/engine/payout.js','/src/engine/game-engine.js',
  '/functions/_config/math-profile.js'
].forEach(p => require(path.join(ROOT, p)));

const srv = global.window.ApexMathProfile;
const sProfiles = srv.PROFILES;
global.window.ApexMathProfile = Object.freeze({
  PROFILES: sProfiles,
  ID_MAP: global.window.ApexMathProfile.ID_MAP,
  getProfile: m => sProfiles[m],
  buildRngWeights: srv.buildRngWeights
});

const GE = global.window.ApexEngineGameEngine;
const SR = require(path.join(ROOT, 'tests/math/seeded-rng.cjs')).SeededRng;

const PRECISION_SCALE = 1e6;
const PRECISION_DIVISOR = 1000000n;
function toFixedBig(x){ return BigInt(Math.round(x * PRECISION_SCALE)); }
function calcWinMinorFixed(betMinor, mult){
  const product = BigInt(betMinor) * toFixedBig(mult);
  return Number(product / PRECISION_DIVISOR);
}

let pass = 0, fail = 0;
function t(n, c, e){ if (c){ console.log('  ok   ' + n); pass++; } else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); } }

const profile = sProfiles['real'];
const rng = new SR('m3-parity', srv.buildRngWeights('real'));
const engine = new GE.GameEngine({ rng, maxTumbleSteps: 100, profile });
const betMinor = 100;

console.log('=== rounding parity (engine == spin.js == demo) ===');
let n = 0, allSame = true, worstSpin = 0, worstDemo = 0;
for (let i = 0; i < 300; i++){
  const spinId = 'm3-parity-' + String(i).padStart(8, '0');
  const res = engine.spin({ mode: 'real', betMinor, spinId });
  if (res.totalWinMinor <= 0) continue;
  n++;
  const ev = res.totalWinMinor;
  const sv = calcWinMinorFixed(betMinor, res.totalMultiplier);
  const dv = Math.floor(betMinor * res.totalMultiplier);
  if (ev !== sv){ allSame = false; const d = Math.abs(ev-sv); if (d>worstSpin) worstSpin=d; }
  if (ev !== dv){ allSame = false; const d = Math.abs(ev-dv); if (d>worstDemo) worstDemo=d; }
}
t('sampled ' + n + ' wins', n > 30);
t('engine == spin.js for all samples', worstSpin === 0, 'worst=' + worstSpin + ' cent');
t('engine == demo-adapter for all samples', worstDemo === 0, 'worst=' + worstDemo + ' cent');
t('all three paths identical', allSame);

console.log('');
console.log('[m3-rounding-parity] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
