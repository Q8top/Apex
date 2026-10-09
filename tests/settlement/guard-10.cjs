'use strict';
/* Apex · _settlement_guard 机制 10 项测试
 *
 * 目的：验证守卫表 + CASE WHEN changes() = 1 + ON CONFLICT + CHECK 的机制
 * 在 SQLite 中是否按设计工作。
 *
 * 重要：本测试用 node:sqlite（本地 SQLite），不完全等价于 D1。
 * 通过本测试 = 逻辑正确；A-3b 定稿仍需真实 D1 集成测试。
 */
const sqlite = require('node:sqlite');
const path = require('path');
const fs = require('node:fs');
const ROOT = require('node:path').resolve(__dirname, '../..');

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

function freshDb() {
  const db = new sqlite.DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');

  // 用户表
  db.exec(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    wallet_balance INTEGER NOT NULL DEFAULT 0
  );`);

  // 非负余额保护 trigger
  db.exec(`CREATE TRIGGER trg_users_balance_nonnegative_update
    BEFORE UPDATE OF wallet_balance ON users
    FOR EACH ROW
    WHEN NEW.wallet_balance < 0
    BEGIN
      SELECT RAISE(ABORT, 'insufficient_balance');
    END;`);

  db.exec(`CREATE TRIGGER trg_users_balance_nonnegative_insert
    BEFORE INSERT ON users
    FOR EACH ROW
    WHEN NEW.wallet_balance < 0
    BEGIN
      SELECT RAISE(ABORT, 'invalid_initial_balance');
    END;`);

  // 守卫表
  db.exec(`CREATE TABLE _settlement_guard (
    slot INTEGER PRIMARY KEY CHECK (slot = 1),
    guard_value INTEGER NOT NULL CHECK (guard_value = 1)
  );`);
  db.exec(`INSERT INTO _settlement_guard (slot, guard_value) VALUES (1, 1);`);

  // spins（幂等）
  db.exec(`CREATE TABLE spins (
    spin_id TEXT PRIMARY KEY,
    user_id INTEGER,
    win_minor INTEGER DEFAULT 0
  );`);

  return db;
}

function guardStmt() {
  return `INSERT INTO _settlement_guard (slot, guard_value)
    VALUES (1, CASE WHEN changes() = 1 THEN 1 ELSE 0 END)
    ON CONFLICT(slot) DO UPDATE
    SET guard_value = CASE WHEN changes() = 1 THEN 1 ELSE 0 END`;
}

function tx(db, stmts) {
  // 用 SAVEPOINT 模拟 batch 事务
  db.exec('SAVEPOINT sp');
  try {
    for (const s of stmts) db.exec(s);
    db.exec('RELEASE sp');
    return { ok: true };
  } catch (e) {
    try { db.exec('ROLLBACK TO sp'); db.exec('RELEASE sp'); } catch(_) {}
    return { ok: false, error: String(e.message || '') };
  }
}

console.log('=== 测试 1：扣款影响 1 行，哨兵通过 ===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 1000)");
  const uid = db.prepare('SELECT id FROM users').get().id;
  const r = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
  ]);
  t('T1 batch 成功', r.ok);
  t('T1 余额 = 900', db.prepare('SELECT wallet_balance FROM users').get().wallet_balance === 900);
  t('T1 guard 仍 = 1', db.prepare('SELECT guard_value FROM _settlement_guard').get().guard_value === 1);
}

console.log('\n=== 测试 2：扣款 0 行（余额不足）→ ABORT 整批回滚 ===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 99)");
  const uid = db.prepare('SELECT id FROM users').get().id;
  const r = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
  ]);
  t('T2 batch 失败', !r.ok);
  t('T2 错误含 CHECK', r.error.includes('CHECK') || r.error.includes('constraint'));
  t('T2 余额仍 = 99', db.prepare('SELECT wallet_balance FROM users').get().wallet_balance === 99);
  t('T2 guard 仍 = 1', db.prepare('SELECT guard_value FROM _settlement_guard').get().guard_value === 1);
}

console.log('\n=== 测试 3：余额 0、下注 100、中奖 200（关键场景）===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 0)");
  const uid = db.prepare('SELECT id FROM users').get().id;
  // 扣款失败，但若用 -bet + win 合并会得到 100（掩盖余额不足）
  const r = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
    `UPDATE users SET wallet_balance = wallet_balance + 200 WHERE id = ${uid}`,
    guardStmt(),
  ]);
  t('T3 batch 失败', !r.ok);
  t('T3 余额仍 = 0', db.prepare('SELECT wallet_balance FROM users').get().wallet_balance === 0);
  t('T3 派彩未执行', db.prepare('SELECT wallet_balance FROM users').get().wallet_balance === 0);
}

console.log('\n=== 测试 4：扣款成功，派彩 0 行（用户不存在）→ 整批回滚 ===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 1000)");
  const uid = db.prepare('SELECT id FROM users').get().id;
  const r = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
    // 派彩指向不存在的用户 → 影响 0 行
    `UPDATE users SET wallet_balance = wallet_balance + 200 WHERE id = 99999`,
    guardStmt(),
  ]);
  t('T4 batch 失败', !r.ok);
  t('T4 扣款已回滚', db.prepare('SELECT wallet_balance FROM users').get().wallet_balance === 1000);
  t('T4 guard 仍 = 1', db.prepare('SELECT guard_value FROM _settlement_guard').get().guard_value === 1);
}

console.log('\n=== 测试 5：扣款成功，spins UNIQUE 冲突 → 整批回滚 ===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 1000)");
  const uid = db.prepare('SELECT id FROM users').get().id;
  db.exec(`INSERT INTO spins (spin_id, user_id, win_minor) VALUES ('s-dup', ${uid}, 0)`);
  const r = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
    `INSERT INTO spins (spin_id, user_id, win_minor) VALUES ('s-dup', ${uid}, 0)`,
  ]);
  t('T5 batch 失败', !r.ok);
  t('T5 UNIQUE 错误', r.error.includes('UNIQUE') || r.error.includes('constraint'));
  t('T5 余额回滚到 1000', db.prepare('SELECT wallet_balance FROM users').get().wallet_balance === 1000);
  t('T5 spins 仍 1 条', db.prepare('SELECT COUNT(*) AS c FROM spins').get().c === 1);
}

console.log('\n=== 测试 6：扣款成功，spins 插入成功，但非零余额变更失败 ===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 1000)");
  const uid = db.prepare('SELECT id FROM users').get().id;
  const r = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
    `INSERT INTO spins (spin_id, user_id, win_minor) VALUES ('s1', ${uid}, 0)`,
    // 派彩给不存在用户
    `UPDATE users SET wallet_balance = wallet_balance + 50 WHERE id = 99999`,
    guardStmt(),
  ]);
  t('T6 batch 失败', !r.ok);
  t('T6 余额回滚', db.prepare('SELECT wallet_balance FROM users').get().wallet_balance === 1000);
  t('T6 spins 回滚', db.prepare('SELECT COUNT(*) AS c FROM spins').get().c === 0);
}

console.log('\n=== 测试 7：哨兵表已被删除（INSERT 路径）===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 1000)");
  const uid = db.prepare('SELECT id FROM users').get().id;
  // 删掉守卫行，走 INSERT 路径
  db.exec('DELETE FROM _settlement_guard');
  const r1 = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
  ]);
  t('T7a INSERT 路径 1 行成功', r1.ok);
  // 再删守卫行，测 0 行
  db.exec('DELETE FROM _settlement_guard');
  db.exec(`UPDATE users SET wallet_balance = 50 WHERE id = ${uid}`);
  const r2 = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
  ]);
  t('T7b INSERT 路径 0 行失败', !r2.ok);
}

console.log('\n=== 测试 8：哨兵表已有行（UPDATE 路径）===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 1000)");
  const uid = db.prepare('SELECT id FROM users').get().id;
  // 守卫表已有 slot=1 行（freshDb 初始化时插入）
  t('T8a 初始有守卫行', db.prepare('SELECT COUNT(*) AS c FROM _settlement_guard').get().c === 1);
  const r1 = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
  ]);
  t('T8b UPDATE 路径 1 行成功', r1.ok);
  // 0 行 → 失败
  const r2 = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 10000 WHERE id = ${uid} AND wallet_balance >= 10000`,
    guardStmt(),
  ]);
  t('T8c UPDATE 路径 0 行失败', !r2.ok);
}

console.log('\n=== 测试 9：同一 batch 内多次守卫 ===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 1000), ('u2', 1000)");
  const uid1 = db.prepare("SELECT id FROM users WHERE username='u1'").get().id;
  const uid2 = db.prepare("SELECT id FROM users WHERE username='u2'").get().id;
  const r = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid1} AND wallet_balance >= 100`,
    guardStmt(),
    `UPDATE users SET wallet_balance = wallet_balance + 100 WHERE id = ${uid2}`,
    guardStmt(),
  ]);
  t('T9 双守卫成功', r.ok);
  t('T9 u1 = 900', db.prepare("SELECT wallet_balance FROM users WHERE id=?").get(uid1).wallet_balance === 900);
  t('T9 u2 = 1100', db.prepare("SELECT wallet_balance FROM users WHERE id=?").get(uid2).wallet_balance === 1100);

  // 第二次操作 0 行
  const r2 = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid1} AND wallet_balance >= 100`,
    guardStmt(),
    `UPDATE users SET wallet_balance = wallet_balance + 100 WHERE id = 99999`,
    guardStmt(),
  ]);
  t('T9b 第二次 0 行失败回滚', !r2.ok);
  t('T9b u1 仍 900', db.prepare("SELECT wallet_balance FROM users WHERE id=?").get(uid1).wallet_balance === 900);
}

console.log('\n=== 测试 10：连续 3 次守卫，第三次失败 → 全回滚 ===');
{
  const db = freshDb();
  db.exec("INSERT INTO users (username, wallet_balance) VALUES ('u1', 1000)");
  const uid = db.prepare("SELECT id FROM users").get().id;
  const r = tx(db, [
    `UPDATE users SET wallet_balance = wallet_balance - 100 WHERE id = ${uid} AND wallet_balance >= 100`,
    guardStmt(),
    `UPDATE users SET wallet_balance = wallet_balance + 50 WHERE id = ${uid}`,
    guardStmt(),
    `UPDATE users SET wallet_balance = wallet_balance + 999 WHERE id = 99999`,
    guardStmt(),
  ]);
  t('T10 batch 失败', !r.ok);
  t('T10 余额全回滚 1000', db.prepare('SELECT wallet_balance FROM users').get().wallet_balance === 1000);
}

console.log('\n============================================');
console.log('总计 ' + pass + ' 通过 / ' + fail + ' 失败');
console.log('============================================');
console.log('');
console.log('注意：本测试用 node:sqlite，不完全等价 D1。');
console.log('A-3b 定稿仍需真实 D1 集成测试。');
process.exit(fail > 0 ? 1 : 0);
