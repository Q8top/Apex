'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/config/public-rules.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var R = globalThis.window.ApexPublicRules;

t('mounted', !!R);
t('outer frozen', Object.isFrozen(R));
var keys = Object.keys(R).sort();
var want = ['freeSpinsRules','paytable','rules','showTheoreticalRtp','tumbleRules'];
t('exactly 5 fields', JSON.stringify(keys) === JSON.stringify(want), 'got ' + keys.join(','));
t('rules===true', R.rules === true);
t('paytable===true', R.paytable === true);
t('freeSpinsRules===true', R.freeSpinsRules === true);
t('tumbleRules===true', R.tumbleRules === true);
t('showTheoreticalRtp===false', R.showTheoreticalRtp === false);
var allBool = keys.every(function(k){ return typeof R[k] === 'boolean'; });
t('all values boolean', allBool);

// mutation blocked
var blockThrew = false;
try { R.showTheoreticalRtp = true; } catch (e) { blockThrew = true; }
t('mutation blocked', blockThrew || R.showTheoreticalRtp === false);

// contract: file must NOT leak real profile numbers
var src = fs.readFileSync(ROOT + '/src/config/public-rules.js', 'utf8');
var numericTokens = src.match(/\b\d+\.\d+\b/g) || [];
t('no float literals in file', numericTokens.length === 0, 'got ' + numericTokens.join(','));

// contract: comment marks showTheoreticalRtp as reserved, not live gate
t('comment warns reserved showTheoreticalRtp', src.indexOf('RESERVED') !== -1 && src.indexOf('does NOT by') !== -1);

console.log('');
console.log('========== config/public-rules ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
