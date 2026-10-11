'use strict';
/* Apex · RTP Gate（CI 门禁）
 *
 * 跑小样本（默认 5 万局 × 2 模式），比对 ApexMathProfile 目标区间。
 * 任何模式超区间 → 退出码 1，CI 变红。
 *
 * 用法：
 *   node tests/math/rtp-gate.cjs              # 默认 5 万局
 *   node tests/math/rtp-gate.cjs 200000       # 20 万局（慢，手动用）
 *   RTP_GATE_SPINS=10000 node tests/math/rtp-gate.cjs
 */

var sim;
var MP  = (function(){
  if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues){
    globalThis.crypto = require('crypto').webcrypto;
  }
  if (typeof global.window === 'undefined') global.window = {};
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
  ].forEach(function(p){ require(require('path').resolve(__dirname, '../..') + p); });
  // S1.6: 客户端 profile 已不含 real；加载服务端 profile 并合并（模拟服务端）
  var ROOT2 = require('path').resolve(__dirname, '../..');
  require(ROOT2 + '/functions/_config/math-profile.js');
  var serverMP = global.window.ApexMathProfile;
  require(ROOT2 + '/src/config/math-profile.js');
  var clientMP = global.window.ApexMathProfile;
  // 用服务端的 PROFILES 重建
  var _merged = Object.freeze({
    VERSION: serverMP.VERSION,
    PROFILES: serverMP.PROFILES,
    ID_MAP: clientMP.ID_MAP,
    validate: serverMP.validate,
    totalWeight: serverMP.totalWeight,
    checkSimResult: serverMP.checkSimResult,
    getProfile: function(m){
      if (!Object.prototype.hasOwnProperty.call(serverMP.PROFILES, m)){
        throw new Error('MATH_PROFILE: unknown mode ' + m);
      }
      return serverMP.PROFILES[m];
    },
    buildRngWeights: serverMP.buildRngWeights
  });
  global.window.ApexMathProfile = _merged;
  return _merged;
})();

// S1.6-fix: sim 必须在 merged 之后加载（sim 内部闭包捕获 MP）
sim = require(__dirname + '/simulator-v2.cjs');

var argSpins = process.argv[2] ? parseInt(process.argv[2], 10) : null;
var envSpins = process.env.RTP_GATE_SPINS ? parseInt(process.env.RTP_GATE_SPINS, 10) : null;
var SPINS = argSpins || envSpins || 50000;

if (!Number.isSafeInteger(SPINS) || SPINS <= 0){
  console.error('RTP_GATE: spins must be positive integer, got', SPINS);
  process.exit(2);
}

var MODES = ['real', 'demo'];
var fail = 0;

console.log('============================================================');
console.log('Apex · RTP Gate');
console.log('  spins/mode = ' + SPINS.toLocaleString());
console.log('  math version = ' + MP.VERSION);
console.log('============================================================');

MODES.forEach(function(mode){
  var t0 = Date.now();
  var result = sim.simulate({
    mode: mode,
    spins: SPINS,
    betMinor: 100,
    seed: 'gate-' + mode + '-' + SPINS
  });
  var elapsed = Date.now() - t0;
  var v = MP.checkSimResult(mode, result);

  var profile = MP.getProfile(mode);
  console.log();
  console.log('[' + mode + ']');
  console.log('  RTP       = ' + result.rtp.toFixed(4) +
              '   目标 [' + profile.targetRtp.min + ', ' + profile.targetRtp.max + ']');
  console.log('  HitRate   = ' + result.hitRate.toFixed(4) +
              '   目标 [' + profile.targetHitRate.min + ', ' + profile.targetHitRate.max + ']');
  console.log('  BonusRate = ' + result.bonusRate.toFixed(4));
  console.log('  MaxWin    = ' + result.maxWinUnits.toFixed(2) + 'x');
  console.log('  P99       = ' + result.p99.toFixed(2) + 'x');
  console.log('  耗时      = ' + elapsed + ' ms');
  console.log('  PASS      = ' + (v.ok ? 'YES' : 'NO'));

  if (!v.ok){
    v.reasons.forEach(function(r){ console.log('    ! ' + r); });
    fail++;
  }
});

console.log();
console.log('============================================================');
if (fail === 0){
  console.log('RTP GATE: PASS (' + MODES.length + ' modes)');
  process.exit(0);
} else {
  console.log('RTP GATE: FAIL (' + fail + '/' + MODES.length + ' modes failed)');
  process.exit(1);
}
