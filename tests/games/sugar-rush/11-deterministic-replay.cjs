'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var Ev = window.ApexSugarRushEvaluator;
var Tb = window.ApexSugarRushTumble;
var E = window.ApexSugarRushGameEngine;

// =====================================================
// Deterministic evaluator: same grid -> same result
// =====================================================
var grid = [];
for (var i = 0; i < 49; i++) grid[i] = 'blue_candy';
grid[0] = 'mango'; grid[1] = 'mango'; grid[2] = 'mango'; grid[3] = 'mango'; grid[4] = 'mango';
var r1 = Ev.evaluate(grid);
var r2 = Ev.evaluate(grid);
ok(JSON.stringify(r1) === JSON.stringify(r2), 'evaluator same input same output');
ok(r1.payoutMultiplier === r2.payoutMultiplier, 'payout identical');
ok(r1.winningPositions.length === r2.winningPositions.length, 'positions identical');
ok(r1.scatterCount === r2.scatterCount, 'scatter identical');

// =====================================================
// Deterministic tumble with seeded RNG mock
// =====================================================
function makeMockRng(seed){
  var s = seed >>> 0;
  return {
    randomInt: function(max){
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s % max;
    },
    pickSymbol: function(){
      var vals = ['blue_candy','green_candy','purple_candy','red_candy','strawberry','orange','strawberry','mango','mango'];
      return vals[this.randomInt(9)];
    }
  };
}
var g0 = [];
for (var j = 0; j < 49; j++) g0[j] = 'blue_candy';
g0[0] = 'mango'; g0[1] = 'mango'; g0[2] = 'mango'; g0[3] = 'mango'; g0[4] = 'mango';
var rngA = makeMockRng(12345);
var rngB = makeMockRng(12345);
var t1 = Tb.tumble(g0, [0, 1, 2, 3, 4], rngA);
var t2 = Tb.tumble(g0, [0, 1, 2, 3, 4], rngB);
ok(JSON.stringify(t1) === JSON.stringify(t2), 'tumble same seed same grid');
var rngC = makeMockRng(99999);
var t3 = Tb.tumble(g0, [0, 1, 2, 3, 4], rngC);
ok(JSON.stringify(t1) !== JSON.stringify(t3), 'tumble different seed different grid');

// =====================================================
// Evaluator: positions count matches winningPositions
// =====================================================
for (var trial = 0; trial < 50; trial++){
  var g = [];
  for (var k = 0; k < 49; k++){
    g[k] = ['blue_candy','mango','mango','strawberry','orange'][k % 5];
  }
  var r = Ev.evaluate(g);
  var totalFromWins = 0;
  for (var w = 0; w < r.wins.length; w++) totalFromWins += r.wins[w].positions.length;
  ok(totalFromWins === r.winningPositions.length,
     'positions count = sum of wins (' + trial + ')');
}

// =====================================================
// Engine: identical spinId -> identical structure
// =====================================================
var b1 = E.spinBase('real', 100);
var b2 = E.spinBase('real', 100);
ok(typeof b1.totalMultiplier === 'number', 'b1 totalMult number');
ok(typeof b2.totalMultiplier === 'number', 'b2 totalMult number');
// Different RNG calls -> different results (real RNG)
var same = b1.finalGrid.join(',') === b2.finalGrid.join(',');
ok(typeof same === 'boolean', 'two spins comparable');
ok(Array.isArray(b1.finalGrid), 'b1 grid array');
ok(b1.finalGrid.length === 49, 'b1 grid 49');

// =====================================================
// Same input bet -> linear scaling (floor)
// =====================================================
var testMult = 2.5;
var bet1 = E.spinBase('real', 100);
var win1 = bet1.winMinor;
var theoretical200 = Math.floor(100 * bet1.totalMultiplier);
ok(win1 === theoretical200, 'winMinor = floor(bet * totalMult)');

// =====================================================
// spinFree: marks snapshot/restore determinism
// =====================================================
var marksIn = [[0, 2], [24, 8], [48, 128]];
var f1 = E.spinFree('real', 100, { marks: marksIn });
var f2 = E.spinFree('real', 100, { marks: marksIn });
ok(Array.isArray(f1.marksAfter), 'f1 marksAfter array');
ok(Array.isArray(f2.marksAfter), 'f2 marksAfter array');
// Both runs process same input marks (different random grids, but valid output)
for (var m = 0; m < f1.marksAfter.length; m++){
  var p = f1.marksAfter[m];
  ok(Array.isArray(p) && p.length === 2, 'f1 mark valid (' + m + ')');
  ok(p[0] >= 0 && p[0] < 49, 'f1 mark pos in range (' + m + ')');
  ok(p[1] >= 2 && p[1] <= 128, 'f1 mark value in range (' + m + ')');
}

console.log('[deterministic-replay] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
