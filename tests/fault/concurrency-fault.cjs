'use strict';
/* Apex D-2 fault injection: concurrency invariants.
 * Uses Promise.all to interleave multiple executeSpin calls at await points.
 *
 * Invariants verified:
 *   1. Same spin_id + parallel -> 1 fresh + 1 cached, 1 spins row, 1 deduction
 *   2. Different spin_ids on same user -> balance never goes negative
 *   3. Same spin_id different bet -> 409 idempotency_conflict
 *   4. Concurrent FS consumption -> optimistic lock catches it
 */
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
var sqlite = require('node:sqlite');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

function makeD1(db) {
  function makeStmt(sql) {
    var args = null;
    var obj = {
      _sql: sql,
      _args: null,
      bind: function () {
        args = Array.prototype.slice.call(arguments);
        obj._args = args;
        return obj;
      },
      first: function () {
        var s = db.prepare(sql);
        return args ? s.get.apply(s, args) : s.get();
      },
      run: function () {
        var s = db.prepare(sql);
        var r = args ? s.run.apply(s, args) : s.run();
        return { meta: { changes: r.changes, last_row_id: r.lastInsertRowid } };
      },
      all: function () {
        var s = db.prepare(sql);
        return args ? s.all.apply(s, args) : s.all();
      }
    };
    return obj;
  }
  return {
    prepare: makeStmt,
    batch: async function (stmts) {
      db.exec('BEGIN');
      try {
        var out = [];
        for (var i = 0; i < stmts.length; i++) {
          var it = stmts[i];
          var s = db.prepare(it._sql);
          var r = s.run.apply(s, it._args || []);
          out.push({ meta: { changes: r.changes, last_row_id: r.lastInsertRowid } });
        }
        db.exec('COMMIT');
        return out;
      } catch (e) {
        try { db.exec('ROLLBACK'); } catch (_) {}
        throw e;
      }
    }
  };
}

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

(async function () {
  var mod = await import(path.join(ROOT, 'functions/api/game/spin.js'));
  var executeSpin = mod.executeSpin;

  var pass = 0, fail = 0;
  function t(name, cond, extra) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
  }

  // ============================================================
  // 1) Same spin_id, parallel calls -> 1 fresh + 1 cached, 1 deduction
  // ============================================================
  console.log('\n=== 1) same spin_id parallel -> idempotent ===');
  var mem1 = bootstrapDb();
  mem1.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('c1','c1@e.com','h',1000000);
  var uid1 = mem1.prepare("SELECT id FROM users WHERE username='c1'").get().id;
  var env1 = { apex_db: makeD1(mem1) };
  var user1 = { userId: uid1 };

  var results1 = await Promise.all([
    executeSpin(env1, user1, { spinId: 'concur-same-0000000001', betMinor: 100, mode: 'real' }),
    executeSpin(env1, user1, { spinId: 'concur-same-0000000001', betMinor: 100, mode: 'real' })
  ]);
  t('1a both status 200', results1[0].status === 200 && results1[1].status === 200);
  var freshCount = results1.filter(function (r) { return r.body.cached === false; }).length;
  var cachedCount = results1.filter(function (r) { return r.body.cached === true; }).length;
  t('1b exactly 1 fresh', freshCount === 1, 'fresh=' + freshCount);
  t('1c exactly 1 cached', cachedCount === 1, 'cached=' + cachedCount);

  var spinCount1 = mem1.prepare('SELECT COUNT(*) AS c FROM spins WHERE spin_id=?').get('concur-same-0000000001').c;
  t('1d exactly 1 spins row', spinCount1 === 1, 'got ' + spinCount1);

  var bal1 = mem1.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid1).wallet_balance;
  var win1 = results1[0].body.winMinor;
  t('1e balance deducted exactly once', bal1 === 1000000 - 100 + win1, 'got ' + bal1);

  // ============================================================
  // 2) Different spin_ids, parallel -> balance never negative
  // ============================================================
  console.log('\n=== 2) different spin_ids parallel -> balance guarded ===');
  var mem2 = bootstrapDb();
  // Balance 250 fen, bet 100 each, 5 parallel -> at most 2 can win the race
  mem2.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('c2','c2@e.com','h',250);
  var uid2 = mem2.prepare("SELECT id FROM users WHERE username='c2'").get().id;
  var env2 = { apex_db: makeD1(mem2) };
  var user2 = { userId: uid2 };

  var results2 = await Promise.all([
    executeSpin(env2, user2, { spinId: 'concur-multi-0000000001', betMinor: 100, mode: 'real' }),
    executeSpin(env2, user2, { spinId: 'concur-multi-0000000002', betMinor: 100, mode: 'real' }),
    executeSpin(env2, user2, { spinId: 'concur-multi-0000000003', betMinor: 100, mode: 'real' }),
    executeSpin(env2, user2, { spinId: 'concur-multi-0000000004', betMinor: 100, mode: 'real' }),
    executeSpin(env2, user2, { spinId: 'concur-multi-0000000005', betMinor: 100, mode: 'real' })
  ]);

  var succeeded2 = results2.filter(function (r) { return r.status === 200 && r.body.success && !r.body.cached; }).length;
  var rejected2 = results2.filter(function (r) { return r.status === 400 && r.body.code === 'insufficient_balance'; }).length;
  var other2 = results2.length - succeeded2 - rejected2;

  t('2a at most 2 succeeded', succeeded2 <= 2, 'succeeded=' + succeeded2);
  t('2b at least 1 succeeded', succeeded2 >= 1, 'succeeded=' + succeeded2);
  t('2c no other error codes', other2 === 0, 'other=' + other2 + ' ' + JSON.stringify(results2.map(function(r){return {s:r.status,c:r.body.code};})));

  var bal2 = mem2.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid2).wallet_balance;
  t('2d balance never negative', bal2 >= 0, 'got ' + bal2);

  // Only succeeded spins should have records
  var spinRows2 = mem2.prepare('SELECT COUNT(*) AS c FROM spins WHERE user_id=?').get(uid2).c;
  t('2e spins rows == succeeded count', spinRows2 === succeeded2, 'rows=' + spinRows2 + ' succeeded=' + succeeded2);

  // Ledger + balance consistency
  var ledgerSum2 = mem2.prepare('SELECT COALESCE(SUM(delta),0) AS s FROM wallet_ledger WHERE user_id=?').get(uid2).s;
  t('2f ledger sum == balance delta', ledgerSum2 === (bal2 - 250), 'ledger=' + ledgerSum2 + ' delta=' + (bal2 - 250));

  // ============================================================
  // 3) Same spin_id different bet -> 409 idempotency_conflict
  // ============================================================
  console.log('\n=== 3) same spin_id different bet -> 409 ===');
  var mem3 = bootstrapDb();
  mem3.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('c3','c3@e.com','h',1000000);
  var uid3 = mem3.prepare("SELECT id FROM users WHERE username='c3'").get().id;
  var env3 = { apex_db: makeD1(mem3) };
  var user3 = { userId: uid3 };

  var r3a = await executeSpin(env3, user3, { spinId: 'concur-conflict-0000000001', betMinor: 100, mode: 'real' });
  t('3a first 200', r3a.status === 200);
  var r3b = await executeSpin(env3, user3, { spinId: 'concur-conflict-0000000001', betMinor: 200, mode: 'real' });
  t('3b second with different bet 409', r3b.status === 409, 'got ' + r3b.status);
  t('3c code idempotency_conflict', r3b.body.code === 'idempotency_conflict', 'got ' + r3b.body.code);

  // Same spin_id, same user, same bet -> cached 200
  var r3c = await executeSpin(env3, user3, { spinId: 'concur-conflict-0000000001', betMinor: 100, mode: 'real' });
  t('3d same args -> cached 200', r3c.status === 200 && r3c.body.cached === true);

  // ============================================================
  // 4) Concurrent FS consumption -> optimistic lock
  // ============================================================
  console.log('\n=== 4) concurrent FS consumption -> version lock ===');
  var mem4 = bootstrapDb();
  mem4.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('c4','c4@e.com','h',1000000);
  var uid4 = mem4.prepare("SELECT id FROM users WHERE username='c4'").get().id;
  var env4 = { apex_db: makeD1(mem4) };
  var user4 = { userId: uid4 };

  // Create an active FS session with 2 remaining spins
  mem4.prepare(
    'INSERT INTO free_spin_sessions (user_id,trigger_spin_id,mode,bet_minor,pay_scale,total_spins,remaining_spins,retrigger_count,version,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(uid4, 'fs-trig-c4-0000000001', 'real', 100, 2.55, 2, 2, 0, 0, new Date(Date.now()+86400000).toISOString());

  // Two FS spins in parallel -> version-based lock ensures serialization
  var results4 = await Promise.all([
    executeSpin(env4, user4, { spinId: 'concur-fs-0000000001', betMinor: 100, mode: 'real' }),
    executeSpin(env4, user4, { spinId: 'concur-fs-0000000002', betMinor: 100, mode: 'real' })
  ]);

  var ok4 = results4.filter(function (r) { return r.status === 200; }).length;
  var fs2 = mem4.prepare('SELECT remaining_spins, version FROM free_spin_sessions WHERE user_id=?').get(uid4);
  t('4a at least 1 success', ok4 >= 1, 'ok=' + ok4);
  t('4b remaining_spins decreased', fs2.remaining_spins < 2, 'got ' + fs2.remaining_spins);
  t('4c version incremented', fs2.version > 0, 'got ' + fs2.version);

  // Ledger consistency: FS spins should have NO bet event
  var fsBetCount = mem4.prepare(
    'SELECT COUNT(*) AS c FROM wallet_ledger WHERE user_id=? AND change_type=?'
  ).get(uid4, 'bet').c;
  t('4d no bet ledger for FS spins', fsBetCount === 0, 'got ' + fsBetCount);

  console.log('\n========== concurrency-fault ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
