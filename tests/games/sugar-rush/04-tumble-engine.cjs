'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(cond, name){ if(cond){passed++;} else {failed++; console.log('FAIL: '+name);} }

// ==== tumble.removePositions ====
var T = window.ApexSugarRushTumble;
var G = window.ApexSugarRushGrid;
var grid = [];
for (var i=0; i<49; i++) grid[i] = 'blue_candy';
var removed = T.removePositions(grid, [0, 1, 7]);
ok(removed[0] === null, 'pos 0 null');
ok(removed[1] === null, 'pos 1 null');
ok(removed[7] === null, 'pos 7 null');
ok(removed[2] === 'blue_candy', 'pos 2 untouched');
ok(grid[0] === 'blue_candy', 'original not mutated');

var bad = false;
try { T.removePositions([1,2,3], [0]); } catch(e){ bad = true; }
ok(bad, 'short grid throws');
bad = false;
try { T.removePositions(grid, [999]); } catch(e){ bad = true; }
ok(bad, 'out-of-range pos throws');

// ==== tumble.refillColumns ====
var R = window.ApexSugarRushRng;
var rng = new R.Rng({blue_candy: 1});
var g2 = [];
for (var j=0; j<49; j++) g2[j] = 'blue_candy';
g2[0] = null; g2[7] = null; g2[14] = null;
var filled = T.refillColumns(g2, rng);
ok(filled.length === 49, 'filled length 49');
var hasNull = false;
for (var k=0; k<49; k++){ if (filled[k] === null){ hasNull = true; break; } }
ok(!hasNull, 'no null after refill');
ok(filled[0] === 'blue_candy', 'filled[0] = blue_candy');

// ==== game-engine.spin ====
var E = window.ApexSugarRushGameEngine;
ok(typeof E.spin === 'function', 'spin exported');
ok(typeof E.buildRngForMode === 'function', 'buildRngForMode exported');

var bad2 = false;
try { E.spin('bogus', 100); } catch(e){ bad2 = true; }
ok(bad2, 'unknown mode throws');

var r1 = E.spin('real', 100);
ok(r1.mode === 'real', 'mode=real');
ok(typeof r1.totalMultiplier === 'number', 'totalMultiplier is number');
ok(Number.isFinite(r1.totalMultiplier), 'totalMultiplier finite');
ok(r1.totalMultiplier >= 0, 'totalMultiplier >= 0');
ok(Number.isSafeInteger(r1.winMinor), 'winMinor is safe int');
ok(r1.winMinor >= 0, 'winMinor >= 0');
ok(Array.isArray(r1.finalGrid), 'finalGrid is array');
ok(r1.finalGrid.length === 49, 'finalGrid length 49');
ok(Number.isSafeInteger(r1.cascades), 'cascades int');
ok(r1.cascades >= 0, 'cascades >= 0');
ok(Number.isSafeInteger(r1.scatterCount), 'scatterCount int');
ok(typeof r1.fsTriggered === 'boolean', 'fsTriggered boolean');

// maxWin cap
var r2 = E.spin('real', 100);
ok(r2.totalMultiplier <= 5000, 'real maxWin cap 5000');
var r3 = E.spin('demo', 100);
ok(r3.totalMultiplier <= 25000, 'demo maxWin cap 25000');

// no null in finalGrid across 200 spins
var nullFound = false;
for (var m=0; m<200; m++){
  var rr = E.spin('real', 100);
  for (var n=0; n<rr.finalGrid.length; n++){
    if (rr.finalGrid[n] === null || rr.finalGrid[n] === undefined){ nullFound = true; break; }
  }
  if (nullFound) break;
}
ok(!nullFound, 'no null/undefined in 200 finalGrids');

// RTP sanity over 20000 spins
var total = 0, hits = 0;
for (var p=0; p<20000; p++){
  var s = E.spin('real', 100);
  total += s.winMinor;
  if (s.winMinor > 0) hits++;
}
var rtp = total / (20000 * 100);
var hitRate = hits / 20000;
// P0-7A1: engine now returns ONE layer only (no nested FS).
  // The loose bound below reflects base-only RTP x payScale.
  // Part 8: payScale calibrated. Pool is 7 regular + scatter + bomb.
  // Bound reflects demo engine running with demo payScale (1.55).
  ok(rtp > 0.86 && rtp < 0.95, 'real rtp bound [0.86,0.95] (Part8 calibrated): ' + rtp.toFixed(4));
ok(hitRate > 0.18 && hitRate < 0.40, 'real hitRate in [0.18,0.40]: ' + hitRate.toFixed(4));

console.log('[tumble+engine] passed='+passed+' failed='+failed+' rtp='+rtp.toFixed(4)+' hitRate='+hitRate.toFixed(4));
process.exit(failed > 0 ? 1 : 0);
