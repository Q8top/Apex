'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var E = window.ApexSugarRushGameEngine;
var M = window.ApexSugarRushMultiplier;

// =====================================================
// Long run: 5000 spins, no drift, no leak, no NaN
// =====================================================
var nanFound = false, negFound = false, nullGridFound = false;
var totalWin = 0;
for (var i = 0; i < 5000; i++){
  var b = E.spinBase('real', 100);
  if (!Number.isFinite(b.winMinor)) { nanFound = true; break; }
  if (b.winMinor < 0) { negFound = true; break; }
  if (b.finalGrid.some(function(x){ return x == null || typeof x !== 'string'; })){
    nullGridFound = true; break;
  }
  totalWin += b.winMinor;
}
ok(!nanFound, 'no NaN over 5000 spins');
ok(!negFound, 'no negative winMinor over 5000 spins');
ok(!nullGridFound, 'no null cells over 5000 spins');
ok(totalWin > 0, 'cumulative win > 0 over 5000 spins');

// =====================================================
// Long run spinFree: 3000 spins, marks bounded
// =====================================================
var badMarkFound = false;
for (var j = 0; j < 3000; j++){
  var f = E.spinFree('demo', 100);
  for (var k = 0; k < f.marksAfter.length; k++){
    var p = f.marksAfter[k];
    if (!Array.isArray(p) || p.length !== 2 ||
        p[0] < 0 || p[0] >= 49 || p[1] < 2 || p[1] > 128){
      badMarkFound = true; break;
    }
  }
  if (badMarkFound) break;
}
ok(!badMarkFound, 'all marks bounded over 3000 FS spins');

// =====================================================
// MarkState: no leak / no cross-instance contamination
// =====================================================
var instances = [];
for (var m = 0; m < 100; m++){
  var st = new M.MarkState();
  st.set(m % 49, 2);
  instances.push(st);
}
var allIndependent = true;
for (var n = 0; n < 100; n++){
  if (instances[n].get(n % 49) !== 2) { allIndependent = false; break; }
}
ok(allIndependent, '100 MarkState instances independent');

// =====================================================
// No JSON serialization blowup
// =====================================================
var st2 = new M.MarkState();
for (var p2 = 0; p2 < 49; p2 += 4) st2.set(p2, 4);
var snap = st2.snapshot();
var jsonLen = JSON.stringify(snap).length;
ok(jsonLen < 1000, 'marks snapshot JSON < 1KB: ' + jsonLen + 'B');
ok(snap.length === 13, '13 marks snapshot');

// =====================================================
// Repeated spin on same engine: no accumulation
// =====================================================
var engine = E;
var firstGrid = engine.spinBase('real', 100).finalGrid.join(',');
for (var q = 0; q < 200; q++) engine.spinBase('real', 100);
var laterGrid = engine.spinBase('real', 100).finalGrid.join(',');
ok(firstGrid !== laterGrid, 'engine state not accumulated (grids differ across runs)');

console.log('[long-run-stability] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
