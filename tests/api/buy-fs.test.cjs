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
  if (res.failed.length > 0) {
    console.error('migration failed:', res.failed);
    process.exit(2);
  }
  return mem;
}

function makeD1(db) {
  function makeStmt(sql) {
    var args = null;
    var obj = {
      _sql: sql,
      bind: function () {
        args = Array.prototype.slice.call(arguments);
        return obj;
      },
      first: function () {
        var s = db.prepare(sql);
        return args ? s.get.apply(s, args) : s.get();
      },
      run: function () {
        var s = db.prepare(sql);
        return args ? s.run.apply(s, args) : s.run();
      },
      all: function () {
        var s = db.prepare(sql);
        return { results: args ? s.all.apply(s, args) : s.all() };
      }
    };
    return obj;
  }
  return {
    prepare: function (sql) { return makeStmt(sql); },
    batch: function (stmts) {
      db.exec('BEGIN');
      try {
        for (var i = 0; i < stmts.length; i++) {
          if (stmts[i] && typeof stmts[i].run === 'function') stmts[i].run();
        }
        db.exec('COMMIT');
        return stmts.map(function () { return { success: true }; });
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    }
  };
}

(async function () {
  var mod = await import(path.join(ROOT, 'functions/api/game/buy-fs.js'));
  var executeBuy = mod.executeBuy;
  var pass = 0, fail = 0;
  function t(name, cond, extra) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
  }

  // ---- 1) happy path ----
  console.log('\n=== 1) happy path ===');
  var mem1 = bootstrapDb();
  mem1.prepare('INSERT INTO users (username,email,password_hash,wallet_balance,status) VALUES (?,?,?,?,?)')
    .run('u1','u1@e.com','h',1000000000,'active');
  var uid1 = mem1.prepare('SELECT id FROM users WHERE username=?').get('u1').id;
  var env1 = { apex_db: makeD1(mem1) };
  var r1 = await executeBuy(env1, uid1, 'buytest-happy-0000000001', 100);
  t('1a status 200', r1.status === 200, 'got ' + r1.status);
  t('1b has sessionId', !!(r1.body && r1.body.sessionId), JSON.stringify(r1.body));
  t('1c remaining=10', r1.body.remaining === 10, 'got ' + r1.body.remaining);
  t('1d costMinor=10000', r1.body.costMinor === 10000, 'got ' + r1.body.costMinor);
  var balAfter = mem1.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid1).wallet_balance;
  t('1e balance deducted', balAfter === 1000000000 - 10000, 'got ' + balAfter);
  var ledgerCnt = mem1.prepare("SELECT COUNT(*) AS c FROM wallet_ledger WHERE change_type='buy_fs'").get().c;
  t('1f 1 ledger entry', ledgerCnt === 1, 'got ' + ledgerCnt);
  var fsCnt = mem1.prepare('SELECT COUNT(*) AS c FROM free_spin_sessions WHERE user_id=?').get(uid1).c;
  t('1g 1 FS session', fsCnt === 1, 'got ' + fsCnt);

  // ---- 2) insufficient balance ----
  console.log('\n=== 2) insufficient balance ===');
  var mem2 = bootstrapDb();
  mem2.prepare('INSERT INTO users (username,email,password_hash,wallet_balance,status) VALUES (?,?,?,?,?)')
    .run('u2','u2@e.com','h',5000,'active');
  var uid2 = mem2.prepare('SELECT id FROM users WHERE username=?').get('u2').id;
  var env2 = { apex_db: makeD1(mem2) };
  var r2 = await executeBuy(env2, uid2, 'buytest-low-0000000002', 100);
  t('2a status 400', r2.status === 400, 'got ' + r2.status);
  t('2b code insufficient', r2.body.code === 'insufficient_balance', r2.body.code);
  t('2c no FS session', mem2.prepare('SELECT COUNT(*) AS c FROM free_spin_sessions').get().c === 0);
  t('2d balance unchanged', mem2.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid2).wallet_balance === 5000);

  // ---- 3) idempotent (same spinId) ----
  console.log('\n=== 3) idempotent ===');
  var r3 = await executeBuy(env1, uid1, 'buytest-happy-0000000001', 100);
  t('3a cached 200', r3.status === 200 && r3.body.cached === true, JSON.stringify(r3.body));
  t('3b no extra ledger', mem1.prepare("SELECT COUNT(*) AS c FROM wallet_ledger WHERE change_type='buy_fs'").get().c === 1);
  t('3c no extra FS session', mem1.prepare('SELECT COUNT(*) AS c FROM free_spin_sessions').get().c === 1);

  // ---- 4) user_inactive ----
  console.log('\n=== 4) user_inactive ===');
  var mem4 = bootstrapDb();
  mem4.prepare('INSERT INTO users (username,email,password_hash,wallet_balance,status) VALUES (?,?,?,?,?)')
    .run('u4','u4@e.com','h',1000000,'disabled');
  var uid4 = mem4.prepare('SELECT id FROM users WHERE username=?').get('u4').id;
  var env4 = { apex_db: makeD1(mem4) };
  var r4 = await executeBuy(env4, uid4, 'buytest-inactive-0000000004', 100);
  t('4a status 403', r4.status === 403, 'got ' + r4.status);
  t('4b code user_inactive', r4.body.code === 'user_inactive', r4.body.code);

  console.log('');
  console.log('========== buy-fs test ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail === 0 ? 0 : 1);
})();
