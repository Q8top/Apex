'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var E = window.ApexSugarRushGameEngine;
var Ev = window.ApexSugarRushEvaluator;
var Tb = window.ApexSugarRushTumble;
var M = window.ApexSugarRushMultiplier;

function bench(label, fn, minOpsPerSec){
  var t0 = Date.now();
  var n = fn();
  var ms = Date.now() - t0;
  var ops = n / (ms / 1000);
  var okFlag = ops >= minOpsPerSec;
  ok(okFlag, label + ': ' + n + ' ops in ' + ms + 'ms (' +
     Math.round(ops) + '/s, threshold ' + minOpsPerSec + '/s)');
  return { n: n, ms: ms, ops: Math.round(ops) };
}

// =====================================================
// spinBase throughput
// =====================================================
var N_BASE = 5000;
var r1 = bench('spinBase throughput', function(){
  for (var i = 0; i < N_BASE; i++) E.spinBase('real', 100);
  return N_BASE;
}, 300);

// =====================================================
// spinFree throughput
// =====================================================
var N_FREE = 2000;
var r2 = bench('spinFree throughput', function(){
  for (var j = 0; j < N_FREE; j++) E.spinFree('real', 100);
  return N_FREE;
}, 100);

// =====================================================
// evaluator throughput
// =====================================================
var grid = [];
for (var k = 0; k < 49; k++) grid[k] = ['blue_candy','grape','mango','strawberry','orange'][k % 5];
var N_EVAL = 50000;
var r3 = bench('evaluator throughput', function(){
  for (var m = 0; m < N_EVAL; m++) Ev.evaluate(grid);
  return N_EVAL;
}, 3000);

// =====================================================
// tumble throughput
// =====================================================
var g2 = [];
for (var n = 0; n < 49; n++) g2[n] = 'blue_candy';
g2[0] = 'grape'; g2[1] = 'grape'; g2[2] = 'grape'; g2[3] = 'grape'; g2[4] = 'grape';
var mockRng = {
  randomInt: function(max){ return (12345 * (max + 1)) % max; },
  pickSymbol: function(){ return 'blue_candy'; }
};
var N_TB = 20000;
var r4 = bench('tumble throughput', function(){
  for (var p = 0; p < N_TB; p++){
    var tmp = [];
    for (var q = 0; q < 49; q++) tmp[q] = 'blue_candy';
    tmp[0] = 'grape'; tmp[1] = 'grape'; tmp[2] = 'grape'; tmp[3] = 'grape'; tmp[4] = 'grape';
    Tb.tumble(tmp, [0, 1, 2, 3, 4], mockRng);
  }
  return N_TB;
}, 5000);

// =====================================================
// MarkState throughput
// =====================================================
var N_MS = 100000;
var r5 = bench('MarkState.set/get throughput', function(){
  var st = new M.MarkState();
  for (var s = 0; s < N_MS; s++){
    st.set(s % 49, 2);
    st.get(s % 49);
  }
  return N_MS * 2;
}, 200000);

// =====================================================
// evaluator determinism benchmark: same input same time envelope
// =====================================================
var times = [];
for (var t = 0; t < 10; t++){
  var t0 = Date.now();
  for (var u = 0; u < 5000; u++) Ev.evaluate(grid);
  times.push(Date.now() - t0);
}
var maxT = Math.max.apply(null, times);
var minT = Math.min.apply(null, times);
ok(maxT < minT * 5 + 100, 'evaluator timing stable: min=' + minT + ' max=' + maxT + 'ms');

console.log('[performance-benchmark] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
