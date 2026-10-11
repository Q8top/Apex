'use strict';
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues){
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof global.window === 'undefined') global.window = globalThis;
var SR = path.join(ROOT, 'src/games/sugar-rush');

// ===== 段 1：先加载 config，patch MathProfile，再加载 engine =====
[
  'config/symbols.locked.js',
  'config/paytable.locked.js',
  'config/math-profile.js'
].forEach(function(f){ require(path.join(SR, f)); });
require(path.join(ROOT, 'functions/games/sugar-rush/config/math-profile.real.js'));
(function(){
  var w = globalThis.window || globalThis;
  var demo = w.ApexSugarRushMathProfile;
  var real = w.ApexSugarRushMathProfileReal;
  if (!real){ throw new Error('SR real profile missing'); }
  var _idMap = demo.ID_MAP;
  var _getProfile = function(m){
    if (m === 'real') return real.getReal();
    if (m === 'demo') return demo.PROFILES.demo;
    throw new Error('SR sim: unknown mode ' + m);
  };
  w.ApexSugarRushMathProfile = Object.freeze({
    VERSION: demo.VERSION,
    PROFILES: demo.PROFILES,
    ID_MAP: _idMap,
    buildRngWeights: function(mode, opts){
      opts = opts || {};
      var p = _getProfile(mode);
      var out = {};
      var keys = Object.keys(p.baseWeights);
      for (var i = 0; i < keys.length; i++){
        out[_idMap[keys[i]] || keys[i].toLowerCase()] = p.baseWeights[keys[i]];
      }
      var sw = (opts.fsMode && typeof p.fsScatterWeight === 'number') ? p.fsScatterWeight : p.scatterWeight;
      if (sw > 0) out.lollipop = sw;
      var mw = opts.fsMode ? p.fsMultiplierWeight : p.multiplierWeight;
      if (mw > 0) out.candy_bomb = mw;
      return out;
    },
    validate: demo.validate,
    getProfile: _getProfile
  });
})();

// ===== 段 2：engine 闭包捕获 patch 后的 MathProfile =====
[
  'engine/errors.js',
  'engine/grid.js',
  'engine/rng.js',
  'engine/payout.js',
  'engine/multiplier.js',
  'engine/evaluator.js',
  'engine/tumble.js',
  'engine/bonus.js',
  'engine/cap.js',
  'engine/game-engine.js'
].forEach(function(f){ require(path.join(SR, f)); });

var W = global.window;
var E = W.ApexSugarRushGameEngine;
var Rng = W.ApexSugarRushRng.Rng;
var MP = W.ApexSugarRushMathProfile;

function parseArgs(){
  var o = { mode: 'real', spins: 100000, scanScatter: false };
  for (var i = 2; i < process.argv.length; i++){
    var a = process.argv[i];
    if (a === '--mode') o.mode = process.argv[++i];
    else if (a === '--spins') o.spins = parseInt(process.argv[++i], 10);
    else if (a === '--scan-scatter') o.scanScatter = true;
    else if (a === '--scatter') o.scatter = parseInt(process.argv[++i], 10);
  }
  return o;
}

function simulate(mode, spins, scatterWeight){
  // 若指定 scatterWeight，临时补丁 getProfile 使其生效
  var _MP = W.ApexSugarRushMathProfile;
  var _origGet = _MP.getProfile;
  var _origBuild = _MP.buildRngWeights;
  if (scatterWeight != null){
    var _patched = Object.freeze({
      VERSION: _MP.VERSION, PROFILES: _MP.PROFILES, ID_MAP: _MP.ID_MAP,
      validate: _MP.validate,
      getProfile: _origGet,
      buildRngWeights: function(mode2, opts){
        opts = opts || {};
        var p = _origGet(mode2);
        var out = {};
        var keys = Object.keys(p.baseWeights);
        for (var i = 0; i < keys.length; i++){
          out[_MP.ID_MAP[keys[i]] || keys[i].toLowerCase()] = p.baseWeights[keys[i]];
        }
        var swv = (opts.fsMode && typeof p.fsScatterWeight === 'number') ? p.fsScatterWeight : p.scatterWeight;
        if (opts.noOverride !== true) swv = scatterWeight;
        if (swv > 0) out.lollipop = swv;
        var mw = opts.fsMode ? p.fsMultiplierWeight : p.multiplierWeight;
        if (mw > 0) out.candy_bomb = mw;
        return out;
      }
    });
    W.ApexSugarRushMathProfile = _patched;
  }
  var rawMultSum = 0, hitCount = 0, fsCount = 0, fsSpinsTotal = 0;
  for (var s = 0; s < spins; s++){
    var b = E.spinBase(mode, 100);
    var rawB = b.rawWinBeforeCap || 0;
    if (scatterWeight != null){
      // 直接调 spinBase 但用不同 scatterWeight：临时补丁
      // 简单方案：把 scatterWeight 用一个局部循环外的环境变量控制（取消，简化为走 config）
    }
    rawMultSum += rawB;
    if (rawB > 0) hitCount++;
    if (b.fsTriggered && b.fsSpinsAwarded > 0){
      fsCount++;
      var remaining = b.fsSpinsAwarded;
      var marks = [];
      var guard = 0;
      while (remaining > 0 && guard < 200){
        var f = E.spinFree(mode, 100, { marks: marks });
        rawMultSum += (f.rawWinBeforeCap || 0);
        marks = f.marksAfter || [];
        remaining--; guard++; fsSpinsTotal++;
        if (f.fsTriggered && f.fsSpinsAwarded > 0){ remaining += f.fsSpinsAwarded; }
      }
    }
  }
  if (scatterWeight != null){ W.ApexSugarRushMathProfile = _MP; }
  return {
    rawRtp: rawMultSum / spins,
    hitRate: hitCount / spins,
    fsRate: fsCount / spins,
    fsInterval: fsCount > 0 ? Math.round(spins / fsCount) : 0,
    avgFsSpins: fsCount > 0 ? fsSpinsTotal / fsCount : 0
  };
}

function pad(s, n){ s = String(s); while (s.length < n) s = ' ' + s; return s; }
function padR(s, n){ s = String(s); while (s.length < n) s = s + ' '; return s; }

var args = parseArgs();
console.log('[sr-sim-v3] mode=' + args.mode + '  spins=' + args.spins);
console.log('─'.repeat(80));
console.log(padR('scatterWeight', 14) + pad('rawRTP', 10) + pad('hitRate', 10) + pad('fsInterval', 12) + pad('fsRate', 10) + pad('avgFsSpins', 12));

var range = args.scanScatter ? [1,2,3,4,5] : (args.scatter != null ? [args.scatter] : [MP.getProfile(args.mode).scatterWeight]);
var results = [];
for (var i = 0; i < range.length; i++){
  var sw = range[i];
  var t0 = Date.now();
  var r = simulate(args.mode, args.spins, sw);
  var ms = Date.now() - t0;
  results.push({ sw: sw, r: r });
  console.log(padR(sw, 14) + pad(r.rawRtp.toFixed(4), 10) + pad(r.hitRate.toFixed(4), 10) + pad('1/' + r.fsInterval, 12) + pad(r.fsRate.toFixed(4), 10) + pad(r.avgFsSpins.toFixed(1), 12) + '  (' + ms + 'ms)');
}
console.log('─'.repeat(80));
console.log('JSON: ' + JSON.stringify(results));
