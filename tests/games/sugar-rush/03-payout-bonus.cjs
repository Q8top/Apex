'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(cond, name){ if(cond){passed++;} else {failed++; console.log('FAIL: '+name);} }

// ==== payout ====
var P = window.ApexSugarRushPayout;
ok(typeof P.calculatePayout === 'function', 'calculatePayout exported');
var bad = false;
try { P.calculatePayout(0, 1); } catch(e){ bad = true; }
ok(bad, 'bet 0 throws');
bad = false;
try { P.calculatePayout(100, -1); } catch(e){ bad = true; }
ok(bad, 'negative mult throws');
ok(P.calculatePayout(100, 2.5) === 250, 'bet=100 mult=2.5 = 250');
ok(P.calculatePayout(100, 0) === 0, 'bet=100 mult=0 = 0');
ok(P.unitsToMinor(2.5) === 250, 'unitsToMinor(2.5)=250');
ok(P.minorToUnits(250) === 2.5, 'minorToUnits(250)=2.5');
ok(P.formatMinor(250) === '2.50', 'formatMinor(250)=2.50');
ok(P.formatMinor(-150) === '-1.50', 'formatMinor(-150)=-1.50');
ok(P.formatMinor(1000000) === '10,000.00', 'formatMinor(1000000) thousand separator');

// ==== multiplier ====
var M = window.ApexSugarRushMultiplier;
ok(typeof M.MultiplierState === 'function', 'MultiplierState exported');
var ms = new M.MultiplierState();
ok(ms.size() === 0, 'init size=0');
ok(ms.total() === 0, 'init total=0');
ms.add(5, 10);
ms.add(10, 25);
ok(ms.size() === 2, 'after add size=2');
ok(ms.total() === 35, 'total=35');
ms.add(5, 50);
ok(ms.total() === 75, 'overwrite pos 5: total=75');
var snap = ms.snapshot();
ok(snap.length === 2, 'snapshot len=2');
ms.clear();
ok(ms.size() === 0, 'after clear size=0');
bad = false;
try { ms.add(-1, 5); } catch(e){ bad = true; }
ok(bad, 'negative position throws');
bad = false;
try { ms.add(0, 0); } catch(e){ bad = true; }
ok(bad, 'zero value throws');

// ==== bonus ====
var B = window.ApexSugarRushBonus;
ok(typeof B.resolveBonusTrigger === 'function', 'resolveBonusTrigger exported');
ok(B.resolveBonusTrigger(0) === false, '0 scatter no trigger');
ok(B.resolveBonusTrigger(2) === false, '2 scatter no trigger');
ok(B.resolveBonusTrigger(3) === true, '3 scatter trigger');
ok(B.resolveBonusTrigger(6) === true, '6 scatter trigger');
ok(B.resolveInitialSpins(3) === 10, '3 scatter -> 10 spins');
ok(B.resolveInitialSpins(4) === 12, '4 scatter -> 12');
ok(B.resolveInitialSpins(5) === 15, '5 scatter -> 15');
ok(B.resolveInitialSpins(6) === 20, '6 scatter -> 20');
ok(B.resolveInitialSpins(7) === 20, '7 scatter -> 20 (cap)');
ok(B.scatterPayout(3) === 2, 'scatter payout 3 = 2');
ok(B.scatterPayout(4) === 5, 'scatter payout 4 = 5');
ok(B.scatterPayout(5) === 20, 'scatter payout 5 = 20');
ok(B.scatterPayout(6) === 100, 'scatter payout 6 = 100');
ok(B.resolveRetrigger(2) === 0, '2 scatter no retrigger');
ok(B.resolveRetrigger(3) === 3, '3 scatter retrigger +3');

// bomb roll
var R = window.ApexSugarRushRng;
var rng = new R.Rng({a:1});
var seen = {};
for (var i=0; i<2000; i++){
  var v = B.rollBombValue(rng);
  seen[v] = (seen[v] || 0) + 1;
  if (v < 2 || v > 100){ ok(false, 'bomb value out of range: '+v); break; }
}
ok(Object.keys(seen).length >= 5, 'bomb dist varied: ' + Object.keys(seen).length);
ok(!!seen[2], 'bomb value 2 appears');

console.log('[payout+mult+bonus] passed='+passed+' failed='+failed);
process.exit(failed > 0 ? 1 : 0);
