'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/engine/errors.js');
require(ROOT + '/src/engine/payout.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var P = globalThis.window.ApexEnginePayout;
var E = globalThis.window.ApexEngineErrors;

t('mounted', !!P);
t('frozen', Object.isFrozen(P));
t('4 fns', ['calculatePayout','unitsToMinor','minorToUnits','formatMinor'].every(function(k){return typeof P[k]==='function';}));

t('(200, 2)=400', P.calculatePayout(200, 2) === 400);
t('(200, 0.25)=50', P.calculatePayout(200, 0.25) === 50);
t('(100, 0)=0', P.calculatePayout(100, 0) === 0);
t('(200, 0.5)=100', P.calculatePayout(200, 0.5) === 100);
t('Math.floor SW policy (100, 0.255)=25', P.calculatePayout(100, 0.255) === 25);

var cpBad = [[0,1],[-1,1],[1.5,1],['100',1],[null,1],[100,-1],[100,NaN],[100,Infinity],[100,'x']];
cpBad.forEach(function(pair, i){
  var ok = false;
  try { P.calculatePayout(pair[0], pair[1]); } catch (e) { ok = (e.name === 'ApexError'); }
  t('calculatePayout rejects #' + i, ok);
});

var of1 = false;
try { P.calculatePayout(Number.MAX_SAFE_INTEGER, 2); } catch (e) { of1 = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('MAX_SAFE overflow throws', of1);
var of2 = false;
try { P.calculatePayout(10000000000, 10000000000); } catch (e) { of2 = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('1e10*1e10 throws', of2);

t('unitsToMinor(1)=100', P.unitsToMinor(1) === 100);
t('unitsToMinor(1.5)=150', P.unitsToMinor(1.5) === 150);
t('unitsToMinor(2.50)=250', P.unitsToMinor(2.50) === 250);
t('unitsToMinor(1,100)=100', P.unitsToMinor(1, 100) === 100);
t('unitsToMinor(1,1000)=1000', P.unitsToMinor(1, 1000) === 1000);

[0, -1, 1.5, 'a', null, NaN, Infinity].forEach(function(s, i){
  var ok = false;
  try { P.unitsToMinor(1, s); } catch (e) { ok = (e.code === E.CODES.INVALID_BET); }
  t('unitsToMinor rejects scale #' + i, ok);
});
var un = false;
try { P.unitsToMinor(NaN); } catch (e) { un = (e.code === E.CODES.INVALID_BET); }
t('unitsToMinor rejects NaN units', un);

t('minorToUnits(150)=1.5', P.minorToUnits(150) === 1.5);
t('minorToUnits(200)=2', P.minorToUnits(200) === 2);
t('minorToUnits(150,100)=1.5', P.minorToUnits(150, 100) === 1.5);
t('minorToUnits(1000,1000)=1', P.minorToUnits(1000, 1000) === 1);
var mn = false;
try { P.minorToUnits(1.5); } catch (e) { mn = (e.code === E.CODES.INVALID_BET); }
t('minorToUnits rejects non-int', mn);
[0, -1].forEach(function(s, i){
  var ok = false;
  try { P.minorToUnits(150, s); } catch (e) { ok = (e.code === E.CODES.INVALID_BET); }
  t('minorToUnits rejects scale #' + i, ok);
});

t('formatMinor(200)=2.00', P.formatMinor(200) === '2.00');
t('formatMinor(50)=0.50', P.formatMinor(50) === '0.50');
t('formatMinor(1)=0.01', P.formatMinor(1) === '0.01');
t('formatMinor(0)=0.00', P.formatMinor(0) === '0.00');
t('formatMinor(1000000)=10,000.00', P.formatMinor(1000000) === '10,000.00');
t('formatMinor(-12345)=-123.45', P.formatMinor(-12345) === '-123.45');
t('formatMinor(12345,Y)=Y123.45', P.formatMinor(12345, 'Y') === 'Y123.45');
t('formatMinor(1e9)=10,000,000.00', P.formatMinor(1000000000) === '10,000,000.00');
var fm = false;
try { P.formatMinor(1.5); } catch (e) { fm = (e.code === E.CODES.INVALID_BET); }
t('formatMinor rejects non-int', fm);

var s1 = fs.readFileSync(ROOT + '/src/engine/payout.js', 'utf8');
var s2 = fs.readFileSync(ROOT + '/functions/_engine/payout.js', 'utf8');
t('mirror byte-identical', s1 === s2);
t('comment: SW Math.floor', s1.indexOf('Math.floor(betMinor * multiplier)') !== -1);
t('comment: no stale round claim', s1.indexOf('Math.round(betMinor') === -1);
t('comment: SR divergence', s1.indexOf('Math.floor') !== -1);
t('comment: scale rejection', s1.indexOf('scale=0 and negative') !== -1);
t('comment: overflow policy', s1.indexOf('MAX_SAFE_INTEGER') !== -1);

console.log('');
console.log('========== engine/payout ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
