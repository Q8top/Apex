
'use strict';
var path = require('path');
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
      _sql: sql, _args: null,
      bind: function () { args = Array.prototype.slice.call(arguments); obj._args = args; return obj; },
      first: function () { var s = db.prepare(sql); return args ? s.get.apply(s, args) : s.get(); },
      run: function () { var s = db.prepare(sql); var r = args ? s.run.apply(s, args) : s.run(); return { meta: { changes: r.changes } }; },
      all: function () { var s = db.prepare(sql); return { results: (args ? s.all.apply(s, args) : s.all()) || [] }; }
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
  if (res.failed.length > 0) { console.error('mig fail:', res.failed); process.exit(2); }
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

  // ---- 1) Normal FS flow still works ----
  console.log('\n=== 1) normal FS cap works ===');
  var mem = bootstrapDb();
  mem.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('cap1','cap1@e.com','h',1000000);
  var uid = mem.prepare("SELECT id FROM users WHERE username='cap1'").get().id;
  // Create base spin row (FK target for reward_chains.base_spin_id)
  var expires = new Date(Date.now() + 86400000).toISOString();
  var nowIso = new Date().toISOString();
  mem.prepare(
    'INSERT INTO spins (spin_id,user_id,mode,is_free,bet_minor,win_minor,balance_before,balance_after,result_json,game_version,math_version) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?)'
  ).run('base-spin-1', uid, 'real', 0, 100, 0, 1000000, 1000000, '{}', 'g1', '1.0.0');
  mem.prepare(
    'INSERT INTO reward_chains (chain_id, user_id, base_spin_id, effective_bet_minor, max_win_multiplier, chain_win_minor, math_version) ' +
    "VALUES (?,?,?,?,?,?,?)"
  ).run('ch-test1', uid, 'base-spin-1', 100, 5000, 0, '1.0.0');
  mem.prepare(
    'INSERT INTO free_spin_sessions (user_id, trigger_spin_id, chain_id, mode, bet_minor, pay_scale, total_spins, remaining_spins, retrigger_count, version, expires_at) ' +
    "VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  ).run(uid, 'base-spin-1', 'ch-test1', 'real', 100, 2.55, 5, 5, 0, 0, expires);

  var env = { apex_db: makeD1(mem) };
  var r1 = await executeSpin(env, { userId: uid }, { spinId: 'cap-test-0000000001', betMinor: 100, mode: 'real' });
  t('1a status 200', r1.status === 200, 'got ' + r1.status);
  var chain1 = mem.prepare('SELECT chain_win_minor, cap_reached FROM reward_chains WHERE chain_id=?').get('ch-test1');
  t('1b chain_win_minor == response winMinor', chain1.chain_win_minor === r1.body.winMinor, 'chain=' + chain1.chain_win_minor + ' resp=' + r1.body.winMinor);
  t('1c chain_win_minor < cap 500000', chain1.chain_win_minor < 500000, 'got ' + chain1.chain_win_minor);

  // ---- 2) cap arithmetic is safe at max params ----
  console.log('\n=== 2) cap arithmetic safety ===');
  var maxBet = 1000000;       // 10000 CNY in fen
  var maxMult = 25000;        // demo max
  var capMinor = maxBet * maxMult;
  t('2a capMinor safe integer', Number.isSafeInteger(capMinor), 'cap=' + capMinor);
  t('2b capMinor < MAX_SAFE', capMinor < Number.MAX_SAFE_INTEGER);
  t('2c headroom > 1e5x', Number.MAX_SAFE_INTEGER / capMinor > 1e5,
    'ratio=' + (Number.MAX_SAFE_INTEGER / capMinor).toExponential(2));

  // ---- 3) cap_reached set when chain hits cap ----
  console.log('\n=== 3) chain_win_minor bounded by cap ===');
  // Manually set chain to almost cap then spin
  mem.prepare('UPDATE reward_chains SET chain_win_minor=? WHERE chain_id=?')
    .run(499999, 'ch-test1');
  var r3 = await executeSpin(env, { userId: uid }, { spinId: 'cap-test-0000000002', betMinor: 100, mode: 'real' });
  t('3a status 200', r3.status === 200);
  var chain3 = mem.prepare('SELECT chain_win_minor, cap_reached FROM reward_chains WHERE chain_id=?').get('ch-test1');
  t('3b chain_win_minor <= cap 500000', chain3.chain_win_minor <= 500000, 'got ' + chain3.chain_win_minor);
  // Note: chain_win_minor might not reach cap in one FS spin

  console.log('\n========== a6b-guard ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
