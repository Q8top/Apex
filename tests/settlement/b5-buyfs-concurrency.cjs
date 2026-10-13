'use strict';
/* 2.A.4: buy-fs true-concurrency (Promise.all interleaving). */
const sqlite = require('node:sqlite');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const bootstrap = require(ROOT + '/tests/settlement/bootstrap.cjs');
if (typeof globalThis.crypto === 'undefined') globalThis.crypto = require('crypto').webcrypto;
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

let pass = 0, fail = 0;
function t(name, cond){
  if (cond){ pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

function createD1(db){
  function makeStmt(sql){
    var args = null;
    var obj = {
      _sql: sql, _args: null,
      bind: function(){ args = Array.prototype.slice.call(arguments); obj._args = args; return obj; },
      first: async function(){ var s = db.prepare(sql); await Promise.resolve(); return args ? s.get.apply(s, args) : s.get(); },
      run: async function(){ var s = db.prepare(sql); await Promise.resolve(); var r = args ? s.run.apply(s, args) : s.run(); return { meta: { changes: r.changes } }; },
      all: async function(){ var s = db.prepare(sql); await Promise.resolve(); return args ? s.all.apply(s, args) : s.all(); }
    };
    return obj;
  }
  return {
    prepare: makeStmt,
    batch: async function(stmts){
      await Promise.resolve();
      db.exec('SAVEPOINT b5_sp');
      try {
        var out = [];
        for (var i = 0; i < stmts.length; i++){
          var it = stmts[i];
          var s = db.prepare(it._sql);
          var r = s.run.apply(s, it._args || []);
          out.push({ meta: { changes: r.changes } });
        }
        db.exec('RELEASE b5_sp');
        return out;
      } catch(e){
        try { db.exec('ROLLBACK TO b5_sp'); db.exec('RELEASE b5_sp'); } catch(_) {}
        throw e;
      }
    }
  };
}

function freshEnv(balance){
  var mem = new sqlite.DatabaseSync(':memory:');
  mem.exec('PRAGMA foreign_keys = ON;');
  var migRes = bootstrap.applyCuratedMigrations(mem, ROOT);
  if (migRes.failed.length > 0) throw new Error('mig: ' + JSON.stringify(migRes.failed));
  mem.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)')
    .run('u1','u1@e.com','h', balance || 10000000);
  var uid = mem.prepare("SELECT id FROM users WHERE username='u1'").get().id;
  return { mem: mem, env: { apex_db: createD1(mem) }, uid: uid, user: { userId: uid, status: 'active' } };
}

(async function(){
  var mod = await import(ROOT + '/functions/api/game/buy-fs.js');
  var executeBuy = mod.executeBuy;

  console.log('\n=== B5-1: two concurrent buy-fs, same spinId ===');
  {
    var e = freshEnv();
    var betMinor = 200;
    var results = await Promise.all([
      executeBuy(e.env, e.uid, 'b5-conc-000000000001', betMinor),
      executeBuy(e.env, e.uid, 'b5-conc-000000000001', betMinor)
    ]);
    var ok = results.filter(r => r.status === 200).length;
    var cached = results.filter(r => r.body && r.body.cached === true).length;
    var conflict = results.filter(r => r.status === 409).length;
    t('at most one non-cached success', results.filter(r => r.status === 200 && r.body.cached === false).length <= 1);
    t('at least one 200', ok >= 1);
    t('others cached or 409', (cached + conflict) >= 1);
    var spins = e.mem.prepare("SELECT COUNT(*) AS c FROM spins WHERE spin_id='b5-conc-000000000001'").get().c;
    t('exactly 1 spins row', spins === 1);
    var fs = e.mem.prepare("SELECT COUNT(*) AS c FROM free_spin_sessions WHERE trigger_spin_id='b5-conc-000000000001'").get().c;
    t('exactly 1 fs session', fs === 1);
    var bal = e.mem.prepare('SELECT wallet_balance FROM users WHERE id=?').get(e.uid).wallet_balance;
    t('charged exactly once (cost=' + (betMinor*100) + ')', bal === 10000000 - betMinor*100);
  }

  console.log('\n=== B5-2: two concurrent, different spinId, balance just enough ===');
  {
    var betMinor2 = 200;
    var cost = betMinor2 * 100;
    var e2 = freshEnv(cost);
    var r2 = await Promise.all([
      executeBuy(e2.env, e2.uid, 'b5-conc-000000000002', betMinor2),
      executeBuy(e2.env, e2.uid, 'b5-conc-000000000003', betMinor2)
    ]);
    var successes = r2.filter(r => r.status === 200 && r.body.cached === false).length;
    var insuff = r2.filter(r => r.status === 400).length;
    t('exactly one charged', successes === 1);
    t('other insufficient_balance', insuff === 1);
    var bal2 = e2.mem.prepare('SELECT wallet_balance FROM users WHERE id=?').get(e2.uid).wallet_balance;
    t('balance not negative', bal2 >= 0);
  }

  console.log('\n============================================');
  console.log('total ' + pass + ' pass / ' + fail + ' fail');
  console.log('============================================');
  process.exit(fail > 0 ? 1 : 0);
})().catch(function(e){
  console.error('FATAL', e.message);
  console.error(e.stack);
  process.exit(1);
});
