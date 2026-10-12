'use strict';
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/config/symbols.locked.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var SL = globalThis.window.ApexSymbolsLocked;

// --- mount ---
t('mounted', !!SL);
t('outer frozen', Object.isFrozen(SL));
t('LOCKED frozen', Object.isFrozen(SL.LOCKED));
t('flag true', SL.SYMBOLS_LOCKED === true);

// --- 11 ids exactly ---
var ids = SL.list();
t('11 ids', ids.length === 11, 'got ' + ids.length);
var expected = ['banana','grape','watermelon','plum','apple','blue_candy','green_candy','purple_candy','red_heart_candy','lollipop','multiplier_bomb'];
t('id set exact', expected.every(function(x){return ids.indexOf(x)!==-1;}) && ids.length === expected.length);

// --- kinds ---
var kinds = {};
ids.forEach(function(id){ kinds[SL.kindOf(id)] = (kinds[SL.kindOf(id)]||0)+1; });
t('9 regular', kinds.regular === 9, 'got ' + kinds.regular);
t('1 scatter', kinds.scatter === 1, 'got ' + kinds.scatter);
t('1 multiplier', kinds.multiplier === 1, 'got ' + kinds.multiplier);
t('lollipop is scatter', SL.kindOf('lollipop') === 'scatter');
t('multiplier_bomb is multiplier', SL.kindOf('multiplier_bomb') === 'multiplier');

// --- entry internal consistency ---
var allIdOk = true, allRendererOk = true, paytableOk = true;
ids.forEach(function(id){
  var e = SL.LOCKED[id];
  if (e.id !== id) allIdOk = false;
  if (e.renderer !== 'ApexSymbolsV2') allRendererOk = false;
  if ((e.kind === 'scatter' || e.kind === 'multiplier') && e.paytableKey !== null) paytableOk = false;
});
t('entry.id === key', allIdOk);
t('all renderer = ApexSymbolsV2', allRendererOk);
t('scatter/multiplier paytableKey=null', paytableOk);

// --- API edges ---
t('isLocked known', SL.isLocked('banana') === true);
t('isLocked unknown', SL.isLocked('__nope__') === false);
t('isLocked proto guard', SL.isLocked('toString') === false);
t('kindOf unknown null', SL.kindOf('__nope__') === null);

// --- list returns new array ---
var a = SL.list(); a.push('__mutate__');
t('list new array each call', SL.list().length === 11);

// --- assert throws on mismatch ---
var threw = false;
try { SL.assertSymbolsLocked({ banana: 1 }); } catch (e) { threw = (String(e.message).indexOf('SYMBOLS_LOCKED') === 0); }
t('assert throws on mismatch', threw);

// --- assert passes on same set ---
var ok = false;
try { ok = SL.assertSymbolsLocked(SL.LOCKED); } catch (e) { ok = false; }
t('assert passes on same set', ok === true);

// --- mutation blocked ---
var blocked = false;
try { SL.LOCKED.banana = null; } catch (e) { blocked = true; }
t('LOCKED mutation blocked', blocked || SL.LOCKED.banana !== null);

// --- mirror byte-identical ---
var fs = require('fs');
var s1 = fs.readFileSync(ROOT + '/src/config/symbols.locked.js', 'utf8');
var s2 = fs.readFileSync(ROOT + '/functions/_config/symbols.locked.js', 'utf8');
t('mirror byte-identical', s1 === s2);

console.log('');
console.log('========== config/symbols-locked ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
