'use strict';
/* Apex · Simulator V2（新引擎 + SeededRng）
 * Node CJS 模块，只用于本地/CI 模拟，不进产品代码。
 *
 * 用法：
 *   var sim = require('./simulator-v2.cjs');
 *   var r = sim.simulate({ mode:'real', spins:100000, betMinor:100, seed:'v1' });
 */

var ROOT = require('path').resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues){
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof global.window === 'undefined') global.window = {};

// 加载引擎（顺序敏感）
[
  '/src/config/version.js',
  '/src/config/math-profile.js',
  '/src/config/symbols.locked.js',
  '/src/config/paytable.locked.js',
  '/src/engine/errors.js',
  '/src/engine/grid.js',
  '/src/engine/rng.js',
  '/src/engine/multiplier.js',
  '/src/engine/evaluator.js',
  '/src/engine/tumble.js',
  '/src/engine/bonus.js',
  '/src/engine/payout.js',
  '/src/engine/game-engine.js'
].forEach(function(p){ require(ROOT + p); });

var SeededRng = require(ROOT + '/tests/math/seeded-rng.cjs').SeededRng;
var MP = global.window.ApexMathProfile;
var GE = global.window.ApexEngineGameEngine;
var EV = global.window.ApexEngineEvaluator;
var SL = global.window.ApexSymbolsLocked;

function injectPity(grid, symbol, minCount){
  var g = grid.slice();
  var cur = 0;
  for (var i = 0; i < g.length; i++) if (g[i] === symbol) cur++;
  var need = minCount - cur;
  if (need <= 0) return g;
  for (var j = 0; j < g.length && need > 0; j++){
    if (g[j] !== symbol){ g[j] = symbol; need--; }
  }
  return g;
}

function simulate(opts){
  opts = opts || {};
  var mode = opts.mode || 'real';
  var spins = opts.spins | 0;
  var betMinor = opts.betMinor | 0;
  var seed = opts.seed == null ? 'v1' : opts.seed;
  if (spins <= 0) throw new Error('SIM_V2: spins must be > 0');
  if (betMinor <= 0) throw new Error('SIM_V2: betMinor must be > 0');

  var profile = MP.getProfile(mode);
  var payScale = opts.payScale == null ? profile.payScale : opts.payScale;
  var pityRate = opts.pityRate == null ? profile.pityRate : opts.pityRate;
  var pitySymbol = profile.pitySymbol ? profile.pitySymbol.toLowerCase() : null;
  if (pitySymbol && !SL.isLocked(pitySymbol)) pitySymbol = null;
  var weights = opts.weights || MP.buildRngWeights(mode);

  var rng = new SeededRng(seed, weights);
  var engine = new GE.GameEngine({ rng: rng, maxTumbleSteps: 100 });

  var wagered = 0, paid = 0, hits = 0, bonusTriggers = 0;
  var cappedRounds = 0, totalTumbles = 0;
  var wins = new Array(spins);
  var maxWinUnits = 0;

  for (var i = 0; i < spins; i++){
    var gridOverride = null;
    if (pityRate > 0 && pitySymbol){
      var g0 = rng.generateGrid();
      var ev = EV.evaluate(g0);
      if (ev.winningPositions.length === 0 && rng.randomInt(10000) < (pityRate * 10000)){
        gridOverride = injectPity(g0, pitySymbol, profile.pityMinCount || 8);
      } else {
        gridOverride = g0;
      }
    }
    var res = engine.spin({
      mode: mode, betMinor: betMinor, spinId: 'sim-' + String(i).padStart(12, '0'),
      gridOverride: gridOverride
    });
    wagered += betMinor;
    var winMinor = Math.floor(betMinor * res.totalMultiplier * payScale);
    paid += winMinor;
    wins[i] = winMinor / betMinor;
    if (winMinor > 0) hits++;
    if (res.bonus.triggered) bonusTriggers++;
    if (res.diagnostics.terminatedBySafetyLimit) cappedRounds++;
    totalTumbles += res.diagnostics.tumbleCount;
    if (wins[i] > maxWinUnits) maxWinUnits = wins[i];
  }

  wins.sort(function(a, b){ return a - b; });
  function q(p){ return wins.length ? wins[Math.floor(p * (wins.length - 1))] : 0; }

  return {
    mode: mode, spins: spins, seed: seed,
    betMinor: betMinor,
    wagered: wagered, paid: paid,
    rtp: paid / wagered,
    hitRate: hits / spins,
    bonusRate: bonusTriggers / spins,
    avgTumbles: totalTumbles / spins,
    cappedRounds: cappedRounds,
    maxWinUnits: maxWinUnits,
    median: q(0.5), p95: q(0.95), p99: q(0.99)
  };
}

function verify(simResult){
  return global.window.ApexMathProfile.checkSimResult(simResult.mode, simResult);
}

module.exports = { simulate: simulate, verify: verify };
