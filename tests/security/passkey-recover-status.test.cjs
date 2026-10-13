'use strict';
/* 2.B.4 B4-1: passkey recover must honour user.status. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const src = fs.readFileSync(ROOT + '/functions/api/passkey/recover-verify.js', 'utf8');
let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok   ' + n); pass++; } else { console.log('  FAIL ' + n); fail++; } }

console.log('=== passkey recover status guard ===');
t('queries users.status', /SELECT status FROM users WHERE id = \?/.test(src));
t('rejects non-active', /statusRow\.status && statusRow\.status !== 'active'/.test(src));
t('returns user_inactive code', /'user_inactive'/.test(src));
t('checks BEFORE passkey binding', src.indexOf('user_inactive') < src.indexOf("INSERT INTO passkeys"));
console.log('');
console.log('[b4-1] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
