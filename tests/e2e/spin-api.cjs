'use strict';
/* Apex · spin.js API 端到端（mock D1 + 真 executeSpin）
 * 验证整条 API 逻辑：幂等 / 扣款 / 派彩 / FS / 余额一致性
 */
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
var sqlite = require('node:sqlite');

// ---------- 环境准备 ----------
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

// ---------- Mock D1 ----------
function createMockD1(db) {
  function wrap(stmt) {
    return {
      bind: function () {
        var args = Array.prototype.slice.call(arguments);
        return {
          first: function () {
            var s = db.prepare(stmt);
            return s.get.apply(s, args);
          },
          run: function () {
            var s = db.prepare(stmt);
            var r = s.run.apply(s, args);
            return { meta: { changes: r.changes, last_row_id: r.lastInsertRowid } };
          },
          all: function () {
            var s = db.prepare(stmt);
            return s.all.apply(s, args);
          }
        };
      }
    };
  }
  return {
    prepare: wrap,
    batch: async function (stmts) {
      // node:sqlite 无原生 batch，逐个执行
      var results = [];
      for (var i = 0; i < stmts.length; i++) {
        // 每个 stmt 是 { first/run/all } 但缺 sql；
        // 用闭包替代：spins.js 传的是 { .bind(...).run() } 之后的对象
        // 实际它给的是 statement 对象——但我们 mock 里 prepared 是外层 wrap
        // 简化：直接执行
        var r = stmts[i];
        // r 是 { meta } 对象（已在 bind().run() 时执行）
        results.push(r);
      }
      return results;
    }
  };
}

// 更好方案：batch 收 prepare 对象
function createMockD1v2(db) {
  function makeStmt(sql) {
    var bound = null;
    return {
      bind: function () {
        bound = Array.prototype.slice.call(arguments);
        return this;
      },
      first: function () {
        var s = db.prepare(sql);
        return bound ? s.get.apply(s, bound) : s.get();
      },
      run: function () {
        var s = db.prepare(sql);
        var r = bound ? s.run.apply(s, bound) : s.run();
        return { meta: { changes: r.changes, last_row_id: r.lastInsertRowid } };
      },
      all: function () {
        var s = db.prepare(sql);
        return bound ? s.all.apply(s, bound) : s.all();
      }
    };
  }
  return {
    prepare: makeStmt,
    batch: async function (stmts) {
      // stmts 里每个是已 .bind() 的 makeStmt 对象；缺 sql 信息。
      // 真 D1 是执行 INSERT/UPDATE 并返回 meta。
      // 我们简化：stmts 对象在 bind 时已存 sql 引用；见下 rewrite
      throw new Error('not used');
    }
  };
}

// 最简方案：mock D1 的 prepare 保留 sql，bind 后返回可执行对象
function createD1(db) {
  var queue = [];
  function makeStmt(sql) {
    var args = null;
    var obj = {
      _sql: sql,
      _args: null,
      bind: function () {
        args = Array.prototype.slice.call(arguments);
        obj._args = args;
        queue.push(obj);
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
      // stmts 是已经 bind 过、被 push 进 queue 的对象；改用传参：
      // 我们把 batch 简化：接受数组，每个元素执行其 _sql + _args
      var out = [];
      for (var i = 0; i < stmts.length; i++) {
        var it = stmts[i];
        var s = db.prepare(it._sql);
        var r = s.run.apply(s, it._args);
        out.push({ meta: { changes: r.changes, last_row_id: r.lastInsertRowid } });
      }
      return out;
    }
  };
}

// ---------- 引导数据库 ----------
var mem = new sqlite.DatabaseSync(':memory:');
mem.exec('PRAGMA foreign_keys = ON;');
var bootstrap = require(ROOT + '/tests/settlement/bootstrap.cjs');
var migRes = bootstrap.applyCuratedMigrations(mem, ROOT);
if (migRes.failed.length > 0) {
  console.error('migration failed:', migRes.failed);
  process.exit(2);
}
console.log('  [MIG] applied ' + migRes.applied.length + ' migrations');

var d1 = createD1(mem);

// ---------- 加载 executeSpin ----------
(async function () {
  var mod = await import(path.join(ROOT, 'functions/api/game/spin.js'));
  var executeSpin = mod.executeSpin;

  var pass = 0, fail = 0;
  function t(name, cond) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name); }
  }

  // 准备用户
  mem.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run('p1','p1@e.com','h',1000000);
  var uid = mem.prepare("SELECT id FROM users WHERE username='p1'").get().id;
  var env = { apex_db: d1 };
  var user = { userId: uid };

  console.log('\n=== 1) 首次 spin ===');
  var r1 = await executeSpin(env, user, { spinId: 'e2e-test-0000000001', betMinor: 200, mode: 'real' });
  t('status 200', r1.status === 200);
  t('success true', r1.body.success === true);
  t('cached false', r1.body.cached === false);
  t('有 winMinor', typeof r1.body.winMinor === 'number');
  t('balanceBefore = 1000000', r1.body.balanceBefore === 1000000);
  t('balanceAfter 一致', r1.body.balanceAfter === 1000000 - 200 + r1.body.winMinor);

  var dbBal = mem.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid).wallet_balance;
  t('DB 余额 = balanceAfter', dbBal === r1.body.balanceAfter);

  var spinRow = mem.prepare('SELECT * FROM spins WHERE spin_id=?').get('e2e-test-0000000001');
  t('spins 有记录', !!spinRow);
  t('记录 win_minor 一致', spinRow.win_minor === r1.body.winMinor);

  console.log('\n=== 2) 幂等（重复 spinId）===');
  var r2 = await executeSpin(env, user, { spinId: 'e2e-test-0000000001', betMinor: 200, mode: 'real' });
  t('status 200', r2.status === 200);
  t('cached true', r2.body.cached === true);
  t('winMinor 与首次一致', r2.body.winMinor === r1.body.winMinor);
  t('balanceAfter 与首次一致', r2.body.balanceAfter === r1.body.balanceAfter);

  var dbBal2 = mem.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid).wallet_balance;
  t('余额未二次扣（幂等）', dbBal2 === dbBal);

  var spinCount = mem.prepare('SELECT COUNT(*) AS c FROM spins WHERE spin_id=?').get('e2e-test-0000000001').c;
  t('spins 只有 1 条（幂等）', spinCount === 1);

  console.log('\n=== 3) 余额不足 ===');
  mem.prepare('UPDATE users SET wallet_balance=? WHERE id=?').run(50, uid);
  var r3 = await executeSpin(env, user, { spinId: 'e2e-test-0000000002', betMinor: 200, mode: 'real' });
  t('status 400', r3.status === 400);
  t('code insufficient_balance', r3.body.code === 'insufficient_balance');

  console.log('\n=== 4) 伪造 isFree（服务端忽略）===');
  mem.prepare('UPDATE users SET wallet_balance=? WHERE id=?').run(1000000, uid);
  var r4 = await executeSpin(env, user, { spinId: 'e2e-test-0000000003', betMinor: 200, mode: 'real', isFree: true });
  t('status 200', r4.status === 200);
  t('balanceBefore = 1000000', r4.body.balanceBefore === 1000000);
  // 关键：isFree 被忽略 → 扣了 bet → balanceAfter = before - bet + win
  t('扣了 bet（isFree 被忽略）', r4.body.balanceAfter === r4.body.balanceBefore - 200 + r4.body.winMinor);

  console.log('\n=== 5) FS session（模拟已存在）===');
  mem.prepare(
    'INSERT INTO free_spin_sessions (user_id,trigger_spin_id,mode,bet_minor,pay_scale,total_spins,remaining_spins,expires_at) VALUES (?,?,?,?,?,?,?,?)'
  ).run(uid, 'fs-trig-001', 'real', 200, 2.55, 3, 3, new Date(Date.now()+86400000).toISOString());
  var balBeforeFs = mem.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid).wallet_balance;
  var r5 = await executeSpin(env, user, { spinId: 'e2e-test-0000000004', betMinor: 200, mode: 'real', isFree: true });
  t('status 200', r5.status === 200);
  t('FS 中不扣款（balanceBefore >= after）', r5.body.balanceAfter >= r5.body.balanceBefore);
  var dbBal5 = mem.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid).wallet_balance;
  t('DB 余额 = before + win', dbBal5 === balBeforeFs + r5.body.winMinor);

  var fs = mem.prepare("SELECT remaining_spins FROM free_spin_sessions WHERE user_id=? AND status='active'").get(uid);
  t('FS remaining 减 1', fs && fs.remaining_spins === 2);

  var spinRowFs = mem.prepare('SELECT is_free, free_round_total FROM spins WHERE spin_id=?').get('e2e-test-0000000004');
  t('spins 记录 is_free=1', spinRowFs && spinRowFs.is_free === 1);
  t('spins 记录 free_round_total=3', spinRowFs && spinRowFs.free_round_total === 3);

  console.log('\n=== 6) FS 用尽后 completed ===');
  await executeSpin(env, user, { spinId: 'e2e-test-0000000005', betMinor: 200, mode: 'real', isFree: true });
  await executeSpin(env, user, { spinId: 'e2e-test-0000000006', betMinor: 200, mode: 'real', isFree: true });
  var fsAfter = mem.prepare("SELECT remaining_spins, status FROM free_spin_sessions WHERE user_id=? ORDER BY id DESC LIMIT 1").get(uid);
  t('remaining = 0', fsAfter.remaining_spins === 0);
  t('status = completed', fsAfter.status === 'completed');

  console.log('\n=== 7) FS 完成后伪造 isFree 应扣款 ===');
  var balBefore7 = mem.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid).wallet_balance;
  var r7 = await executeSpin(env, user, { spinId: 'e2e-test-0000000007', betMinor: 200, mode: 'real', isFree: true });
  t('status 200', r7.status === 200);
  t('余额已扣（FS 结束后 isFree 无效）', r7.body.balanceAfter === balBefore7 - 200 + r7.body.winMinor);

  console.log('\n============================================');
  console.log('总计 ' + pass + ' 通过 / ' + fail + ' 失败');
  console.log('============================================');
  process.exit(fail > 0 ? 1 : 0);
})().catch(function (e) {
  console.error('FATAL', e.message);
  console.error(e.stack);
  process.exit(1);
});
