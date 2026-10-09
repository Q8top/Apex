'use strict';
/* Apex · A-7 账本三层对账测试 */
const sqlite = require('node:sqlite');
const ROOT = '/root/projects/Apex';
const bootstrap = require(ROOT + '/tests/settlement/bootstrap.cjs');
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) { globalThis.crypto = require('crypto').webcrypto; }
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
let pass = 0, fail = 0;
function t(name, cond) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name); } }
function createD1(db) {
  function makeStmt(sql) {
    var args = null;
    var obj = { _sql: sql, _args: null,
      bind: function () { args = Array.prototype.slice.call(arguments); obj._args = args; return obj; },
      first: function () { var s = db.prepare(sql); return args ? s.get.apply(s, args) : s.get(); },
      run: function () { var s = db.prepare(sql); var r = args ? s.run.apply(s, args) : s.run(); return { meta: { changes: r.changes, last_row_id: r.lastInsertRowid } }; },
      all: function () { var s = db.prepare(sql); return args ? s.all.apply(s, args) : s.all(); } };
    return obj;
  }
  return {
    prepare: makeStmt,
    batch: async function (stmts) {
      db.exec('SAVEPOINT a7_sp');
      try {
        var out = [];
        for (var i = 0; i < stmts.length; i++) {
          var it = stmts[i];
          var s = db.prepare(it._sql);
          var r = s.run.apply(s, it._args || []);
          out.push({ meta: { changes: r.changes, last_row_id: r.lastInsertRowid } });
        }
        db.exec('RELEASE a7_sp');
        return out;
      } catch (e) {
        try { db.exec('ROLLBACK TO a7_sp'); db.exec('RELEASE a7_sp'); } catch(_) {}
        throw e;
      }
    }
  };
}
function freshEnv() {
  var mem = new sqlite.DatabaseSync(':memory:');
  mem.exec('PRAGMA foreign_keys = ON;');
  var migRes = bootstrap.applyCuratedMigrations(mem, ROOT);
  if (migRes.failed.length > 0) throw new Error('mig: ' + JSON.stringify(migRes.failed));
  mem.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)')
    .run('u1','u1@e.com','h',10000000);
  var uid = mem.prepare("SELECT id FROM users WHERE username='u1'").get().id;
  mem.prepare("INSERT INTO wallet_ledger (event_id,user_id,spin_id,delta,change_type,math_version) VALUES (?,?,NULL,?,?,?)")
    .run('opening-' + uid, uid, 10000000, 'opening', '1.0.0');
  return { mem: mem, env: { apex_db: createD1(mem) }, uid: uid, user: { userId: uid, status: 'active' } };
}

function layer1(mem) {
  return mem.prepare("SELECT u.id, u.wallet_balance, COALESCE(SUM(l.delta), 0) AS ledger_sum FROM users u LEFT JOIN wallet_ledger l ON l.user_id = u.id GROUP BY u.id HAVING u.wallet_balance != COALESCE(SUM(l.delta), 0)").all();
}
function layer2_opening(mem) {
  // 两个条件：① opening 重复；② 用户无 opening
  return mem.prepare(
    "SELECT user_id FROM wallet_ledger WHERE change_type='opening' GROUP BY user_id HAVING COUNT(*) > 1 " +
    "UNION ALL " +
    "SELECT u.id AS user_id FROM users u WHERE NOT EXISTS (SELECT 1 FROM wallet_ledger l WHERE l.user_id = u.id AND l.change_type = 'opening')"
  ).all();
}
function layer2_dup(mem) {
  return mem.prepare('SELECT event_id FROM wallet_ledger GROUP BY event_id HAVING COUNT(*) > 1').all();
}
function layer2_empty(mem) {
  return mem.prepare("SELECT COUNT(*) AS c FROM wallet_ledger WHERE event_id IS NULL OR event_id=''").get().c;
}
function layer3_paid(mem) {
  return mem.prepare("SELECT s.spin_id, s.bet_minor, s.win_minor, COALESCE(SUM(CASE WHEN l.change_type='bet' THEN l.delta ELSE 0 END), 0) AS bet_delta, COALESCE(SUM(CASE WHEN l.change_type='win' THEN l.delta ELSE 0 END), 0) AS win_delta FROM spins s LEFT JOIN wallet_ledger l ON l.spin_id = s.spin_id WHERE s.is_free = 0 GROUP BY s.spin_id HAVING bet_delta != -s.bet_minor OR (s.win_minor > 0 AND win_delta != s.win_minor) OR (s.win_minor = 0 AND win_delta != 0)").all();
}
function layer3_free(mem) {
  return mem.prepare("SELECT s.spin_id, s.win_minor, COALESCE(SUM(CASE WHEN l.change_type='bet' THEN 1 ELSE 0 END), 0) AS bet_count, COALESCE(SUM(CASE WHEN l.change_type='win' THEN l.delta ELSE 0 END), 0) AS win_delta FROM spins s LEFT JOIN wallet_ledger l ON l.spin_id = s.spin_id WHERE s.is_free = 1 GROUP BY s.spin_id HAVING bet_count != 0 OR (s.win_minor > 0 AND win_delta != s.win_minor) OR (s.win_minor = 0 AND win_delta != 0)").all();
}
function layer3_orphan(mem) {
  return mem.prepare("SELECT s.spin_id FROM spins s WHERE (s.bet_minor > 0 OR s.win_minor > 0) AND NOT EXISTS (SELECT 1 FROM wallet_ledger l WHERE l.spin_id = s.spin_id)").all();
}

(async function () {
  var mod = await import(ROOT + '/functions/api/game/spin.js');
  var executeSpin = mod.executeSpin;

  console.log('=== T1: 初始状态三层对账 ===');
  var e = freshEnv();
  t('T1 L1 无差异', layer1(e.mem).length === 0);
  t('T1 L2 opening 唯一', layer2_opening(e.mem).length === 0);
  t('T1 L2 无重复', layer2_dup(e.mem).length === 0);
  t('T1 L2 无空 event_id', layer2_empty(e.mem) === 0);
  t('T1 L3 付费空', layer3_paid(e.mem).length === 0);
  t('T1 L3 免费空', layer3_free(e.mem).length === 0);
  t('T1 L3 孤立空', layer3_orphan(e.mem).length === 0);

  console.log('=== T2: 一次普通 spin ===');
  e = freshEnv();
  var r2 = await executeSpin(e.env, e.user, { spinId: 'a7-t-0000000002', betMinor: 200, mode: 'real' });
  t('T2 spin 200', r2.status === 200);
  t('T2 L1 无差异', layer1(e.mem).length === 0);
  t('T2 L3 付费空', layer3_paid(e.mem).length === 0);
  t('T2 L3 孤立空', layer3_orphan(e.mem).length === 0);

  console.log('=== T3: 主动构造错误 1 - 余额变化无 ledger ===');
  e = freshEnv();
  e.mem.prepare('UPDATE users SET wallet_balance = wallet_balance - 500 WHERE id=?').run(e.uid);
  var d3 = layer1(e.mem);
  t('T3 L1 检出差异', d3.length === 1);
  t('T3 差异量 500', d3[0].wallet_balance - d3[0].ledger_sum === -500);

  console.log('=== T4: 主动构造错误 2 - ledger 重复 event_id ===');
  e = freshEnv();
  var dupOk = false;
  try {
    e.mem.prepare("INSERT INTO wallet_ledger (event_id,user_id,spin_id,delta,change_type,math_version) VALUES ('opening-1',?,NULL,0,'bet','1.0.0')").run(e.uid);
  } catch (err) { dupOk = String(err.message).indexOf('UNIQUE') >= 0; }
  t('T4 UNIQUE 阻止', dupOk);
  t('T4 L2 无重复', layer2_dup(e.mem).length === 0);

  console.log('=== T5: 主动构造错误 3 - 孤立 ledger ===');
  e = freshEnv();
  e.mem.prepare("INSERT INTO wallet_ledger (event_id,user_id,spin_id,delta,change_type,math_version) VALUES ('orphan-1',?,NULL,-100,'bet','1.0.0')").run(e.uid);
  t('T5 L3 孤立（针对 spins）空', layer3_orphan(e.mem).length === 0);
  t('T5 L1 检出差异', layer1(e.mem).length === 1);

  console.log('=== T6: 主动构造错误 4 - opening 缺失 ===');
  e = freshEnv();
  e.mem.prepare("DELETE FROM wallet_ledger WHERE user_id = ? AND change_type = 'opening'").run(e.uid);
  t('T6 L2 检出 opening 缺失', layer2_opening(e.mem).length === 1);

  console.log('=== T7: 主动构造错误 5 - 付费局 bet 重复 ===');
  e = freshEnv();
  await executeSpin(e.env, e.user, { spinId: 'a7-t-0000000007', betMinor: 200, mode: 'real' });
  e.mem.prepare("INSERT INTO wallet_ledger (event_id,user_id,spin_id,delta,change_type,math_version) VALUES (?,?,?,?,?,?)")
    .run('dup-' + Date.now(), e.uid, 'a7-t-0000000007', -200, 'bet', '1.0.0');
  e.mem.prepare('UPDATE users SET wallet_balance = wallet_balance - 200 WHERE id=?').run(e.uid);
  t('T7 L3 检出 bet 重复', layer3_paid(e.mem).length === 1);

  console.log('=== T8: 主动构造错误 6 - win 缺失 ===');
  e = freshEnv();
  e.mem.prepare("INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,effective_bet_minor,balance_before,balance_after,balance_delta,result_json,game_version,math_version) VALUES (?,?,'real',0,NULL,200,1000,200,10000000,10000800,800,'{}','1.0.0','1.0.0')").run('a7-manual-08', e.uid);
  e.mem.prepare("INSERT INTO wallet_ledger (event_id,user_id,spin_id,delta,change_type,math_version) VALUES (?,?,?,?,?,?)").run('b-08', e.uid, 'a7-manual-08', -200, 'bet', '1.0.0');
  t('T8 L3 检出 win 缺失', layer3_paid(e.mem).length === 1);

  console.log('=== T9: 主动构造错误 7 - 免费局有 bet ===');
  e = freshEnv();
  e.mem.prepare("INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,effective_bet_minor,balance_before,balance_after,balance_delta,result_json,game_version,math_version) VALUES (?,?,'real',1,10,200,500,200,10000000,10000500,500,'{}','1.0.0','1.0.0')").run('a7-manual-09', e.uid);
  e.mem.prepare("INSERT INTO wallet_ledger (event_id,user_id,spin_id,delta,change_type,math_version) VALUES (?,?,?,?,?,?)").run('b-09', e.uid, 'a7-manual-09', -200, 'bet', '1.0.0');
  t('T9 L3 检出免费局 bet', layer3_free(e.mem).length === 1);

  console.log('=== T10: 20 spin 后三层对账 ===');
  e = freshEnv();
  for (var i = 0; i < 20; i++) {
    var sid = 'a7-multi-' + ('00000000' + i).slice(-10);
    await executeSpin(e.env, e.user, { spinId: sid, betMinor: 100, mode: 'real' });
  }
  t('T10 L1 无差异', layer1(e.mem).length === 0);
  t('T10 L3 付费空', layer3_paid(e.mem).length === 0);
  t('T10 L3 孤立空', layer3_orphan(e.mem).length === 0);
  var total = e.mem.prepare('SELECT COUNT(*) AS c FROM wallet_ledger').get().c;
  t('T10 ledger > 20', total > 20);

  console.log('============================================');
  console.log('总计 ' + pass + ' 通过 / ' + fail + ' 失败');
  console.log('============================================');
  process.exit(fail > 0 ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e.message); console.error(e.stack); process.exit(1); });
