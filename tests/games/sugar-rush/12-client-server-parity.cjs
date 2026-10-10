'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var E = window.ApexSugarRushGameEngine;
var MP = window.ApexSugarRushMathProfile;
var P = window.ApexSugarRushPayout;

// =====================================================
// Client (engine) vs server (engine) share the same module
// so both must produce identical contracts
// =====================================================
var profileReal = MP.getProfile('real');
var profileDemo = MP.getProfile('demo');

// Contract: fields the server relies on from spinBase/spinFree
var b = E.spinBase('real', 100);
ok(typeof b.winMinor === 'number', 'winMinor present');
ok(typeof b.totalMultiplier === 'number', 'totalMultiplier present');
ok(typeof b.cascades === 'number', 'cascades present');
ok(typeof b.scatterCount === 'number', 'scatterCount present');
ok(typeof b.fsTriggered === 'boolean', 'fsTriggered present');
ok(typeof b.fsSpinsAwarded === 'number', 'fsSpinsAwarded present');
ok(typeof b.cappedByMaxWin === 'boolean', 'cappedByMaxWin present');
ok(Array.isArray(b.finalGrid), 'finalGrid present');
ok(b.finalGrid.length === 49, 'finalGrid length 49');

var f = E.spinFree('real', 100);
ok(typeof f.winMinor === 'number', 'fs winMinor present');
ok(typeof f.totalMultiplier === 'number', 'fs totalMultiplier present');
ok(Array.isArray(f.marksAfter), 'fs marksAfter present');
ok(Array.isArray(f.marksVisual), 'fs marksVisual present');
ok(typeof f.fsTriggered === 'boolean', 'fs fsTriggered present');
ok(typeof f.fsSpinsAwarded === 'number', 'fs fsSpinsAwarded present');
ok(Array.isArray(f.finalGrid), 'fs finalGrid present');
ok(f.finalGrid.length === 49, 'fs finalGrid 49');

// =====================================================
// payScale applied consistently
// =====================================================
var maxDiffRatio = 0;
for (var i = 0; i < 50; i++){
  var s = E.spinBase('real', 100);
  var expected = Math.floor(100 * s.totalMultiplier);
  if (s.winMinor !== expected){
    ok(false, 'real payScale mismatch: ' + s.winMinor + ' vs ' + expected);
    break;
  }
}
ok(true, 'real payScale applied consistently (50 spins)');

for (var j = 0; j < 50; j++){
  var d = E.spinBase('demo', 100);
  var expectedD = Math.floor(100 * d.totalMultiplier);
  if (d.winMinor !== expectedD){
    ok(false, 'demo payScale mismatch: ' + d.winMinor + ' vs ' + expectedD);
    break;
  }
}
ok(true, 'demo payScale applied consistently (50 spins)');

// =====================================================
// marks_json round-trip (server persistence layer)
// =====================================================
var marksOut = [[5, 4], [20, 16], [45, 64]];
var json = JSON.stringify(marksOut);
var parsed = JSON.parse(json);
ok(Array.isArray(parsed), 'marks JSON parses to array');
ok(parsed.length === 3, '3 entries preserved');
ok(parsed[0][0] === 5 && parsed[0][1] === 4, 'entry 0 preserved');
ok(parsed[2][0] === 45 && parsed[2][1] === 64, 'entry 2 preserved');

// Feed back to engine
var round = E.spinFree('real', 100, { marks: parsed });
ok(Array.isArray(round.marksAfter), 'round-trip marksAfter array');
for (var k = 0; k < round.marksAfter.length; k++){
  var pk = round.marksAfter[k];
  ok(Array.isArray(pk) && pk.length === 2 && pk[0] >= 0 && pk[0] < 49,
     'round-trip mark valid (' + k + ')');
}

// =====================================================
// i18n keys exist (server-side not needed, but frontend)
// =====================================================
var I = window.ApexI18n;
if (I){
  var keys = ['sr.title', 'sr.balance', 'sr.btn.spin', 'sr.btn.auto', 'sr.toast.insufficient'];
  for (var kk = 0; kk < keys.length; kk++){
    var v = I.t(keys[kk]);
    ok(v !== keys[kk], 'i18n key ' + keys[kk] + ' resolved');
  }
} else {
  ok(true, 'i18n not loaded in test env (skipped)');
}

console.log('[client-server-parity] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
