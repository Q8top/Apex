'use strict';
/* tools/sweet-sim.cjs · Sweet Bonanza 标定模拟器
 * 用法：
 *   node tools/sweet-sim.cjs --mode real --spins 200000 --no-payscale --scan-scatter
 *   node tools/sweet-sim.cjs --mode demo --spins 200000 --no-payscale --scan-scatter
 * 输出：每档 scatterWeight 的 rawRTP / hitRate / fsInterval
 */
var path = require('path');
var ROOT = path.resolve(__dirname, '..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues){
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof global.window === 'undefined') global.window = globalThis;

[
  'src/config/version.js',
  'src/config/math-profile.js',
  'src/config/symbols.locked.js',
  'src/config/paytable.locked.js',
  'src/engine/errors.js',
  'src/engine/grid.js',
  'src/engine/rng.js',
  'src/engine/multiplier.js',
  'src/engine/evaluator.js',
  'src/engine/tumble.js',
  'src/engine/bonus.js',
  'src/engine/payout.js',
  'src/engine/game-engine.js'
].forEach(function(f){ require(path.join(ROOT, f)); });

var W = global.window;
var GE = W.ApexEngineGameEngine.GameEngine;
var Rng = W.ApexEngineRng.Rng;
var MP = W.ApexMathProfile;

function parseArgs(){
  var o = { mode: 'real', spins: 200000, scanScatter: false };
  for (var i = 2; i < process.argv.length; i++){
    var a = process.argv[i];
    if (a === '--mode') o.mode = process.argv[++i];
    else if (a === '--spins') o.spins = parseInt(process.argv[++i], 10);
    else if (a === '--no-payscale') o.noPayscale = true;
    else if (a === '--scan-scatter') o.scanScatter = true;
  }
  return o;
}

function makeWeights(mode, scatterWeight, fsMode){
  var p = MP.getProfile(mode);
  var out = {};
  var keys = Object.keys(p.baseWeights);
  for (var i = 0; i < keys.length; i++){
    var id = MP.ID_MAP[keys[i]] || keys[i].toLowerCase();
    out[id] = p.baseWeights[keys[i]];
  }
  if (scatterWeight > 0) out.lollipop = scatterWeight;
  if (fsMode && p.fsMultiplierWeight > 0) out.multiplier_bomb = p.fsMultiplierWeight;
  return out;
}

function simulate(mode, spins, scatterWeight){
  var p = MP.getProfile(mode);
  var wBase = makeWeights(mode, scatterWeight, false);
  var wFs = makeWeights(mode, scatterWeight, true);
  var rngBase = new Rng(wBase);
  var rngFs = new Rng(wFs);
  var engBase = new GE({ rng: rngBase, profile: p });
  var engFs = new GE({ rng: rngFs, profile: p });
  var rawMultSum = 0;
  var hitCount = 0;
  var fsCount = 0;
  var maxRaw = 0;
  var fsSpinsTotal = 0;
  for (var s = 0; s < spins; s++){
    var sid = 'sweet-sim-' + s + '-' + scatterWeight + '-xxxxxxxx';
    var r = engBase.spin({ mode: mode, betMinor: 100, spinId: sid, isFree: false });
    var rawMult = r.rawMultiplier || 0;
    if (rawMult > 0) hitCount++;
    if (r.bonus && r.bonus.triggered){
      fsCount++;
      var remaining = r.bonus.awardedSpins;
      var guard = 0;
      while (remaining > 0 && guard < 1000){
        remaining--;
        guard++;
        var fs = engFs.spin({ mode: mode, betMinor: 100, spinId: sid + '-fs-' + guard + 'xxxxxxxx', isFree: true });
        rawMult += (fs.rawMultiplier || 0);
        fsSpinsTotal++;
        if (fs.bonus && fs.bonus.triggered){ remaining += 5; }
      }
    }
    rawMultSum += rawMult;
    if (rawMult > maxRaw) maxRaw = rawMult;
  }
  return {
    rawRtp: rawMultSum / spins,
    hitRate: hitCount / spins,
    fsInterval: fsCount > 0 ? Math.round(spins / fsCount) : 0,
    fsRate: fsCount / spins,
    avgFsSpins: fsCount > 0 ? fsSpinsTotal / fsCount : 0,
    maxRaw: maxRaw
  };
}

function pad(s, n){ s = String(s); while (s.length < n) s = ' ' + s; return s; }
function padR(s, n){ s = String(s); while (s.length < n) s = s + ' '; return s; }

var args = parseArgs();
console.log('[sweet-sim] mode=' + args.mode + '  spins=' + args.spins + '  scan-scatter=' + args.scanScatter);
console.log('─'.repeat(72));
console.log(padR('scatterWeight', 14) + pad('rawRTP', 10) + pad('hitRate', 10) + pad('fsInterval', 12) + pad('fsRate', 10) + pad('avgFsSpins', 12) + pad('maxRaw', 10));

var range = args.scanScatter ? [1,2,3,4,5] : [MP.getProfile(args.mode).scatterWeight];
var results = [];
for (var i = 0; i < range.length; i++){
  var sw = range[i];
  var t0 = Date.now();
  var r = simulate(args.mode, args.spins, sw);
  var ms = Date.now() - t0;
  results.push({ sw: sw, r: r });
  var line = padR(sw, 14) + pad(r.rawRtp.toFixed(4), 10) + pad(r.hitRate.toFixed(4), 10) + pad('1/' + r.fsInterval, 12) + pad(r.fsRate.toFixed(4), 10) + pad(r.avgFsSpins.toFixed(1), 12) + pad(r.maxRaw.toFixed(1), 10) + '  (' + ms + 'ms)';
  console.log(line);
}

console.log('─'.repeat(72));
console.log('JSON: ' + JSON.stringify(results));
