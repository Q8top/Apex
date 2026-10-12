'use strict';
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/config/version.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var V = globalThis.window.ApexVersion;
t('mounted', !!V);
t('frozen', V && Object.isFrozen(V.VERSION));
var keys = V ? Object.keys(V.VERSION) : [];
t('5 fields', keys.length === 5, 'got ' + keys.length);
var semver = /^\d+\.\d+\.\d+$/;
t('game semver', semver.test(V.VERSION.game));
t('math semver', semver.test(V.VERSION.math));
t('symbols semver', semver.test(V.VERSION.symbols));
t('asset semver', semver.test(V.VERSION.asset));
t('protocol non-empty', typeof V.VERSION.protocol === 'string' && V.VERSION.protocol.length > 0);
var threw = false;
try { V.VERSION.game = 'zzz'; } catch (e) { threw = true; }
t('mutation blocked', threw || V.VERSION.game === '1.0.0', 'threw=' + threw + ' got=' + V.VERSION.game);
// mirror byte-identical
var fs = require('fs');
var src = fs.readFileSync(ROOT + '/src/config/version.js', 'utf8');
var mir = fs.readFileSync(ROOT + '/functions/_config/version.js', 'utf8');
t('mirror byte-identical', src === mir, 'src_len=' + src.length + ' mir_len=' + mir.length);

console.log('');
console.log('========== config/version ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
