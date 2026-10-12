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
  var mod = await import(path.join(ROOT, 'functions/api/game/spin.js'));
  var executeSpin = mod.executeSpin;
  var pass = 0, fail = 0;
  function t(n, c, e) {
    if (c) { pass++; console.log('  ok   ' + n); }
    else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
  }

  function setup() {
    var mem = bootstrapDb();
    mem.prepare('INSERT INTO users (username,email,password_hash,wallet_balance,status) VALUES (?,?,?,?,?)')
      .run('sp1','sp1@e.com','h',1000000000,'active');
    var uid = mem.prepare('SELECT id FROM users WHERE username=?').get('sp1').id;
    return { mem: mem, uid: uid, env: { apex_db: makeD1(mem) } };
  }

  // ---- 1) malformed input -> no db write (may throw) ----
  console.log('\n=== 1) malformed input rejected ===');
  var s1 = setup();
  async function safeCall(env, user, body) {
    try { return await executeSpin(env, user, body); }
    catch (e) { return { status: 500, body: { code: 'throw' }, _threw: true }; }
  }
  var r1 = await safeCall(s1.env, { userId: s1.uid }, { spinId: 'x', betMinor: 100, mode: 'real' });
  t('1a short spinId rejected', r1.status !== 200, 'got ' + r1.status);
  var r2 = await safeCall(s1.env, { userId: s1.uid }, { spinId: 'spintest-v1-00000000001', betMinor: 0, mode: 'real' });
  t('1b zero bet rejected', r2.status !== 200, 'got ' + r2.status);
  t('1c no spins written', s1.mem.prepare('SELECT COUNT(*) AS c FROM spins').get().c === 0);

  // ---- 2) happy path ----
  console.log('\n=== 2) happy path ===');
  var s2 = setup();
  var r4 = await executeSpin(s2.env, { userId: s2.uid }, { spinId: 'spintest-happy-000000001', betMinor: 100, mode: 'real' });
  t('2a status 200', r4.status === 200, 'got ' + r4.status);
  t('2b has result', !!(r4.body && r4.body.result), JSON.stringify(r4.body));
  t('2c has balanceAfter', typeof r4.body.balanceAfter === 'number');
  t('2d balanceBefore correct', r4.body.balanceBefore === 1000000000, 'got ' + r4.body.balanceBefore);

  var spinCnt = s2.mem.prepare('SELECT COUNT(*) AS c FROM spins WHERE user_id=?').get(s2.uid).c;
  t('2e 1 spins row', spinCnt === 1, 'got ' + spinCnt);
  var betLedger = s2.mem.prepare("SELECT COUNT(*) AS c FROM wallet_ledger WHERE change_type='bet'").get().c;
  t('2f 1 bet ledger', betLedger === 1, 'got ' + betLedger);

  // ---- 3) idempotent (same spinId, same args) ----
  console.log('\n=== 3) idempotent ===');
  var r5 = await executeSpin(s2.env, { userId: s2.uid }, { spinId: 'spintest-happy-000000001', betMinor: 100, mode: 'real' });
  t('3a cached 200', r5.status === 200, 'got ' + r5.status);
  t('3b cached flag', r5.body.cached === true, 'got ' + r5.body.cached);
  t('3c no extra spins', s2.mem.prepare('SELECT COUNT(*) AS c FROM spins').get().c === 1);

  // ---- 4) insufficient balance ----
  console.log('\n=== 4) insufficient balance ===');
  var s4 = bootstrapDb();
  s4.prepare('INSERT INTO users (username,email,password_hash,wallet_balance,status) VALUES (?,?,?,?,?)')
    .run('sp4','sp4@e.com','h',50,'active');
  var uid4 = s4.prepare('SELECT id FROM users WHERE username=?').get('sp4').id;
  var env4 = { apex_db: makeD1(s4) };
  var r6 = await executeSpin(env4, { userId: uid4 }, { spinId: 'spintest-low-00000000004', betMinor: 100, mode: 'real' });
  t('4a status 400', r6.status === 400, 'got ' + r6.status);
  t('4b code insufficient_balance', r6.body.code === 'insufficient_balance', r6.body.code);
  t('4c no spins row', s4.prepare('SELECT COUNT(*) AS c FROM spins').get().c === 0);
  t('4d balance untouched', s4.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid4).wallet_balance === 50);

  // ---- 5) 100 spins consecutive - balance invariant ----
  console.log('\n=== 5) 100 spins - balance invariant ===');
  var s5 = bootstrapDb();
  s5.prepare('INSERT INTO users (username,email,password_hash,wallet_balance,status) VALUES (?,?,?,?,?)')
    .run('sp5','sp5@e.com','h',1000000000,'active');
  var uid5 = s5.prepare('SELECT id FROM users WHERE username=?').get('sp5').id;
  var env5 = { apex_db: makeD1(s5) };
  var ok = 0;
  for (var i = 0; i < 100; i++) {
    var rid = 'spintest-5-' + String(i).padStart(10, '0');
    var rr = await executeSpin(env5, { userId: uid5 }, { spinId: rid, betMinor: 100, mode: 'real' });
    if (rr.status === 200) ok++;
  }
  t('5a all 100 succeeded', ok === 100, 'got ' + ok);
  var finalBal = s5.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid5).wallet_balance;
  t('5b balance = initial + ledger delta', finalBal === 1000000000 + s5.prepare('SELECT COALESCE(SUM(delta),0) AS s FROM wallet_ledger WHERE user_id=?').get(uid5).s, 'bal=' + finalBal);
  t('5c balance non-negative', finalBal >= 0, 'got ' + finalBal);
  t('5d 100 spins rows', s5.prepare('SELECT COUNT(*) AS c FROM spins WHERE user_id=?').get(uid5).c === 100);
  var ledgerSum = s5.prepare('SELECT COALESCE(SUM(delta),0) AS s FROM wallet_ledger WHERE user_id=?').get(uid5).s;
  t('5e ledger delta sum matches', ledgerSum === finalBal - 1000000000, 'ledger=' + ledgerSum + ' bal_delta=' + (finalBal - 1000000000));

  console.log('');
  console.log('========== spin integration test ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail === 0 ? 0 : 1);
})();
