'use strict';
/* 2.B.4 B4-6-4: username lookups must be case-insensitive. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
function r(p){ return fs.readFileSync(ROOT + '/' + p, 'utf8'); }

const reg    = r('functions/api/register.js');
const login  = r('functions/api/login.js');
const sc     = r('functions/api/passkey/signup-challenge.js');
const sv     = r('functions/api/passkey/signup-verify.js');

let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok   ' + n); pass++; } else { console.log('  FAIL ' + n); fail++; } }

console.log('=== case-insensitive username lookups ===');
t('register uses LOWER(username)', /LOWER\(username\)\s*=\s*LOWER\(\?\)/.test(reg));
t('login uses LOWER(username)', /LOWER\(username\)\s*=\s*LOWER\(\?\)/.test(login));
t('signup-challenge uses LOWER(username)', /LOWER\(username\)\s*=\s*LOWER\(\?\)/.test(sc));
t('signup-verify uses LOWER(username)', /LOWER\(username\)\s*=\s*LOWER\(\?\)/.test(sv));
t('signup-verify email also lowered', /LOWER\(email\)\s*=\s*LOWER\(\?\)/.test(sv));

console.log('');
console.log('[b4-6-4] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
