'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(cond, name){ if(cond){passed++;} else {failed++; console.log('FAIL: '+name);} }

// ==== RNG ====
var R = window.ApexSugarRushRng;
ok(typeof R.randomInt === 'function', 'randomInt exported');
var threw = false;
try { R.randomInt(0); } catch(e){ threw = true; }
ok(threw, 'randomInt(0) throws');
threw = false;
try { R.randomInt(-5); } catch(e){ threw = true; }
ok(threw, 'randomInt(-5) throws');
var r1 = R.randomInt(10);
ok(r1 >= 0 && r1 < 10, 'randomInt(10) in [0,10)');
var bad = false;
try { new R.Rng({}); } catch(e){ bad = true; }
ok(bad, 'Rng({}) throws empty');
var bad2 = false;
try { new R.Rng({a:0}); } catch(e){ bad2 = true; }
ok(bad2, 'Rng weight 0 throws');
var rng = new R.Rng({a:1, b:2, c:3});
ok(rng.totalWeight === 6, 'totalWeight=6');
var g = rng.generateGrid();
ok(g.length === 49, 'generateGrid returns 49');
var allValid = true;
for (var i=0; i<g.length; i++){ if (g[i] !== 'a' && g[i] !== 'b' && g[i] !== 'c'){ allValid = false; break; } }
ok(allValid, 'generateGrid all valid ids');

// ==== Evaluator ====
var Ev = window.ApexSugarRushEvaluator;
ok(typeof Ev.evaluate === 'function', 'evaluate exported');
var bad3 = false;
try { Ev.evaluate([1,2,3]); } catch(e){ bad3 = true; }
ok(bad3, 'evaluate short grid throws');

var grid = [];
for (var i=0; i<49; i++) grid[i] = 'blue_candy';
// 把 index 0,1,7 改成别的，避免全盘都是 blue
grid[0]='mango'; grid[1]='mango'; grid[2]='mango'; grid[3]='mango'; grid[4]='mango'; grid[5]='mango'; grid[6]='mango';
var r = Ev.evaluate(grid);
ok(r.wins.length >= 1, 'cluster detected');
ok(r.payoutMultiplier > 0, 'payout > 0');

// 空盘：所有位置都不一样，不成簇
var g2 = [];
var syms = ['blue_candy','green_candy','purple_candy','red_candy','strawberry','orange','cherry','grape','mango'];
for (var j=0; j<49; j++) g2[j] = syms[j % 9];
var r2 = Ev.evaluate(g2);
ok(r2.payoutMultiplier === 0, 'checkerboard no wins');

// scatter 计数
var g3 = [];
for (var k=0; k<49; k++) g3[k] = 'blue_candy';
g3[0] = 'lollipop'; g3[1] = 'lollipop'; g3[2] = 'lollipop';
var r3 = Ev.evaluate(g3);
ok(r3.scatterCount === 3, 'scatterCount=3');

// multiplier 位置
var g4 = [];
for (var l=0; l<49; l++) g4[l] = 'blue_candy';
g4[10] = 'candy_bomb'; g4[20] = 'candy_bomb';
var r4 = Ev.evaluate(g4);
ok(r4.multiplierPositions.length === 2, '2 multiplier positions');
ok(r4.multiplierPositions[0] === 10 && r4.multiplierPositions[1] === 20, 'multiplier positions correct');

console.log('[rng+evaluator] passed='+passed+' failed='+failed);
process.exit(failed > 0 ? 1 : 0);
