'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var B = window.ApexSugarRushBonus;

// trigger thresholds
ok(B.resolveBonusTrigger(0) === false, '0 no trigger');
ok(B.resolveBonusTrigger(2) === false, '2 no trigger');
ok(B.resolveBonusTrigger(3) === true, '3 triggers');
ok(B.resolveBonusTrigger(4) === true, '4 triggers');
ok(B.resolveBonusTrigger(6) === true, '6 triggers');
ok(B.resolveBonusTrigger(10) === true, '10 triggers');

// initial spins by scatter count
ok(B.resolveInitialSpins(0) === 0, '0 -> 0 spins');
ok(B.resolveInitialSpins(2) === 0, '2 -> 0 spins');
ok(B.resolveInitialSpins(3) === 10, '3 -> 10');
ok(B.resolveInitialSpins(4) === 12, '4 -> 12');
ok(B.resolveInitialSpins(5) === 15, '5 -> 15');
ok(B.resolveInitialSpins(6) === 20, '6 -> 20');
ok(B.resolveInitialSpins(7) === 20, '7 -> 20 (cap)');
ok(B.resolveInitialSpins(10) === 20, '10 -> 20 (cap)');

// retrigger
ok(B.resolveRetrigger(0) === 0, 'retrig 0');
ok(B.resolveRetrigger(2) === 0, 'retrig 2');
ok(B.resolveRetrigger(3) === 3, 'retrig 3 -> +3');
ok(B.resolveRetrigger(5) === 3, 'retrig 5 -> +3');
ok(B.resolveRetrigger(10) === 3, 'retrig 10 -> +3');

// scatter payout
ok(B.scatterPayout(0) === 0, 'scatter 0');
ok(B.scatterPayout(2) === 0, 'scatter 2');
ok(B.scatterPayout(3) === 2, 'scatter 3 -> 2x');
ok(B.scatterPayout(4) === 5, 'scatter 4 -> 5x');
ok(B.scatterPayout(5) === 20, 'scatter 5 -> 20x');
ok(B.scatterPayout(6) === 100, 'scatter 6 -> 100x');
ok(B.scatterPayout(10) === 100, 'scatter 10 -> 100x (cap)');

// engine: spinBase reports fsSpinsAwarded correctly
var E = window.ApexSugarRushGameEngine;
var hits = { triggered: 0, awarded10: 0, awarded12: 0, awarded15: 0, awarded20: 0 };
for (var i = 0; i < 500; i++){
  var b = E.spinBase('demo', 100);
  if (b.fsTriggered){
    hits.triggered++;
    if (b.fsSpinsAwarded === 10) hits.awarded10++;
    else if (b.fsSpinsAwarded === 12) hits.awarded12++;
    else if (b.fsSpinsAwarded === 15) hits.awarded15++;
    else if (b.fsSpinsAwarded === 20) hits.awarded20++;
  }
}
ok(hits.triggered > 0, 'demo 500 spins: some FS triggered: ' + hits.triggered);
ok(hits.awarded10 + hits.awarded12 + hits.awarded15 + hits.awarded20 === hits.triggered,
   'all triggered spins report valid awarded');
ok(true, 'distribution: 10=' + hits.awarded10 + ' 12=' + hits.awarded12 +
         ' 15=' + hits.awarded15 + ' 20=' + hits.awarded20);

// spinFree also detects retrigger
var retrigCount = 0;
for (var j = 0; j < 500; j++){
  var f = E.spinFree('demo', 100);
  if (f.fsTriggered){
    retrigCount++;
    ok(f.fsSpinsAwarded === 3, 'spinFree retrigger awards 3 (' + j + ')');
  }
}
ok(true, 'demo 500 FS spins: ' + retrigCount + ' retriggers detected');

// FS spin does NOT charge bet (winMinor independent of bet semantics)
for (var k = 0; k < 20; k++){
  var f2 = E.spinFree('real', 100);
  ok(Number.isSafeInteger(f2.winMinor), 'FS winMinor safe int (' + k + ')');
}

console.log('[free-spin-rules] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
