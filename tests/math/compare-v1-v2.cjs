/* Apex · 新老引擎对比（离线，只读）
 * 输出：每个场景新老是否一致
 */

// 环境准备
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof global.window === 'undefined') global.window = {};

var ROOT = '/root/projects/Apex';

// ---------- 加载老引擎 ----------
[
  '/src/js/math/paytable.js',
  '/src/js/math/evaluator.js',
  '/src/js/math/tumble.js',
  '/src/js/math/bonus.js',
  '/src/js/inline/sweet-symbols.js',
].forEach(function(p){ require(ROOT + p); });

// ---------- 加载新引擎 ----------
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
].forEach(function(p){ require(ROOT + p); });

var oldEval = window.ApexEvaluator;
var newEval = window.ApexEngineEvaluator;
var oldTumble = window.ApexTumble;
var newTumble = window.ApexEngineTumble;
var oldBonus = window.ApexBonus;
var newBonus = window.ApexEngineBonus;

// 映射表
var K2I = {
  BANANA: 'banana', GRAPE: 'grape', WATERMELON: 'watermelon',
  PLUM: 'plum', APPLE: 'apple',
  BLUE_CANDY: 'blue_candy', GREEN_CANDY: 'green_candy',
  PURPLE_CANDY: 'purple_candy', RED_HEART: 'red_heart_candy',
  LOLLIPOP: 'lollipop', MULTIPLIER: 'multiplier_bomb'
};

var pass = 0, diff = 0;

function banner(s){ console.log('\n=== ' + s + ' ==='); }
function mark(ok){ return ok ? '\u2713' : '\u2717'; }

// ============================================================
// A. Evaluator 对比
// ============================================================
banner('A. Evaluator');

function evalTest(name, gridBig){
  var gridSmall = gridBig.map(function(k){ return K2I[k] || k; });
  var o = oldEval.evaluate(gridBig);
  var n = newEval.evaluate(gridSmall);
  var oSum = oldEval.sumMultiplier(o);
  var nSum = n.payoutMultiplier;
  var ok = (o.length === n.wins.length) && (Math.abs(oSum - nSum) < 1e-9);
  console.log(
    '  ' + mark(ok) + ' ' + name +
    '   老[' + o.length + '胜 ' + oSum.toFixed(3) + ']' +
    '   新[' + n.wins.length + '胜 ' + nSum.toFixed(3) + ']'
  );
  if (ok) pass++; else diff++;
  return ok;
}

// 场景 1：全 banana
evalTest('全 30 banana', new Array(30).fill('BANANA'));

// 场景 2：8 banana + 22 grape
var g2 = [];
for (var i = 0; i < 8; i++) g2.push('BANANA');
for (var j = 8; j < 30; j++) g2.push('GRAPE');
evalTest('8 banana + 22 grape', g2);

// 场景 3：7 banana + 23 grape（banana 不中，grape 中）
var g3 = [];
for (var k = 0; k < 7; k++) g3.push('BANANA');
for (var l = 7; l < 30; l++) g3.push('GRAPE');
evalTest('7 banana + 23 grape', g3);

// 场景 4：混合（每 8+ 都中）
var g4 = [];
var dist = ['BANANA','BANANA','BANANA','BANANA','BANANA','BANANA','BANANA','BANANA',
            'GRAPE','GRAPE','GRAPE','GRAPE','GRAPE','GRAPE','GRAPE','GRAPE',
            'APPLE','APPLE','APPLE','APPLE','APPLE','APPLE','APPLE','APPLE',
            'BLUE_CANDY','BLUE_CANDY','BLUE_CANDY','BLUE_CANDY','BLUE_CANDY','BLUE_CANDY'];
evalTest('3 符号各 8 个', dist);

// 场景 5：4 lollipop
var g5 = dist.slice();
g5[0] = 'LOLLIPOP'; g5[1] = 'LOLLIPOP'; g5[2] = 'LOLLIPOP'; g5[3] = 'LOLLIPOP';
evalTest('含 4 lollipop', g5);

// ============================================================
// B. Tumble 对比
// ============================================================
banner('B. Tumble');

function tumbleTest(name, gridBig, positions){
  var gridSmall = gridBig.map(function(k){ return K2I[k] || k; });
  var oResult = oldTumble.removeAndCompress(gridBig, positions, function(){ return 'APPLE'; });
  var newRng = { pickSymbol: function(){ return 'apple'; } };
  var nResult = newTumble.tumble(gridSmall, positions, newRng);
  var oNorm = oResult.grid.map(function(k){ return K2I[k] || k; });
  var same = oNorm.length === nResult.length;
  if (same) for (var i = 0; i < oNorm.length; i++){
    if (oNorm[i] !== nResult[i]) { same = false; break; }
  }
  console.log('  ' + mark(same) + ' ' + name);
  if (same) pass++; else {
    diff++;
    console.log('    老[0..9]: ' + oNorm.slice(0,10).join(','));
    console.log('    新[0..9]: ' + nResult.slice(0,10).join(','));
  }
}

// 场景 1：全 banana 移除第一行
tumbleTest('全 banana 移除 0~5', new Array(30).fill('BANANA'), [0,1,2,3,4,5]);

// 场景 2：全 banana 移除底部
tumbleTest('全 banana 移除 24~29', new Array(30).fill('BANANA'), [24,25,26,27,28,29]);

// 场景 3：全 banana 中间移除
tumbleTest('全 banana 移除 10,11,12', new Array(30).fill('BANANA'), [10,11,12]);

// 场景 4：混合移除
var g6 = new Array(30).fill('BANANA');
for (var m = 0; m < 10; m++) g6[m] = 'GRAPE';
tumbleTest('混合 grid 移除 0~5', g6, [0,1,2,3,4,5]);

// ============================================================
// C. Bonus 对比
// ============================================================
banner('C. Bonus');

// Scatter 触发
[3,4,5,6].forEach(function(cnt){
  var grid = new Array(30).fill('BANANA');
  for (var i = 0; i < cnt; i++) grid[i] = 'LOLLIPOP';
  var oTr = oldBonus.shouldTrigger(grid);
  var nTr = newBonus.resolveBonusTrigger(cnt);
  var ok = oTr === nTr;
  console.log('  ' + mark(ok) + ' scatter=' + cnt + ' 触发: 老=' + oTr + ' 新=' + nTr);
  if (ok) pass++; else diff++;
});

// ============================================================
// 汇总
// ============================================================
console.log('\n============================================');
console.log('汇总: ' + pass + ' 一致 / ' + diff + ' 差异 / ' + (pass+diff) + ' 总数');
console.log('============================================');

process.exit(diff > 0 ? 1 : 0);
