'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/config/paytable.locked.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var PL = globalThis.window.ApexPaytableLocked;

// mount / freeze
t('mounted', !!PL);
t('outer frozen', Object.isFrozen(PL));
t('SNAPSHOT frozen', Object.isFrozen(PL.PAYTABLE_SNAPSHOT));
t('MIN_MATCH=5', PL.MIN_MATCH === 5);

// 9 keys exact
var keys = Object.keys(PL.PAYTABLE_SNAPSHOT).sort();
var expected = ['APPLE','BANANA','BLUE_CANDY','GRAPE','GREEN_CANDY','PLUM','PURPLE_CANDY','RED_HEART','WATERMELON'];
t('9 keys exact', JSON.stringify(keys) === JSON.stringify(expected), 'got ' + JSON.stringify(keys));

// each entry frozen + has tiers 8,10,12
var allFrozen = true, tierOk = true;
keys.forEach(function(k){
  var e = PL.PAYTABLE_SNAPSHOT[k];
  if (!Object.isFrozen(e)) allFrozen = false;
  var hs = Object.keys(e).map(Number).sort(function(a,b){return a-b;});
  if (hs.length !== 6 || hs[0] !== 5 || hs[1] !== 6 || hs[2] !== 8 || hs[3] !== 10 || hs[4] !== 12 || hs[5] !== 15) tierOk = false;
});
t('all entries frozen', allFrozen);
t('all tiers [5,6,8,10,12,15]', tierOk);

// cluster contract: MIN_MATCH === lowest tier
var lowest = Infinity;
keys.forEach(function(k){
  Object.keys(PL.PAYTABLE_SNAPSHOT[k]).forEach(function(h){
    var v = Number(h); if (v < lowest) lowest = v;
  });
});
t('MIN_MATCH === lowest tier', PL.MIN_MATCH === lowest, 'MIN_MATCH=' + PL.MIN_MATCH + ' lowest=' + lowest);

// self verify
var selfOk = false;
try { selfOk = PL.verifyAgainst(PL.PAYTABLE_SNAPSHOT); } catch (e) {}
t('self-verify returns true', selfOk === true);

// falsy returns false
t('null -> false', PL.verifyAgainst(null) === false);
t('undefined -> false', PL.verifyAgainst(undefined) === false);
t('0 -> false', PL.verifyAgainst(0) === false);
t('empty string -> false', PL.verifyAgainst('') === false);

// throws on missing
var missThrew = '';
try { var o = Object.assign({}, PL.PAYTABLE_SNAPSHOT); delete o.BANANA; PL.verifyAgainst(o); } catch (e) { missThrew = e.message; }
t('missing -> throws PAYTABLE_MISMATCH', missThrew.indexOf('PAYTABLE_MISMATCH: missing BANANA') === 0, missThrew);

// throws on extra
var extThrew = '';
try { var o2 = Object.assign({}, PL.PAYTABLE_SNAPSHOT, {EXTRA:{8:1}}); PL.verifyAgainst(o2); } catch (e) { extThrew = e.message; }
t('extra -> throws PAYTABLE_MISMATCH: extra EXTRA', extThrew.indexOf('PAYTABLE_MISMATCH: extra EXTRA') === 0, extThrew);

// throws on wrong value
var valThrew = '';
try {
  var o3 = {};
  Object.keys(PL.PAYTABLE_SNAPSHOT).forEach(function(k){
    var src = PL.PAYTABLE_SNAPSHOT[k]; var dst = {};
    Object.keys(src).forEach(function(h){ dst[h] = src[h]; });
    o3[k] = dst;
  });
  o3.BANANA['5'] = 999;
  PL.verifyAgainst(o3);
} catch (e) { valThrew = e.message; }
t('wrong value -> throws', valThrew.indexOf('PAYTABLE_MISMATCH') === 0, valThrew);

// mutation blocked
var blockThrew = false;
try { PL.PAYTABLE_SNAPSHOT.BANANA = null; } catch (e) { blockThrew = true; }
t('SNAPSHOT mutation blocked', blockThrew || PL.PAYTABLE_SNAPSHOT.BANANA !== null);

// mirror byte-identical
var s1 = fs.readFileSync(ROOT + '/src/config/paytable.locked.js', 'utf8');
var s2 = fs.readFileSync(ROOT + '/functions/_config/paytable.locked.js', 'utf8');
t('mirror byte-identical', s1 === s2);

// numeric preservation vs known values (spot check)
t('BANANA[8] present', typeof PL.PAYTABLE_SNAPSHOT.BANANA[8] === 'number');
t('RED_HEART[12]=50', PL.PAYTABLE_SNAPSHOT.RED_HEART[12] === 50);
t('PURPLE_CANDY[10]=10', PL.PAYTABLE_SNAPSHOT.PURPLE_CANDY[10] === 10);

console.log('');
console.log('========== config/paytable-locked ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
