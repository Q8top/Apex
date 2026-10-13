'use strict';
/* 2.B.4 B4-3: recover-verify must rate-limit by email dimension. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const src = fs.readFileSync(ROOT + '/functions/api/passkey/recover-verify.js', 'utf8');
let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok   ' + n); pass++; } else { console.log('  FAIL ' + n); fail++; } }

console.log('=== recover-verify email-dimension rate-limit ===');
t('imports enforceKeyRateLimit', /enforceKeyRateLimit/.test(src));
t('uses passkey-recover-verify-email action', /passkey-recover-verify-email/.test(src));
t('key is email:<addr>', /email:\$\{email\}/.test(src));
t('MAX_EMAIL_FAILURES=5 defined', /MAX_EMAIL_FAILURES\s*=\s*5/.test(src));
t('rate-limit runs BEFORE code check', src.indexOf('passkey-recover-verify-email') < src.indexOf('codeHash'));

const hasAttemptsCheck = /row\.attempts.*MAX_EMAIL_FAILURES/.test(src);
console.log('');
console.log('  [note] row.attempts check present: ' + hasAttemptsCheck);
console.log('  [note] row.attempts is per-code; effective defense is email rate limit.');

console.log('');
console.log('[b4-3] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
