'use strict';
/* Apex · A-8 备份恢复演练（本地 SQLite 快照）
 *
 * 目标：
 *   1. 建一份有真实数据的库（含 spins / ledger / chains / FS）
 *   2. dump 到 SQL 文件
 *   3. 建新空库，从 dump 恢复
 *   4. 对比表 / 行数 / 关键字段一致
 *   5. 恢复后三层对账无差异
 *   6. 恢复后可以继续正常 spin
 *
 * 局限：本地 SQLite dump ≠ D1 export/import。真实 D1 备份恢复流程待 Staging。
 */
const fs = require('node:fs');
const path = require('node:path');
const sqlite = require('node:sqlite');
const ROOT = '/root/projects/Apex';
const bootstrap = require(ROOT + '/tests/settlement/bootstrap.cjs');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

function createD1(db) {
  function makeStmt(sql) {
    var args = null;
    var obj = {
      _sql: sql, _args: null,
      bind: function () { args = Array.prototype.slice.call(arguments); obj._args = args; return obj; },
      first: function () { var s = db.prepare(sql); return args ? s.get.apply(s, args) : s.get(); },
      run: function () { var s = db.prepare(sql); var r = args ? s.run.apply(s, args) : s.run(); return { meta: { changes: r.changes, last_row_id: r.lastInsertRowid } }; },
      all: function () { var s = db.prepare(sql); return args ? s.all.apply(s, args) : s.all(); }
    };
    return obj;
  }
  return {
    prepare: makeStmt,
    batch: async function (stmts) {
      db.exec('SAVEPOINT bk_sp');
      try {
        var out = [];
        for (var i = 0; i < stmts.length; i++) {
          var it = stmts[i];
          var s = db.prepare(it._sql);
          var r = s.run.apply(s, it._args || []);
          out.push({ meta: { changes: r.changes, last_row_id: r.lastInsertRowid } });
        }
        db.exec('RELEASE bk_sp');
        return out;
      } catch (e) {
        try { db.exec('ROLLBACK TO bk_sp'); db.exec('RELEASE bk_sp'); } catch(_) {}
        throw e;
      }
    }
  };
}

// 完整 schema 表清单（从 bootstrap 迁移中提取的关键业务表）
const TABLES = ['users','sessions','spins','free_spin_sessions','wallet_ledger','reward_chains','_settlement_guard'];

(async function () {
  var mod = await import(ROOT + '/functions/api/game/spin.js');
  var executeSpin = mod.executeSpin;

  console.log('\n=== 1. 建源库 + 灌数据 ===');
  var src = new sqlite.DatabaseSync(':memory:');
  src.exec('PRAGMA foreign_keys = ON;');
  var migRes = bootstrap.applyCuratedMigrations(src, ROOT);
  if (migRes.failed.length > 0) { console.error(migRes.failed); process.exit(2); }

  // 建 2 个用户
  src.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e','h',10000000);
  src.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u2','u2@e','h',5000000);
  var uid1 = src.prepare("SELECT id FROM users WHERE username='u1'").get().id;
  var uid2 = src.prepare("SELECT id FROM users WHERE username='u2'").get().id;

  // 写 opening
  src.prepare("INSERT INTO wallet_ledger (event_id,user_id,spin_id,delta,change_type,math_version) VALUES (?,?,NULL,?,?,?)").run('opening-' + uid1, uid1, 10000000, 'opening', '1.0.0');
  src.prepare("INSERT INTO wallet_ledger (event_id,user_id,spin_id,delta,change_type,math_version) VALUES (?,?,NULL,?,?,?)").run('opening-' + uid2, uid2, 5000000, 'opening', '1.0.0');

  // 跑 15 次 spin
  var srcEnv = { apex_db: createD1(src) };
  for (var i = 0; i < 15; i++) {
    var sid = 'bk-spin-' + ('00000000' + i).slice(-10);
    await executeSpin(srcEnv, { userId: uid1, status: 'active' }, { spinId: sid, betMinor: 200, mode: 'real' });
  }
  t('源库 15 次 spin', src.prepare("SELECT COUNT(*) AS c FROM spins").get().c === 15);

  // 快照行数
  var srcCounts = {};
  TABLES.forEach(function(tbl){
    srcCounts[tbl] = src.prepare("SELECT COUNT(*) AS c FROM " + tbl).get().c;
  });
  console.log('  源库行数:', JSON.stringify(srcCounts));

  var srcBalance = src.prepare("SELECT wallet_balance FROM users WHERE id=?").get(uid1).wallet_balance;
  var srcLedgerSum = src.prepare("SELECT SUM(delta) AS s FROM wallet_ledger WHERE user_id=?").get(uid1).s;

  console.log('\n=== 2. Dump 到 SQL 文件 ===');
  // 手工 dump：按表顺序导出 INSERT 语句
  // 只 dump INSERT 数据（schema 由 bootstrap 在目标库重建）
  var dump = [];
  TABLES.forEach(function(tbl){
    var rows = src.prepare("SELECT * FROM " + tbl).all();
    if (rows.length === 0) return;
    var cols = Object.keys(rows[0]);
    rows.forEach(function(r) {
      var vals = cols.map(function(c) {
        var v = r[c];
        if (v === null) return 'NULL';
        if (typeof v === 'number') return String(v);
        return "'" + String(v).replace(/'/g, "''") + "'";
      });
      dump.push("INSERT INTO " + tbl + " (" + cols.join(',') + ") VALUES (" + vals.join(',') + ");");
    });
  });

  var dumpSql = dump.join('\n');
  t('dump 非空', dumpSql.length > 100);
  var dumpPath = '/tmp/apex-backup-test.sql';
  fs.writeFileSync(dumpPath, dumpSql);
  t('dump 文件已写', fs.existsSync(dumpPath));
  console.log('  dump 大小:', dumpSql.length, '字节');

  console.log('\n=== 3. 新建空库：先 bootstrap schema，再灌数据 ===');
  var dst = new sqlite.DatabaseSync(':memory:');
  dst.exec('PRAGMA foreign_keys = ON;');
  var migDst = bootstrap.applyCuratedMigrations(dst, ROOT);
  if (migDst.failed.length > 0) { console.error(migDst.failed); process.exit(2); }
  t('bootstrap schema 重建', migDst.applied.length > 0);
  // 先清空 bootstrap 自动写入的数据（opening / guard / 等）
  dst.exec('PRAGMA foreign_keys = OFF;');
  TABLES.forEach(function(tbl){
    try { dst.exec('DELETE FROM ' + tbl + ';'); } catch(e) {}
  });
  // 灌 dump
  dst.exec('PRAGMA foreign_keys = OFF;');
  dst.exec(dumpSql);
  dst.exec('PRAGMA foreign_keys = ON;');
  t('恢复成功', true);

  console.log('\n=== 4. 表 / 行数一致 ===');
  TABLES.forEach(function(tbl){
    var n = dst.prepare("SELECT COUNT(*) AS c FROM " + tbl).get().c;
    t(tbl + ' 行数一致', n === srcCounts[tbl]);
  });

  console.log('\n=== 5. 关键字段一致 ===');
  var dstBalance = dst.prepare("SELECT wallet_balance FROM users WHERE id=?").get(uid1).wallet_balance;
  t('uid1 余额一致', dstBalance === srcBalance);
  var dstLedgerSum = dst.prepare("SELECT SUM(delta) AS s FROM wallet_ledger WHERE user_id=?").get(uid1).s;
  t('uid1 ledger 总和一致', dstLedgerSum === srcLedgerSum);

  console.log('\n=== 6. 恢复后三层对账 ===');
  function layer1(db) {
    return db.prepare("SELECT u.id FROM users u LEFT JOIN wallet_ledger l ON l.user_id=u.id GROUP BY u.id HAVING u.wallet_balance != COALESCE(SUM(l.delta),0)").all();
  }
  function layer3_paid(db) {
    return db.prepare("SELECT s.spin_id FROM spins s LEFT JOIN wallet_ledger l ON l.spin_id=s.spin_id WHERE s.is_free=0 GROUP BY s.spin_id HAVING COALESCE(SUM(CASE WHEN l.change_type='bet' THEN l.delta ELSE 0 END),0) != -s.bet_minor OR (s.win_minor>0 AND COALESCE(SUM(CASE WHEN l.change_type='win' THEN l.delta ELSE 0 END),0) != s.win_minor)").all();
  }
  t('L1 无差异', layer1(dst).length === 0);
  t('L3 付费局无差异', layer3_paid(dst).length === 0);

  console.log('\n=== 7. 恢复后继续 spin ===');
  var dstEnv = { apex_db: createD1(dst) };
  var r7 = await executeSpin(dstEnv, { userId: uid1, status: 'active' }, { spinId: 'bk-after-restore-01', betMinor: 200, mode: 'real' });
  t('恢复后 spin 成功', r7.status === 200);
  t('恢复后 L1 仍无差异', layer1(dst).length === 0);

  // 清理
  try { fs.unlinkSync(dumpPath); } catch(e) {}

  console.log('\n============================================');
  console.log('总计 ' + pass + ' 通过 / ' + fail + ' 失败');
  console.log('============================================');
  console.log('');
  console.log('局限：本地 SQLite dump ≠ D1 export/import。真实流程待 Staging。');
  process.exit(fail > 0 ? 1 : 0);
})().catch(function(e) {
  console.error('FATAL', e.message);
  console.error(e.stack);
  process.exit(1);
});
