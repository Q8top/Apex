'use strict';
/* Apex P0-4 redline gate: zero-tolerance real-mode cap. */
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

var SW = [
  'src/config/version.js','src/config/math-profile.js',
  'src/config/symbols.locked.js','src/config/paytable.locked.js',
  'src/engine/errors.js','src/engine/grid.js','src/engine/rng.js',
  'src/engine/multiplier.js','src/engine/evaluator.js',
  'src/engine/tumble.js','src/engine/bonus.js','src/engine/payout.js',
  'src/engine/game-engine.js']
SW.forEach(function(f){ require(path.join(ROOT, f)); });

var SR = [
  'config/symbols.locked.js','config/paytable.locked.js',
  'config/math-profile.js','engine/errors.js','engine/grid.js',
  'engine/rng.js','engine/payout.js','engine/multiplier.js',
  'engine/evaluator.js','engine/tumble.js','engine/bonus.js',
  'engine/cap.js','engine/game-engine.js']
var SR_ROOT = path.join(ROOT, 'src/games/sugar-rush');
// P0-3a: load demo profile, then real profile, then patch getProfile
require(path.join(SR_ROOT, 'config/symbols.locked.js'));
require(path.join(SR_ROOT, 'config/paytable.locked.js'));
require(path.join(SR_ROOT, 'config/math-profile.js'));
require(path.join(ROOT, 'functions/games/sugar-rush/config/math-profile.real.js'));
// P0-3a: emulate server-side merged getProfile (demo + real)
(function(){
  var w = globalThis.window || globalThis;
  var demo = w.ApexSugarRushMathProfile;
  var real = w.ApexSugarRushMathProfileReal;
  if (!real) { throw new Error('real profile not loaded (redline)'); }
  var _idMap = demo.ID_MAP;
  var _getProfile = function(m){
    if (m === 'real') return real.getReal();
    return demo.getProfile(m);
  };
  w.ApexSugarRushMathProfile = Object.freeze({
    VERSION: demo.VERSION, PROFILES: demo.PROFILES, ID_MAP: _idMap,
    buildRngWeights: function(mode, opts){
      opts = opts || {};
      var p = _getProfile(mode);
      var out = {};
      var keys = Object.keys(p.baseWeights);
      for (var i = 0; i < keys.length; i++){
        var id = _idMap[keys[i]] || keys[i].toLowerCase();
        out[id] = p.baseWeights[keys[i]];
      }
      if (p.scatterWeight > 0) out.lollipop = p.scatterWeight;
      var mw = opts.fsMode ? p.fsMultiplierWeight : p.multiplierWeight;
      if (mw > 0) out.candy_bomb = mw;
      return out;
    },
    validate: demo.validate,
    getProfile: _getProfile
  });
})();
// then load engine modules
['engine/errors.js','engine/grid.js','engine/rng.js','engine/payout.js',
 'engine/multiplier.js','engine/evaluator.js','engine/tumble.js',
 'engine/bonus.js','engine/cap.js','engine/game-engine.js']
  .forEach(function(f){ require(path.join(SR_ROOT, f)); });

var SPINS = parseInt(process.argv[2] || '10000', 10);
var SEEDS = parseInt(process.argv[3] || '3', 10);
var REDLINE = 0.94;

function srRun(mode, n){
  var E = globalThis.window.ApexSugarRushGameEngine;
  var MAX_FS = 500;
  var total = 0, hits = 0;
  // P0-7 A2e1: mock server-side FS orchestration using layer-scoped API
  // (spinBase / spinFree + marks_json carried across FS spins).
  for (var i = 0; i < n; i++){
    var base = E.spinBase(mode, 100);
    var spinWin = base.winMinor;
    if (base.fsTriggered){
      var spins = base.fsSpinsAwarded || 10;
      var played = 0;
      var marks = [];
      while (played < spins && played < MAX_FS){
        played++;
        var fr = E.spinFree(mode, 100, { marks: marks });
        spinWin += fr.winMinor;
        marks = fr.marksAfter || [];
        if (fr.fsTriggered){
          spins += fr.fsSpinsAwarded || 0;
        }
      }
    }
    total += spinWin;
    if (spinWin > 0) hits++;
  }
  return { rtp: total / (n * 100), hit: hits / n };
}
function srWorst(mode){
  var worstRtp = 0, worstHit = 0, all = [];
  for (var s = 0; s < SEEDS; s++){
    process.stderr.write('    [SR] seed ' + (s+1) + '/' + SEEDS + ' ...\n');
    var r = srRun(mode, SPINS);
    all.push(r.rtp);
    if (r.rtp > worstRtp) worstRtp = r.rtp;
    if (r.hit > worstHit) worstHit = r.hit;
  }
  return { worstRtp: worstRtp, worstHit: worstHit, all: all };
}

function swRun(mode, n){
  var GE = globalThis.window.ApexEngineGameEngine;
  var RG = globalThis.window.ApexEngineRng;
  var MP = globalThis.window.ApexMathProfile;
  var profile = MP.getProfile(mode);
  var weights = MP.buildRngWeights(mode, { fsMode: false });
  var engine = new GE.GameEngine({ rng: new RG.Rng(weights), maxTumbleSteps: 100, profile: profile });
  var total = 0, hits = 0;
  for (var i = 0; i < n; i++){
    var r = engine.spin({ mode: mode, betMinor: 100,
      spinId: 'redline-' + ('00000000' + i).slice(-8) });
    var winMinor = Math.floor(100 * r.totalMultiplier * profile.payScale);
    total += winMinor;
    if (winMinor > 0) hits++;
  }
  return { rtp: total / (n * 100), hit: hits / n };
}
function swWorst(mode){
  var worstRtp = 0, worstHit = 0, all = [];
  for (var s = 0; s < SEEDS; s++){
    process.stderr.write('    [SW] seed ' + (s+1) + '/' + SEEDS + ' ...\n');
    var r = swRun(mode, SPINS);
    all.push(r.rtp);
    if (r.rtp > worstRtp) worstRtp = r.rtp;
    if (r.hit > worstHit) worstHit = r.hit;
  }
  return { worstRtp: worstRtp, worstHit: worstHit, all: all };
}

console.log('');
console.log('=== REDLINE GATE (zero-tolerance) ===');
console.log('  spins/seed=' + SPINS + '  seeds=' + SEEDS + '  redline=' + REDLINE);
console.log('');
var fails = 0;
function report(t, r, isReal){
  var okRtp, okHit;
  if (isReal){
    okRtp = (r.worstRtp <= REDLINE);
    okHit = (r.worstHit >= 0.20 && r.worstHit <= 0.35);
  } else {
    okRtp = (r.worstRtp >= 1.30 && r.worstRtp <= 2.50);
    okHit = (r.worstHit >= 0.45 && r.worstHit <= 0.60);
  }
  if (!okRtp || !okHit) fails++;
  console.log('  [' + t + ']');
  console.log('    worst-RTP  = ' + r.worstRtp.toFixed(4) + '  ' + (okRtp ? 'PASS' : 'FAIL'));
  console.log('    worst-HIT  = ' + r.worstHit.toFixed(4) + '  ' + (okHit ? 'PASS' : 'FAIL'));
  console.log('    all RTP    = ' + r.all.map(function(v){return v.toFixed(4);}).join('  '));
  console.log('');
}
report('SugarRush/real', srWorst('real'), true);
report('SugarRush/demo', srWorst('demo'), false);
report('Sweet/real', swWorst('real'), true);
report('Sweet/demo', swWorst('demo'), false);
console.log('============================================');
console.log('REDLINE GATE: ' + (fails === 0 ? 'ALL PASS' : fails + ' FAIL'));
console.log('============================================');
process.exit(fails > 0 ? 1 : 0);
