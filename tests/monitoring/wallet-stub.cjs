'use strict';
/* P3-1 wallet stub test. */
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

var fail = 0;
function t(n, c, e) { if (c) console.log('  ok   ' + n); else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); } }

(async function () {
  var dep = await import(path.join(ROOT, 'functions/api/wallet/deposit.js'));
  var wd  = await import(path.join(ROOT, 'functions/api/wallet/withdraw.js'));

  console.log('\n=== 1) deposit stub ===');
  var r1 = await dep.onRequestPost({ request: new Request('https://x/api/wallet/deposit', {method:'POST'}), data: { requestId: 'r1' } });
  t('1a status 501', r1.status === 501, 'got ' + r1.status);
  var b1 = await r1.json();
  t('1b success=false', b1.success === false);
  t('1c code not_implemented', b1.code === 'not_implemented');
  t('1d message present', typeof b1.message === 'string' && b1.message.length > 0);

  console.log('\n=== 2) withdraw stub ===');
  var r2 = await wd.onRequestPost({ request: new Request('https://x/api/wallet/withdraw', {method:'POST'}), data: {} });
  t('2a status 501', r2.status === 501);
  var b2 = await r2.json();
  t('2b code not_implemented', b2.code === 'not_implemented');

  console.log('\n=== 3) GET returns same stub (no info leak) ===');
  var r3 = await dep.onRequestGet({ request: new Request('https://x/api/wallet/deposit', {method:'GET'}), data: {} });
  t('3a GET 501', r3.status === 501);
  var b3 = await r3.json();
  t('3b GET code not_implemented', b3.code === 'not_implemented');
  t('3c no balance leak', !('balance' in b3) && !('user' in b3));

  console.log('\n=== 4) OPTIONS 204 ===');
  var o1 = await dep.onRequestOptions({ data: {} });
  t('4a deposit OPTIONS 204', o1.status === 204);
  var o2 = await wd.onRequestOptions({ data: {} });
  t('4b withdraw OPTIONS 204', o2.status === 204);

  console.log('\n=== 5) no sensitive info in body ===');
  var s1 = JSON.stringify(b1), s2 = JSON.stringify(b2);
  t('5a no userId in deposit body', s1.indexOf('userId') < 0 && s1.indexOf('"id"') < 0);
  t('5b no userId in withdraw body', s2.indexOf('userId') < 0 && s2.indexOf('"id"') < 0);

  console.log('\ntotal: 13, failed: ' + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
