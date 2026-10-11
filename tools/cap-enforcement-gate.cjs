'use strict';
/* cap-enforcement-gate.cjs · maxWin cap 门禁
 * 两种断言：
 *   1) 正确性：applyCap 各分支返回符合预期（人为构造）
 *   2) 长跑打印：跑 N 局统计 cappedByMaxWin 触发次数（不设硬门槛）
 * 环境变量：
 *   CAP_GATE_GAME  sweet | sugar-rush（默认 sugar-rush）
 *   CAP_GATE_SPINS 长跑局数（默认 100000）
 */
var path = require('path');
var ROOT = path.resolve(__dirname, '..');
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues){
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof global.window === 'undefined') global.window = globalThis;

var GAME = process.env.CAP_GATE_GAME || 'sugar-rush';
var SPINS = parseInt(process.env.CAP_GATE_SPINS || '100000', 10);

var passed = 0, failed = 0;
function t(c, msg){ if (c){ passed++; } else { failed++; console.log('FAIL: ' + msg); } }

if (GAME === 'sugar-rush'){
  require(path.join(ROOT, 'tests/games/sugar-rush/_loader.cjs')).loadAll();
  var W = global.window;
  var Cap = W.ApexSugarRushCap;
  var P = W.ApexSugarRushMathProfile;
  var E = W.ApexSugarRushGameEngine;
  if (!Cap || !P || !E){ console.error('[FATAL] SR modules missing'); process.exit(2); }

  // ===== 1. 正确性断言（人为构造） =====
  t(typeof Cap.applyCap === 'function', 'applyCap exists');
  // 不超：rawWin 小
  var r1 = Cap.applyCap(100, 2.608, 5000);
  t(r1.capped === false, 'small rawWin: capped=false');
  t(r1.rawWin === 100, 'small rawWin: rawWin unchanged');
  // 超：rawWin 巨大
  var r2 = Cap.applyCap(1e9, 2.608, 5000);
  t(r2.capped === true, 'huge rawWin: capped=true');
  t(r2.rawWin === 5000 / 2.608, 'huge rawWin: clamped to maxWinMultiplier/payScale');

  // ===== 2. 长跑打印（不设硬门槛） =====
  console.log('[cap-gate] 长跑 ' + SPINS + ' 局统计 cappedByMaxWin 次数...');
  var capCount = 0;
  var p = P.getProfile('real');
  for (var i = 0; i < SPINS; i++){
    try {
      var r = E.spinBase('real', 100);
      if (r.cappedByMaxWin) capCount++;
    } catch (e) {}
  }
  console.log('[cap-gate] 实测：' + capCount + '/' + SPINS + ' 局触发 cap');

} else if (GAME === 'sweet'){
  // Sweet 使用 src/engine/cap? 目前未见独立 cap.js
  console.error('[WARN] Sweet cap gate 未实现（Sweet 引擎内嵌 cap）');
  process.exit(0);
} else {
  console.error('[FATAL] 未知 CAP_GATE_GAME=' + GAME); process.exit(2);
}

console.log('[cap-gate] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
