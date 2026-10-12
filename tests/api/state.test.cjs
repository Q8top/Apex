'use strict';
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');
var sqlite = require('node:sqlite');
if (!globalThis.crypto) { globalThis.crypto = require('crypto').webcrypto; }
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

function bootstrapDb() {
  var mem = new sqlite.DatabaseSync(':memory:');
  mem.exec('PRAGMA foreign_keys = ON;');
  var b = require(ROOT + '/tests/settlement/bootstrap.cjs');
  var res = b.applyCuratedMigrations(mem, ROOT);
  if (res.failed.length > 0) { process.exit(2); }
  return mem;
}

(async function () {
  var pass = 0, fail = 0;
  function t(n, c, e) { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); } }

  var mem = bootstrapDb();
  mem.prepare('INSERT INTO users (username,email,password_hash,wallet_balance,status) VALUES (?,?,?,?,?)')
    .run('st1','st1@e.com','h',1234567,'active');
  var uid = mem.prepare('SELECT id FROM users WHERE username=?').get('st1').id;
  var wallet = mem.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid).wallet_balance;
  t('1a wallet in DB', wallet === 1234567, 'got ' + wallet);

  var noFs = mem.prepare('SELECT COUNT(*) AS c FROM free_spin_sessions WHERE user_id=?').get(uid).c;
  t('1b no FS session', noFs === 0);

  var now = new Date().toISOString();
  var exp = new Date(Date.now() + 3600000).toISOString();
  mem.prepare('INSERT INTO free_spin_sessions (user_id, trigger_spin_id, mode, bet_minor, pay_scale, total_spins, remaining_spins, retrigger_count, version, expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(uid, 'st-trig-000000000001', 'real', 100, 2.5, 10, 7, 0, 0, exp);
  var fsRow = mem.prepare("SELECT id, remaining_spins, total_spins, chain_id FROM free_spin_sessions WHERE user_id = ? AND status = 'active' AND remaining_spins > 0 AND expires_at > ? ORDER BY id DESC LIMIT 1").get(uid, now);
  t('1c FS active found', !!fsRow && fsRow.remaining_spins === 7, JSON.stringify(fsRow));

  console.log('');
  console.log('========== state test ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail === 0 ? 0 : 1);
})();
