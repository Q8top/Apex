'use strict';
/* Apex D-2 fault injection: D1 layer failures.
 * Verifies fail-closed semantics: no partial commit, no phantom spins.
 *
 * Mock D1 wraps node:sqlite with:
 *   - SAVEPOINT-based atomic batch (matches real D1 semantics)
 *   - injectable faults via opts:
 *       prepareErrorOn: regex -> throws on matching prepare()
 *       batchErrorOn:   regex -> throws on matching stmt in batch()
 *       batchErrorMsg:  custom message
 */
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
var sqlite = require('node:sqlite');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

function makeFaultD1(db, opts) {
  opts = opts || {};
  function makeStmt(sql) {
    if (opts.prepareErrorOn && opts.prepareErrorOn.test(sql)) {
      throw new Error(opts.prepareErrorMsg || 'injected prepare error');
    }
    var args = null;
    var obj = {
      _sql: sql,
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
      // Atomic per real D1: BEGIN -> each -> COMMIT, ROLLBACK on failure
      db.exec('BEGIN');
      try {
        var out = [];
        for (var i = 0; i < stmts.length; i++) {
          var it = stmts[i];
          if (opts.batchErrorOn && opts.batchErrorOn.test(it._sql)) {
            throw new Error(opts.batchErrorMsg || 'CHECK constraint failed');
          }
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

  // ---------- 1) prepare throws -> 500, no record ----------
  console.log('\n=== 1) prepare throws -> fail closed ===');
  var mem1 = bootstrapDb();
  mem1.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('u1','u1@e.com','h',1000000);
  var uid1 = mem1.prepare("SELECT id FROM users WHERE username='u1'").get().id;

  // Throw on 2nd prepare (the user lookup after fingerprint)
  var callCount = { n: 0 };
  var faultEnv1 = { apex_db: (function(){
    var real = makeFaultD1(mem1);
    return {
      prepare: function(sql){
        callCount.n++;
        // Allow the very first prepare (existing check). Throw on 3rd.
        if (callCount.n >= 3 && /SELECT wallet_balance FROM users/.test(sql)) {
          throw new Error('injected: d1 unavailable');
        }
        return real.prepare(sql);
      },
      batch: real.batch
    };
  })() };

  var threw = false;
  var r1;
  try {
    r1 = await executeSpin(faultEnv1, { userId: uid1 }, { spinId: 'fault-prep-0000000001', betMinor: 200, mode: 'real' });
  } catch (e) {
    threw = true;
    r1 = { status: 'threw', error: String(e.message) };
  }
  t('1a prepare error does not crash silently', threw || r1.status === 500 || r1.status === 'threw',
    JSON.stringify(r1));
  var spin1 = mem1.prepare('SELECT COUNT(*) AS c FROM spins WHERE spin_id=?').get('fault-prep-0000000001').c;
  t('1b no spins record on prepare failure', spin1 === 0);
  var bal1 = mem1.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid1).wallet_balance;
  t('1c balance untouched', bal1 === 1000000, 'got ' + bal1);

  // ---------- 2) batch throws (generic) -> 500 internal_error ----------
  console.log('\n=== 2) batch throws generic -> 500 ===');
  var mem2 = bootstrapDb();
  mem2.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('u2','u2@e.com','h',1000000);
  var uid2 = mem2.prepare("SELECT id FROM users WHERE username='u2'").get().id;

  // Throw on wallet_ledger insert (mid-batch)
  var faultEnv2 = { apex_db: makeFaultD1(mem2, {
    batchErrorOn: /INSERT INTO wallet_ledger/,
    batchErrorMsg: 'injected: D1 write failure'
  }) };
  var r2 = await executeSpin(faultEnv2, { userId: uid2 }, { spinId: 'fault-batch-0000000002', betMinor: 200, mode: 'real' });
  t('2a status 500', r2.status === 500, 'got ' + r2.status);
  t('2b code internal_error', r2.body.code === 'internal_error', 'got ' + r2.body.code);
  var spin2 = mem2.prepare('SELECT COUNT(*) AS c FROM spins WHERE spin_id=?').get('fault-batch-0000000002').c;
  t('2c no spins record (rolled back)', spin2 === 0, 'got ' + spin2);
  var bal2 = mem2.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid2).wallet_balance;
  t('2d balance rolled back to 1000000', bal2 === 1000000, 'got ' + bal2);
  var ledger2 = mem2.prepare('SELECT COUNT(*) AS c FROM wallet_ledger WHERE user_id=?').get(uid2).c;
  t('2e no ledger entries', ledger2 === 0, 'got ' + ledger2);

  // ---------- 3) batch throws guard_failed -> 400 insufficient ----------
  console.log('\n=== 3) guard_failed -> 400 insufficient_balance ===');
  var mem3 = bootstrapDb();
  mem3.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('u3','u3@e.com','h',1000);
  var uid3 = mem3.prepare("SELECT id FROM users WHERE username='u3'").get().id;

  // User tries to bet more than balance — user lookup catches first,
  // so to trigger guard_failed we inject CHECK on the guard table itself.
  var faultEnv3 = { apex_db: makeFaultD1(mem3, {
    batchErrorOn: /INSERT INTO _settlement_guard/,
    batchErrorMsg: 'CHECK constraint failed: guard_value'
  }) };
  var r3 = await executeSpin(faultEnv3, { userId: uid3 }, { spinId: 'fault-guard-0000000003', betMinor: 200, mode: 'real' });
  t('3a status 400', r3.status === 400, 'got ' + r3.status);
  t('3b code insufficient_balance', r3.body.code === 'insufficient_balance', 'got ' + r3.body.code);
  var spin3 = mem3.prepare('SELECT COUNT(*) AS c FROM spins WHERE spin_id=?').get('fault-guard-0000000003').c;
  t('3c no spins record', spin3 === 0);
  var bal3 = mem3.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid3).wallet_balance;
  t('3d balance unchanged 1000', bal3 === 1000, 'got ' + bal3);

  console.log('\n========== d1-fault ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
