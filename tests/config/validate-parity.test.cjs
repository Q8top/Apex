'use strict';
/* P1-M2: server validate() must mirror client hardening. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const srv = fs.readFileSync(ROOT + '/functions/_config/math-profile.js', 'utf8');

let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok   ' + n); pass++; } else { console.log('  FAIL ' + n); fail++; } }

console.log('=== server validate() hardening ===');
t('ID_MAP coverage check present', /ID_MAP missing/.test(srv));
t('scatterWeight W_MAX check', /scatterWeight > W_MAX_SC/.test(srv) || /scatterWeight > 10000/.test(srv));
t('multiplierWeight W_MAX check', /multiplierWeight > W_MAX_SC/.test(srv) || /multiplierWeight > 10000/.test(srv));
t('fsMultiplierWeight W_MAX check', /fsMultiplierWeight > W_MAX_SC/.test(srv) || /fsMultiplierWeight > 10000/.test(srv));
t('maxWinMultiplier positive-int check', /maxWinMultiplier must be positive integer/.test(srv));
t('payScale TODO documented (deferred)', /TODO\(M-series\): server payScale upper bound/.test(srv));

// anti-regression: server must NOT enforce client-only threshold 10
t('no client-threshold-10 leak into server', !/payScale > 10\b/.test(srv));

console.log('');
console.log('[m2-validate-parity] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
