'use strict';
/* 2.B.3: server authority boundary contract (static inspection). */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
function read(p){ try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch(e){ return ''; } }

const spin  = read('functions/api/game/spin.js');
const auth  = read('functions/_auth.js');
const mw    = read('functions/_middleware.js');
const mig   = read('migrations/0025_spins.sql');
const buyfs = read('functions/api/game/buy-fs.js');

let passed = 0, failed = 0;
function t(name, cond){
  if (cond){ console.log('  ok   ' + name); passed++; }
  else { console.log('  FAIL ' + name); failed++; }
}

console.log('=== server authority boundary ===');

t('auth: HttpOnly cookie', /HttpOnly/.test(auth));
t('auth: Secure cookie', /Secure/.test(auth));
t('auth: SameSite=Strict', /SameSite=Strict/.test(auth));
t('auth: session token hashed', /hashSessionToken/.test(auth));

t('spin: gameId whitelist sweet', /'sweet'/.test(spin));
t('spin: mode forced real', /const mode = 'real'/.test(spin));
t('spin: rejects mode != real', /mode !== 'real'/.test(spin));
t('spin: bet safe integer', /Number\.isSafeInteger\(betMinor\)/.test(spin));
t('spin: bet min/max bounds', /MIN_BET_MINOR/.test(spin) && /MAX_BET_MINOR/.test(spin));
t('spin: spinId length bound', /SPIN_ID_MIN/.test(spin) && /SPIN_ID_MAX/.test(spin));
t('spin: spinId charset', /a-zA-Z0-9_-/.test(spin));
t('spin: isFree from fsSession', /isFree = fsSession != null/.test(spin));
t('spin: idempotent retry', /idempotent_conflict/.test(spin));
t('spin: fingerprint check', /request_fingerprint/.test(spin));
t('spin: per-user rate limit', /enforceKeyRateLimit/.test(spin));

t('schema: spin_id UNIQUE', /spin_id TEXT NOT NULL UNIQUE/.test(mig));
t('schema: wallet_ledger used', /wallet_ledger/.test(spin));

t('buy-fs: rate limit', /enforceKeyRateLimit/.test(buyfs));
t('buy-fs: idempotency guard', /idempotent_conflict/.test(buyfs));

t('middleware: catch-all 500', /catch \(err\)/.test(mw) && /jsonError\(500/.test(mw));

const hist  = read('functions/api/game/history.js');
const state = read('functions/api/game/state.js');
const me    = read('functions/api/me.js');
const rlGap = [];
if (!/enforceKeyRateLimit|enforceIpRateLimit/.test(hist))  rlGap.push('history.js');
if (!/enforceKeyRateLimit|enforceIpRateLimit/.test(state)) rlGap.push('state.js');
if (!/enforceKeyRateLimit|enforceIpRateLimit/.test(me))    rlGap.push('me.js');
console.log('');
console.log('  [gap] missing rate-limit (2.B.4): ' + (rlGap.length ? rlGap.join(', ') : 'none'));

console.log('');
console.log('[authority-boundary] passed=' + passed + ' failed=' + failed);
process.exit(failed-- === 0 ? 0 : 1);
