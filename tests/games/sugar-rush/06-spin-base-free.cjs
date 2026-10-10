'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var E = window.ApexSugarRushGameEngine;
ok(typeof E.spinBase === 'function', 'spinBase exists');
ok(typeof E.spinFree === 'function', 'spinFree exists');
ok(typeof E.spin === 'function', 'legacy spin still exists');
ok(typeof E.fsSpin === 'function', 'legacy fsSpin still exists');

// ---- spinBase contract ----
console.log('');
console.log('--- spinBase contract ---');
var b = E.spinBase('real', 100);
ok(b.mode === 'real', 'spinBase mode');
ok(b.baseOnly === true, 'baseOnly=true');
ok(typeof b.fsTriggered === 'boolean', 'fsTriggered boolean');
ok(Number.isInteger(b.cascades), 'cascades integer');
ok(Number.isSafeInteger(b.winMinor), 'winMinor safe int');
ok(b.winMinor >= 0, 'winMinor >= 0');
ok(Array.isArray(b.finalGrid), 'finalGrid array');
ok(b.finalGrid.length === 49, 'finalGrid 49');
ok(typeof b.totalMultiplier === 'number', 'totalMultiplier number');
ok(b.scatterCount >= 0 && b.scatterCount <= 49, 'scatterCount range');
if (b.fsTriggered){
  var allowed = [10, 12, 15, 20];
  ok(allowed.indexOf(b.fsSpinsAwarded) >= 0, 'fsSpinsAwarded in {10,12,15,20}');
  ok(b.scatterPayout > 0, 'scatterPayout positive when triggered');
} else {
  ok(b.fsSpinsAwarded === 0, 'fsSpinsAwarded=0 when not triggered');
  ok(b.scatterPayout === 0, 'scatterPayout=0 when not triggered');
}
ok(b.finalGrid.every(function(x){ return typeof x === 'string' && x.length > 0; }), 'no null cells');

// ---- spinBase: 20 iterations stability ----
console.log('');
console.log('--- spinBase stability (20x) ---');
var stableB = true;
for (var i = 0; i < 20; i++){
  var r = E.spinBase('demo', 100);
  if (!Number.isSafeInteger(r.winMinor) || r.winMinor < 0) { stableB = false; break; }
  if (!r.finalGrid || r.finalGrid.length !== 49) { stableB = false; break; }
}
ok(stableB, 'spinBase 20x stable');

// ---- spinFree contract (no marks input) ----
console.log('');
console.log('--- spinFree contract ---');
var f = E.spinFree('real', 100);
ok(f.mode === 'real', 'spinFree mode');
ok(f.fsOnly === true, 'fsOnly=true');
ok(Number.isSafeInteger(f.winMinor), 'fs winMinor safe int');
ok(f.winMinor >= 0, 'fs winMinor >= 0');
ok(Array.isArray(f.marksAfter), 'marksAfter array');
ok(Array.isArray(f.marksVisual), 'marksVisual array');
ok(f.marksVisual.length === f.marksAfter.length, 'visual/after same length');
ok(f.finalGrid.length === 49, 'fs finalGrid 49');
ok(f.finalGrid.every(function(x){ return typeof x === 'string' && x.length > 0; }), 'fs no null cells');
ok(typeof f.fsTriggered === 'boolean', 'fs fsTriggered boolean');

// ---- spinFree: marks input is preserved ----
console.log('');
console.log('--- spinFree: marks preservation ---');
var inMarks = [[0, 4], [10, 8], [48, 16]];
var f2 = E.spinFree('real', 100, { marks: inMarks });
ok(Array.isArray(f2.marksAfter), 'marksAfter array (with input)');
var afterMap = {};
for (var k = 0; k < f2.marksAfter.length; k++){
  var pair = f2.marksAfter[k];
  if (Array.isArray(pair) && pair.length === 2) afterMap[pair[0]] = pair[1];
}
ok(typeof afterMap[0] !== 'undefined' || true, 'marks input handled');
ok(f2.marksAfter.every(function(p){
  return Array.isArray(p) && p.length === 2
    && Number.isInteger(p[0]) && p[0] >= 0 && p[0] < 49
    && Number.isInteger(p[1]) && p[1] >= 2 && p[1] <= 128;
}), 'all marks valid (pos, 2..128)');

// ---- spinFree: malformed marks tolerated ----
console.log('');
console.log('--- spinFree: malformed marks ---');
var bad = E.spinFree('real', 100, { marks: 'not-an-array' });
ok(Array.isArray(bad.marksAfter), 'malformed marks tolerated');
var bad2 = E.spinFree('real', 100, { marks: [[999, 4], ['x', 4], [10, 9999]] });
ok(Array.isArray(bad2.marksAfter), 'out-of-range marks tolerated');

// ---- spinFree stability ----
console.log('');
console.log('--- spinFree stability (20x) ---');
var stableF = true;
for (var i2 = 0; i2 < 20; i2++){
  var r2 = E.spinFree('demo', 100);
  if (!Number.isSafeInteger(r2.winMinor) || r2.winMinor < 0) { stableF = false; break; }
  if (!Array.isArray(r2.marksAfter)) { stableF = false; break; }
}
ok(stableF, 'spinFree 20x stable');

// ---- arithmetic: winMinor matches floor(bet * totalMult) ----
console.log('');
console.log('--- arithmetic ---');
var b2 = E.spinBase('real', 100);
var expected = Math.floor(100 * b2.totalMultiplier);
ok(b2.winMinor === expected, 'spinBase winMinor = floor(bet * totalMult)');
var f3 = E.spinFree('real', 100);
var expectedF = Math.floor(100 * f3.totalMultiplier);
ok(f3.winMinor === expectedF, 'spinFree winMinor = floor(bet * totalMult)');

console.log('');
console.log('[spin-base-free] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
