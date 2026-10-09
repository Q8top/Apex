'use strict';
/* Apex D-3 GET /api/metrics test.
 * Covers:
 *   - token absent -> 401 unauthorized
 *   - token wrong  -> 401
 *   - METRICS_TOKEN unset -> 503 metrics_not_configured
 *   - happy path with seeded spins -> aggregate correctness
 *   - reconciliation detects drift
 *   - DB error -> 503
 *   - no secret leak (no token, no user ids, no spin ids)
 */
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');
var sqlite = require('node:sqlite');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

function makeD1(db) {
  function makeStmt(sql) {
    var args = [];
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
        return { results: (args ? s.all.apply(s, args) : s.all()) || [] };
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
          var s = db.prepare(stmts[i]._sql);
          var r = s.run.apply(s, stmts[i]._args || []);
          out.push({ meta: { changes: r.changes } });
        }
        db.exec('COMMIT');
        return out;
      } catch (e) { try { db.exec('ROLLBACK'); } catch (_) {} throw e; }
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

function makeReq(token) {
  var headers = new Headers();
  if (token) headers.set('X-Metrics-Token', token);
  return new Request('https://apextop.cc.cd/api/metrics', { method: 'GET', headers: headers });
}

(async function () {
  var mod = await import(path.join(ROOT, 'functions/api/metrics.js'));
  var onRequestGet = mod.onRequestGet;

  var pass = 0, fail = 0;
  function t(name, cond, extra) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
  }

  // ============================================================
  // 1) Config missing -> 503 metrics_not_configured
  // ============================================================
  console.log('\n=== 1) METRICS_TOKEN unset ===');
  var mem1 = bootstrapDb();
  var envNoToken = { apex_db: makeD1(mem1) };
  var r1 = await onRequestGet({
    request: makeReq('any-token'),
    env: envNoToken,
    data: {}
  });
  t('1a status 503', r1.status === 503, 'got ' + r1.status);
  var b1 = await r1.json();
  t('1b code metrics_not_configured', b1.code === 'metrics_not_configured', JSON.stringify(b1));

  // ============================================================
  // 2) Wrong token -> 401
  // ============================================================
  console.log('\n=== 2) wrong token ===');
  var mem2 = bootstrapDb();
  var envOk = { apex_db: makeD1(mem2), METRICS_TOKEN: 'a-very-secret-metrics-token-2026' };

  var r2 = await onRequestGet({ request: makeReq(''), env: envOk, data: {} });
  t('2a missing header -> 401', r2.status === 401, 'got ' + r2.status);
  var b2 = await r2.json();
  t('2b code unauthorized', b2.code === 'unauthorized');

  var r3 = await onRequestGet({ request: makeReq('wrong-token-here-00000'), env: envOk, data: {} });
  t('2c wrong token -> 401', r3.status === 401, 'got ' + r3.status);

  // shorter token
  var r3b = await onRequestGet({ request: makeReq('short'), env: envOk, data: {} });
  t('2d short wrong token -> 401', r3b.status === 401);

  // ============================================================
  // 3) Happy path with seeded spins
  // ============================================================
  console.log('\n=== 3) happy path with seeded data ===');
  var mem3 = bootstrapDb();
  // Two users
  mem3.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('m1','m1@e.com','h',100000);
  mem3.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('m2','m2@e.com','h',100000);
  var uid1 = mem3.prepare("SELECT id FROM users WHERE username='m1'").get().id;
  var uid2 = mem3.prepare("SELECT id FROM users WHERE username='m2'").get().id;

  // Seed 5 paid spins (real) + 2 FS spins
  var nowIso = new Date().toISOString();
  var ins = mem3.prepare(
    'INSERT INTO spins (spin_id,user_id,mode,is_free,bet_minor,win_minor,balance_before,balance_after,result_json,game_version,math_version,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
  );
  ins.run('metric-p1',uid1,'real',0,100,200,1000,1100,'{}','g1','m1.0.0',nowIso);
  ins.run('metric-p2',uid1,'real',0,100,200,1000,1100,'{}','g1','m1.0.0',nowIso);
  ins.run('metric-p3',uid2,'real',0,100,100,1000,1000,'{}','g1','m1.0.0',nowIso);
  ins.run('metric-f1',uid1,'real',1,100,150,1000,1100,'{}','g1','m1.0.0',nowIso);
  ins.run('metric-f2',uid1,'real',1,100,150,1000,1100,'{}','g1','m1.0.0',nowIso);

  var env3 = { apex_db: makeD1(mem3), METRICS_TOKEN: 'a-very-secret-metrics-token-2026' };
  var r4 = await onRequestGet({
    request: makeReq('a-very-secret-metrics-token-2026'),
    env: env3,
    data: {}
  });
  t('4a status 200', r4.status === 200, 'got ' + r4.status);
  var b4 = await r4.json();
  t('4b success true', b4.success === true);
  t('4c totals.spins = 5', b4.totals.spins === 5, 'got ' + b4.totals.spins);
  t('4d totals.paid_spins = 3', b4.totals.paid_spins === 3, 'got ' + b4.totals.paid_spins);
  t('4e totals.fs_spins = 2', b4.totals.fs_spins === 2, 'got ' + b4.totals.fs_spins);
  t('4f wagered_minor = 500 (5x100)', b4.totals.wagered_minor === 500, 'got ' + b4.totals.wagered_minor);
  t('4g paid_minor = 800 (200+200+100+150+150)', b4.totals.paid_minor === 800, 'got ' + b4.totals.paid_minor);
  t('4h unique_users = 2', b4.totals.unique_users === 2, 'got ' + b4.totals.unique_users);
  t('4i rtp = 800/500 = 1.6', Math.abs(b4.totals.rtp - 1.6) < 1e-9, 'got ' + b4.totals.rtp);

  t('4j modes has real only', b4.modes.length === 1 && b4.modes[0].mode === 'real');
  t('4k mode spins = 5', b4.modes[0].spins === 5);
  t('4l versions has one entry', b4.versions.length === 1);
  t('4m version math = m1.0.0', b4.versions[0].math_version === 'm1.0.0');

  t('4n window has hours', typeof b4.window.hours === 'number');
  t('4o generated_at present', typeof b4.generated_at === 'string');

  // Secret leak check
  var b4Str = JSON.stringify(b4);
  t('4p no token in body', b4Str.indexOf('a-very-secret-metrics-token') < 0);
  t('4q no user_id in body', b4Str.indexOf('"user_id"') < 0);
  t('4r no spin_id in body', b4Str.indexOf('metric-p1') < 0);
  t('4s no result_json in body', b4Str.indexOf('result_json') < 0);

  // ============================================================
  // 4) Reconciliation detects drift
  // ============================================================
  console.log('\n=== 5) reconciliation ===');
  // No ledger entries -> wallet_balance (100000) != ledger sum (0) -> mismatch count = 2
  var recon5 = b4.reconciliation;
  t('5a users_checked = 2', recon5.users_checked === 2, 'got ' + recon5.users_checked);
  t('5b mismatch_count = 2 (no ledger yet)', recon5.mismatch_count === 2, 'got ' + recon5.mismatch_count);

  // Add ledger entries matching wallet balance
  mem3.prepare('INSERT INTO wallet_ledger (event_id, user_id, delta, change_type) VALUES (?,?,?,?)')
    .run('ev1', uid1, 100000, 'opening');
  mem3.prepare('INSERT INTO wallet_ledger (event_id, user_id, delta, change_type) VALUES (?,?,?,?)')
    .run('ev2', uid2, 100000, 'opening');

  var r5 = await onRequestGet({
    request: makeReq('a-very-secret-metrics-token-2026'),
    env: env3,
    data: {}
  });
  var b5 = await r5.json();
  t('5c mismatch_count = 0 after ledger', b5.reconciliation.mismatch_count === 0, 'got ' + b5.reconciliation.mismatch_count);

  // Introduce drift
  mem3.prepare('UPDATE users SET wallet_balance = wallet_balance + 1 WHERE id = ?').run(uid1);
  var r6 = await onRequestGet({
    request: makeReq('a-very-secret-metrics-token-2026'),
    env: env3,
    data: {}
  });
  var b6 = await r6.json();
  t('5d mismatch_count = 1 after drift', b6.reconciliation.mismatch_count === 1, 'got ' + b6.reconciliation.mismatch_count);

  // ============================================================
  // 5) Window cap
  // ============================================================
  console.log('\n=== 6) window cap ===');
  // Spins seeded "now" should appear in 1h window
  var req6 = new Request('https://apextop.cc.cd/api/metrics?hours=1', {
    method: 'GET',
    headers: { 'X-Metrics-Token': 'a-very-secret-metrics-token-2026' }
  });
  var r7 = await onRequestGet({ request: req6, env: env3, data: {} });
  var b7 = await r7.json();
  t('6a window.hours = 1', b7.window.hours === 1);
  t('6b 5 spins within 1h', b7.totals.spins === 5);

  var req7 = new Request('https://apextop.cc.cd/api/metrics?hours=99999', {
    method: 'GET',
    headers: { 'X-Metrics-Token': 'a-very-secret-metrics-token-2026' }
  });
  var r8 = await onRequestGet({ request: req7, env: env3, data: {} });
  var b8 = await r8.json();
  t('6c hours capped at 720 (30 days)', b8.window.hours === 720, 'got ' + b8.window.hours);

  // ============================================================
  // 6) DB error -> 503
  // ============================================================
  console.log('\n=== 7) DB error -> 503 ===');
  var envBad = {
    apex_db: {
      prepare: function () {
        return {
          bind: function () { return this; },
          first: async function () { throw new Error('injected: db down'); },
          all: async function () { throw new Error('injected: db down'); }
        };
      }
    },
    METRICS_TOKEN: 'a-very-secret-metrics-token-2026'
  };
  var r9 = await onRequestGet({
    request: makeReq('a-very-secret-metrics-token-2026'),
    env: envBad,
    data: {}
  });
  t('7a status 503', r9.status === 503, 'got ' + r9.status);
  var b9 = await r9.json();
  t('7b code metrics_unavailable', b9.code === 'metrics_unavailable');

  // ============================================================
  // 7) OPTIONS
  // ============================================================
  console.log('\n=== 8) OPTIONS ===');
  var opt = await mod.onRequestOptions({ data: {} });
  t('8a OPTIONS 204', opt.status === 204);

  console.log('\n========== metrics ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
