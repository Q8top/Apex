'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var P = window.ApexSugarRushPayout;
ok(typeof P.calculatePayout === 'function', 'calc exists');
ok(P.calculatePayout(100, 0) === 0, 'mult 0');
ok(P.calculatePayout(1, 0.5) === 0, 'bet 1 mult 0.5 floors');
ok(P.calculatePayout(1, 1.99) === 1, 'bet 1 mult 1.99 -> 1');
ok(P.calculatePayout(100, 0.001) === 0, 'tiny mult floors');
ok(P.calculatePayout(100, 1) === 100, 'mult 1');
ok(P.calculatePayout(100, 2.5) === 250, 'mult 2.5');
ok(P.calculatePayout(100, 1000) === 100000, 'mult 1000');

var threw = false;
try { P.calculatePayout(0, 1); } catch(e){ threw = true; }
ok(threw, 'bet 0 throws');
threw = false;
try { P.calculatePayout(-1, 1); } catch(e){ threw = true; }
ok(threw, 'bet -1 throws');
threw = false;
try { P.calculatePayout(1.5, 1); } catch(e){ threw = true; }
ok(threw, 'bet 1.5 throws');
threw = false;
try { P.calculatePayout(100, -1); } catch(e){ threw = true; }
ok(threw, 'mult -1 throws');
threw = false;
try { P.calculatePayout(100, NaN); } catch(e){ threw = true; }
ok(threw, 'mult NaN throws');
threw = false;
try { P.calculatePayout(100, Infinity); } catch(e){ threw = true; }
ok(threw, 'mult Inf throws');

ok(P.unitsToMinor(1) === 100, 'units 1 -> 100');
ok(P.unitsToMinor(2.50) === 250, 'units 2.5 -> 250');
ok(P.minorToUnits(250) === 2.5, 'minor 250 -> 2.5');
ok(P.unitsToMinor(0.01) === 1, 'units 0.01 -> 1');

ok(P.formatMinor(0) === '0.00', 'fmt 0');
ok(P.formatMinor(50) === '0.50', 'fmt 50');
ok(P.formatMinor(100) === '1.00', 'fmt 100');
ok(P.formatMinor(1000000) === '10,000.00', 'fmt 1M');
ok(P.formatMinor(-150) === '-1.50', 'fmt -150');

var E = window.ApexSugarRushGameEngine;
var b = E.spinBase('real', 100);
ok(Number.isSafeInteger(b.winMinor), 'winMinor safe int');
ok(b.winMinor >= 0, 'winMinor >= 0');
var b2 = E.spinBase('real', 10000 * 100);
ok(Number.isSafeInteger(b2.winMinor), 'max-bet winMinor safe');

console.log('[payout-precision] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
