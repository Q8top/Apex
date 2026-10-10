'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var E = window.ApexSugarRushGameEngine;
var MP = window.ApexSugarRushMathProfile;
var Cap = window.ApexSugarRushCap;

// cap.js contract
ok(typeof Cap.applyCap === 'function', 'applyCap exists');
var r1 = Cap.applyCap(1000, 2.5, 5000);
ok(r1.rawWin === 1000 && r1.capped === false, 'no cap under limit');
ok(Math.abs(r1.rawCap - 2000) < 1e-9, 'rawCap = 5000/2.5 = 2000');

var r2 = Cap.applyCap(3000, 2.5, 5000);
ok(r2.rawWin === 2000, 'capped at rawCap');
ok(r2.capped === true, 'capped flag');

var r3 = Cap.applyCap(2000, 2.5, 5000);
ok(r3.rawWin === 2000 && r3.capped === false, 'exact cap not flagged');

var threw = false;
try { Cap.applyCap(-1, 2.5, 5000); } catch(e){ threw = true; }
ok(threw, 'reject negative rawWin');
threw = false;
try { Cap.applyCap(100, 0, 5000); } catch(e){ threw = true; }
ok(threw, 'reject zero payScale');
threw = false;
try { Cap.applyCap(100, 2.5, 0); } catch(e){ threw = true; }
ok(threw, 'reject zero maxWinMultiplier');

// engine: real vs demo max-win values
var profileReal = MP.getProfile('real');
var profileDemo = MP.getProfile('demo');
ok(profileReal.maxWinMultiplier === 5000, 'real max 5000');
ok(profileDemo.maxWinMultiplier === 25000, 'demo max 25000');

// Run many base spins, check winMinor <= bet * maxWin * payScale
var capRealHit = 0;
for (var i = 0; i < 200; i++){
  var b = E.spinBase('real', 100);
  var theoreticalMax = 100 * profileReal.maxWinMultiplier;
  ok(b.winMinor <= theoreticalMax, 'spinBase winMinor <= max (' + i + ')');
  if (b.cappedByMaxWin) capRealHit++;
}

var capDemoHit = 0;
for (var j = 0; j < 200; j++){
  var d = E.spinBase('demo', 100);
  var theoreticalMaxDemo = 100 * profileDemo.maxWinMultiplier;
  ok(d.winMinor <= theoreticalMaxDemo, 'spinBase demo winMinor <= max (' + j + ')');
  if (d.cappedByMaxWin) capDemoHit++;
}
ok(true, 'real cap hits in 200: ' + capRealHit);
ok(true, 'demo cap hits in 200: ' + capDemoHit);

// spinFree also capped
for (var k = 0; k < 100; k++){
  var f = E.spinFree('real', 100);
  ok(f.winMinor <= 100 * profileReal.maxWinMultiplier, 'spinFree winMinor <= max (' + k + ')');
}

console.log('[max-win-cap] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
