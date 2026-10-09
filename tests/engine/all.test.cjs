'use strict';
/* Apex · 引擎单元测试（9 模块）
 * 加载：IIFE 引擎 → globalThis.window
 * 覆盖：errors / grid / rng / multiplier / evaluator / tumble / bonus / payout / game-engine
 */
var path = require('path');
var ROOT = '/root/projects/Apex';

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

(async function () {
  var files = [
    'src/config/version.js','src/config/math-profile.js',
    'src/config/symbols.locked.js','src/config/paytable.locked.js',
    'src/config/public-rules.js',
    'src/engine/errors.js','src/engine/grid.js','src/engine/rng.js',
    'src/engine/multiplier.js','src/engine/evaluator.js',
    'src/engine/tumble.js','src/engine/bonus.js',
    'src/engine/payout.js','src/engine/game-engine.js'
  ];
  for (var i = 0; i < files.length; i++) {
    await import(path.join(ROOT, files[i]));
  }

  var pass = 0, fail = 0;
  function t(name, cond) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name); }
  }
  function throws(name, fn) {
    try { fn(); t(name, false); } catch (e) { t(name, true); }
  }

  // ============ 1. errors ============
  console.log('\n=== 1) errors ===');
  var E = globalThis.ApexEngineErrors;
  t('mounted', !!E && !!E.CODES && typeof E.ApexError === 'function');
  t('CODES frozen', Object.isFrozen(E.CODES));
  t('INVALID_BET code', E.CODES.INVALID_BET === 'INVALID_BET');
  var err = E.ApexError('X', 'msg');
  t('ApexError instanceof Error', err instanceof Error);
  t('err.code', err.code === 'X');
  t('err.name', err.name === 'ApexError');
  t('err.message', err.message === 'msg');
  t('无 message 用 code', E.ApexError('Y').message === 'Y');

  // ============ 2. grid ============
  console.log('\n=== 2) grid ===');
  var G = globalThis.ApexEngineGrid;
  t('mounted', !!G);
  t('GRID frozen', Object.isFrozen(G.GRID));
  t('columns=6 rows=5 size=30', G.GRID.columns === 6 && G.GRID.rows === 5 && G.GRID.size === 30);
  t('getIndex(0,0)=0', G.getIndex(0,0) === 0);
  t('getIndex(4,5)=29', G.getIndex(4,5) === 29);
  t('getRow(7)=1', G.getRow(7) === 1);
  t('getColumn(7)=1', G.getColumn(7) === 1);
  t('isIndexInside(0)', G.isIndexInside(0) === true);
  t('isIndexInside(29)', G.isIndexInside(29) === true);
  t('isIndexInside(30) false', G.isIndexInside(30) === false);
  t('isIndexInside(-1) false', G.isIndexInside(-1) === false);
  var arr = [1,2,3]; var cl = G.clone(arr); cl[0] = 99;
  t('clone 独立', arr[0] === 1);

  // ============ 3. rng ============
  console.log('\n=== 3) rng ===');
  var R = globalThis.ApexEngineRng;
  t('mounted', !!R && typeof R.randomInt === 'function' && typeof R.Rng === 'function');
  throws('randomInt(0) throws', function(){ R.randomInt(0); });
  throws('randomInt(-1) throws', function(){ R.randomInt(-1); });
  throws('randomInt(1.5) throws', function(){ R.randomInt(1.5); });
  t('randomInt(1)=0', R.randomInt(1) === 0);
  var seen = {};
  for (var j = 0; j < 300; j++) seen[R.randomInt(6)] = 1;
  t('randomInt(6) 覆盖 0~5', Object.keys(seen).length === 6);
  throws('Rng(null) throws', function(){ new R.Rng(null); });
  throws('Rng({}) throws', function(){ new R.Rng({}); });
  throws('Rng 负权重 throws', function(){ new R.Rng({a:-1}); });
  throws('Rng 浮点权重 throws', function(){ new R.Rng({a:1.5}); });
  var r1 = new R.Rng({A: 3, B: 1});
  t('totalWeight=4', r1.totalWeight === 4);
  var counts = {A:0, B:0};
  for (var k = 0; k < 4000; k++) counts[r1.pickSymbol()]++;
  t('3:1 比例合理', counts.A > counts.B * 2 && counts.A < counts.B * 4);
  var r2 = new R.Rng({only: 1});
  t('单权重', r2.pickSymbol() === 'only');
  t('generateGrid 30', r2.generateGrid().length === 30);

  // ============ 4. multiplier ============
  console.log('\n=== 4) multiplier ===');
  var M = globalThis.ApexEngineMultiplier;
  t('mounted', !!M && typeof M.MultiplierState === 'function');
  var ms = new M.MultiplierState();
  t('初始 total=0', ms.total() === 0);
  t('初始 size=0', ms.size() === 0);
  ms.add(3, 5);
  t('add total=5', ms.total() === 5);
  ms.add(3, 100);
  t('同位置覆盖 total=100', ms.total() === 100);
  t('size 仍 1', ms.size() === 1);
  ms.add(7, 2);
  t('第二位置 total=102', ms.total() === 102);
  ms.clear();
  t('clear total=0', ms.total() === 0);
  throws('负位置 throws', function(){ ms.add(-1, 2); });
  throws('负值 throws', function(){ ms.add(0, -1); });
  throws('零值 throws', function(){ ms.add(0, 0); });

  // ============ 5. evaluator ============
  console.log('\n=== 5) evaluator ===');
  var EV = globalThis.ApexEngineEvaluator;
  t('mounted', !!EV && typeof EV.evaluate === 'function');
  throws('null throws', function(){ EV.evaluate(null); });
  throws('[] throws', function(){ EV.evaluate([]); });
  throws('29 throws', function(){ EV.evaluate(new Array(29).fill('banana')); });
  var e1 = EV.evaluate(new Array(30).fill('banana'));
  t('全 banana 1 win', e1.wins.length === 1);
  t('全 banana payout=2', e1.payoutMultiplier === 2);
  t('全 banana 30 中奖位', e1.winningPositions.length === 30);
  var mix = [];
  for (var a = 0; a < 8; a++) mix.push('banana');
  for (var b = 8; b < 30; b++) mix.push('grape');
  var e2 = EV.evaluate(mix);
  t('8+22: 2 wins', e2.wins.length === 2);
  t('8+22: payout=4.25', Math.abs(e2.payoutMultiplier - 4.25) < 1e-9);
  var mix2 = [];
  for (var c = 0; c < 7; c++) mix2.push('banana');
  for (var d = 7; d < 30; d++) mix2.push('grape');
  var e3 = EV.evaluate(mix2);
  t('7 banana 不中', e3.wins.every(function(w){ return w.symbol !== 'banana'; }));
  var sct = mix.slice();
  sct[0] = 'lollipop'; sct[1] = 'lollipop'; sct[2] = 'lollipop'; sct[3] = 'lollipop';
  var e4 = EV.evaluate(sct);
  t('4 scatter 计数', e4.scatterCount === 4);
  t('scatter 不入 wins', e4.wins.every(function(w){ return w.symbol !== 'lollipop'; }));
  var mlt = mix.slice();
  mlt[0] = 'multiplier_bomb'; mlt[1] = 'multiplier_bomb';
  var e5 = EV.evaluate(mlt);
  t('multiplier 收集位置', e5.multiplierPositions.length === 2);
  t('multiplier 不入 wins', e5.wins.every(function(w){ return w.symbol !== 'multiplier_bomb'; }));
  t('lookup(7)=0', EV.lookupPayout({8:1,10:2,12:3}, 7) === 0);
  t('lookup(8)=1', EV.lookupPayout({8:1,10:2,12:3}, 8) === 1);
  t('lookup(11)=2', EV.lookupPayout({8:1,10:2,12:3}, 11) === 2);
  t('lookup(100)=3', EV.lookupPayout({8:1,10:2,12:3}, 100) === 3);
  t('lookup(null)=0', EV.lookupPayout(null, 8) === 0);

  // ============ 6. tumble ============
  console.log('\n=== 6) tumble ===');
  var T = globalThis.ApexEngineTumble;
  t('mounted', !!T && typeof T.tumble === 'function');
  var tg = new Array(30).fill('x');
  var rm = T.removePositions(tg, [0, 5, 29]);
  t('removePositions null 化', rm[0] === null && rm[5] === null && rm[29] === null);
  t('不改原', tg[0] === 'x');
  throws('长度校验', function(){ T.removePositions([1,2,3], [0]); });
  throws('位置校验', function(){ T.removePositions(tg, [99]); });
  var rng2 = new R.Rng({z: 1});
  var g2 = new Array(30).fill('filler');
  for (var e = 1; e < 5; e++) g2[G.getIndex(e, 0)] = null;
  g2[G.getIndex(0,0)] = 'A';
  var refilled = T.refillColumns(g2, rng2);
  t('refillColumns 无 null', refilled.every(function(x){ return x !== null; }));
  t('下落 A 到底部', refilled[G.getIndex(4,0)] === 'A');
  var rng3 = new R.Rng({b: 1});
  var g3 = new Array(30).fill('b');
  g3[G.getIndex(4,0)] = 'a';
  var after = T.tumble(g3, [G.getIndex(4,0)], rng3);
  t('tumble 30 长', after.length === 30);
  t('tumble 无 null', after.every(function(x){ return x !== null; }));
  t('tumble 原 a 消失', after.indexOf('a') < 0);

  // ============ 7. bonus ============
  console.log('\n=== 7) bonus ===');
  var B = globalThis.ApexEngineBonus;
  t('mounted', !!B && typeof B.scatterPayout === 'function');
  t('BONUS_RULES frozen', Object.isFrozen(B.BONUS_RULES));
  t('scatter 3=0', B.scatterPayout(3) === 0);
  t('scatter 4=3', B.scatterPayout(4) === 3);
  t('scatter 5=5', B.scatterPayout(5) === 5);
  t('scatter 6=100', B.scatterPayout(6) === 100);
  t('scatter 10=100', B.scatterPayout(10) === 100);
  t('trigger(3) false', B.resolveBonusTrigger(3) === false);
  t('trigger(4) true', B.resolveBonusTrigger(4) === true);
  t('retrigger(3)=0', B.resolveRetrigger(3) === 0);
  t('retrigger(4)=10', B.resolveRetrigger(4) === 10);
  t('bomb(2) ok', B.validateBombValue(2) === true);
  t('bomb(100) ok', B.validateBombValue(100) === true);
  throws('bomb(1) throws', function(){ B.validateBombValue(1); });
  throws('bomb(101) throws', function(){ B.validateBombValue(101); });
  throws('bomb(NaN) throws', function(){ B.validateBombValue(NaN); });

  // ============ 8. payout ============
  console.log('\n=== 8) payout ===');
  var P = globalThis.ApexEnginePayout;
  t('mounted', !!P && typeof P.calculatePayout === 'function');
  t('calc(200, 2)=400', P.calculatePayout(200, 2) === 400);
  t('calc(200, 0.25)=50', P.calculatePayout(200, 0.25) === 50);
  t('calc(100, 0)=0', P.calculatePayout(100, 0) === 0);
  throws('bet=0 throws', function(){ P.calculatePayout(0, 1); });
  throws('bet 浮点 throws', function(){ P.calculatePayout(1.5, 1); });
  throws('负倍率 throws', function(){ P.calculatePayout(100, -1); });
  throws('NaN 倍率 throws', function(){ P.calculatePayout(100, NaN); });
  t('unitsToMinor(1)=100', P.unitsToMinor(1) === 100);
  t('unitsToMinor(2.50)=250', P.unitsToMinor(2.50) === 250);
  t('minorToUnits(200)=2', P.minorToUnits(200) === 2);
  t('formatMinor(200)=2.00', P.formatMinor(200) === '2.00');
  t('formatMinor(50)=0.50', P.formatMinor(50) === '0.50');
  t('formatMinor(1000000)=10,000.00', P.formatMinor(1000000) === '10,000.00');
  t('formatMinor(150,"Y")=Y1.50', P.formatMinor(150, 'Y') === 'Y1.50');
  t('formatMinor(-200)=-2.00', P.formatMinor(-200) === '-2.00');

  // ============ 9. game-engine ============
  console.log('\n=== 9) game-engine ===');
  var GE = globalThis.ApexEngineGameEngine;
  t('mounted', !!GE && typeof GE.GameEngine === 'function');
  throws('无 rng throws', function(){ new GE.GameEngine({}); });
  var engine = new GE.GameEngine({ rng: new R.Rng({banana: 1}) });
  var res = engine.spin({ mode: 'demo', betMinor: 200, spinId: 'test-0123456789' });
  t('version=1', res.version === 1);
  t('spinId 保留', res.spinId === 'test-0123456789');
  t('mode=demo', res.mode === 'demo');
  t('grid 30', res.grid.length === 30);
  t('grid 无 null', res.grid.every(function(x){ return x !== null; }));
  t('cascades >= 1', res.cascades.length >= 1);
  t('totalMultiplier > 0', res.totalMultiplier > 0);
  t('totalWinMinor 整数', Number.isInteger(res.totalWinMinor));
  t('bonus 字段', !!res.bonus);
  t('diagnostics', !!res.diagnostics);
  throws('mode=xxx throws', function(){ engine.spin({mode: 'xxx', betMinor: 200, spinId: 'test-0123456789'}); });
  throws('bet=0 throws', function(){ engine.spin({mode: 'demo', betMinor: 0, spinId: 'test-0123456789'}); });
  throws('短 spinId throws', function(){ engine.spin({mode: 'demo', betMinor: 200, spinId: 'short'}); });
  var allBan = new Array(30).fill('banana');
  var res2 = engine.spin({mode: 'demo', betMinor: 200, spinId: 'test-0223456789', gridOverride: allBan});
  t('gridOverride 生效', res2.cascades[0].grid.every(function(x){ return x === 'banana'; }));
  var sctGrid = [];
  for (var f = 0; f < 4; f++) sctGrid.push('lollipop');
  for (var g = 0; g < 26; g++) sctGrid.push(['banana','grape','apple','plum','watermelon'][g % 5]);
  var res3 = engine.spin({mode: 'demo', betMinor: 200, spinId: 'test-0323456789', gridOverride: sctGrid});
  t('4 scatter 触发 FS', res3.bonus.triggered === true);
  t('4 scatter awarded 10', res3.bonus.awardedSpins === 10);
  t('4 scatter payout 3', res3.bonus.scatterPayout === 3);
  t('4 scatter 总分 >= 3', res3.totalMultiplier >= 3);
  var eng2 = new GE.GameEngine({ rng: new R.Rng({banana:1,grape:1,apple:1,blue_candy:1,red_heart_candy:1,lollipop:5}) });
  var stable = true;
  for (var h = 0; h < 100; h++) {
    var r = eng2.spin({mode: 'demo', betMinor: 100, spinId: 'test-stable-' + ('00000000' + h).slice(-10)});
    if (r.grid.length !== 30) { stable = false; break; }
    if (r.grid.some(function(x){ return x === null; })) { stable = false; break; }
  }
  t('100 次 spin 稳定', stable);

  console.log('\n============================================');
  console.log('总计 ' + pass + ' 通过 / ' + fail + ' 失败 / ' + (pass+fail) + ' 总数');
  console.log('============================================');
  process.exit(fail > 0 ? 1 : 0);
})().catch(function (e) {
  console.error('FATAL', e.message);
  console.error(e.stack);
  process.exit(1);
});
