'use strict';
/* P1-M1: ID_MAP miss must throw on BOTH client and server. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');

const client = fs.readFileSync(ROOT + '/src/config/math-profile.js', 'utf8');
const server = fs.readFileSync(ROOT + '/functions/_config/math-profile.js', 'utf8');

let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok   ' + n); pass++; } else { console.log('  FAIL ' + n); fail++; } }

console.log('=== ID_MAP miss policy (client == server) ===');

// client: var id = ID_MAP[k]; if (!id) throw ...
t('client reads ID_MAP[k] without fallback', /var id = ID_MAP\[k\];/.test(client));
t('client throws on miss', /if \(!id\) throw new Error\('MATH_PROFILE: no ID_MAP entry/.test(client));

// server: must have been changed from silent fallback to throw
t('server no longer uses k.toLowerCase() fallback', !/ID_MAP\[k\]\s*\|\|\s*k\.toLowerCase\(\)/.test(server));
t('server reads ID_MAP[k] without fallback', /var id = ID_MAP\[k\];/.test(server));
t('server throws on miss', /if \(!id\) throw new Error\('MATH_PROFILE: no ID_MAP entry/.test(server));

console.log('');
console.log('[m1-idmap] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
