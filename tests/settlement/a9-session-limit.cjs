'use strict';
/* Apex · A-9 Session 配额 trigger 测试
 * 验证 BEFORE INSERT trigger 是否在 SQLite 中按预期工作。
 * 若通过，说明 trigger 机制可用（D1 需实测）。
 */
const sqlite = require('node:sqlite');
const ROOT = '/root/projects/Apex';
const bootstrap = require(ROOT + '/tests/settlement/bootstrap.cjs');
const fs = require('node:fs');

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

var mem = new sqlite.DatabaseSync(':memory:');
mem.exec('PRAGMA foreign_keys = ON;');
var migRes = bootstrap.applyCuratedMigrations(mem, ROOT);
if (migRes.failed.length > 0) { console.error(migRes.failed); process.exit(2); }

// 应用 trigger 迁移（bootstrap 未含 0032，单独加载）
mem.exec(fs.readFileSync(ROOT + '/migrations/0032_sessions_limit_trigger.sql', 'utf-8'));
console.log('  [MIG] 0032_sessions_limit_trigger.sql applied');

// 建用户
mem.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e.com','h',10000);
var uid = mem.prepare("SELECT id FROM users WHERE username='u1'").get().id;

function insertSession(sid, userId, expiresInDays) {
  var exp = new Date(Date.now() + (expiresInDays || 7) * 86400000).toISOString();
  return mem.prepare(
    "INSERT INTO sessions (id, user_id, created_at, expires_at, revoked_at) VALUES (?, ?, CURRENT_TIMESTAMP, ?, NULL)"
  ).run(sid, userId, exp);
}

console.log('\n=== T1: 插入 1 个 ===');
insertSession('sess-0001', uid);
t('T1 计数 1', mem.prepare('SELECT COUNT(*) AS c FROM sessions').get().c === 1);

console.log('\n=== T2: 插到 20 个 ===');
for (var i = 2; i <= 20; i++) {
  insertSession('sess-' + ('0000' + i).slice(-4), uid);
}
t('T2 计数 20', mem.prepare('SELECT COUNT(*) AS c FROM sessions').get().c === 20);

console.log('\n=== T3: 第 21 个 → trigger ABORT ===');
var aborted = false;
var msg = '';
try {
  insertSession('sess-0021', uid);
} catch (e) {
  aborted = true;
  msg = String(e.message || '');
}
t('T3 ABORT 触发', aborted);
t('T3 错误含 session_limit_exceeded', msg.indexOf('session_limit_exceeded') >= 0);
t('T3 计数仍 20', mem.prepare('SELECT COUNT(*) AS c FROM sessions').get().c === 20);

console.log('\n=== T4: 撤销 1 个后可插入 ===');
mem.prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = 'sess-0001'").run();
try {
  insertSession('sess-0022', uid);
  t('T4 撤销后可插', true);
} catch (e) {
  t('T4 撤销后可插', false);
  console.log('     err:', e.message);
}
t('T4 有效计数 20', mem.prepare("SELECT COUNT(*) AS c FROM sessions WHERE user_id=? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP").get(uid).c === 20);

console.log('\n=== T5: 删除 1 个后可插入 ===');
mem.prepare("DELETE FROM sessions WHERE id = 'sess-0002'").run();
insertSession('sess-0023', uid);
t('T5 删除后可插', mem.prepare("SELECT COUNT(*) AS c FROM sessions WHERE id='sess-0023'").get().c === 1);

console.log('\n=== T6: 过期 session 不计入配额 ===');
// 建新用户，插 20 个过期 session
mem.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u2','u2@e.com','h',10000);
var uid2 = mem.prepare("SELECT id FROM users WHERE username='u2'").get().id;
var pastExp = new Date(Date.now() - 86400000).toISOString();
for (var j = 0; j < 25; j++) {
  mem.prepare(
    "INSERT INTO sessions (id, user_id, created_at, expires_at, revoked_at) VALUES (?, ?, CURRENT_TIMESTAMP, ?, NULL)"
  ).run('u2-exp-' + j, uid2, pastExp);
}
try {
  insertSession('u2-new', uid2);
  t('T6 过期不计入，可插入', true);
} catch (e) {
  t('T6 过期不计入，可插入', false);
}

console.log('\n=== T7: 撤销的超限不计入 ===');
mem.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u3','u3@e.com','h',10000);
var uid3 = mem.prepare("SELECT id FROM users WHERE username='u3'").get().id;
var futureExp = new Date(Date.now() + 86400000).toISOString();
for (var k = 0; k < 25; k++) {
  mem.prepare(
    "INSERT INTO sessions (id, user_id, created_at, expires_at, revoked_at) VALUES (?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)"
  ).run('u3-rev-' + k, uid3, futureExp);
}
try {
  insertSession('u3-new', uid3);
  t('T7 已撤销不计入，可插入', true);
} catch (e) {
  t('T7 已撤销不计入，可插入', false);
}

console.log('\n=== T8: 多用户隔离 ===');
// uid2 有 1 个有效 session，uid3 有 1 个，uid 有 20 个
// 给 uid2 插到 20 个
for (var m = 0; m < 19; m++) {
  insertSession('u2-fill-' + m, uid2);
}
t('T8 uid2 计数 20', mem.prepare("SELECT COUNT(*) AS c FROM sessions WHERE user_id=? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP").get(uid2).c === 20);
try {
  insertSession('u2-21', uid2);
  t('T8 uid2 第 21 ABORT', false);
} catch (e) {
  t('T8 uid2 第 21 ABORT', true);
}
// uid3 不受影响
try {
  insertSession('u3-still-ok', uid3);
  t('T8 uid3 不受影响', true);
} catch (e) {
  t('T8 uid3 不受影响', false);
}

console.log('\n============================================');
console.log('总计 ' + pass + ' 通过 / ' + fail + ' 失败');
console.log('============================================');
console.log('');
console.log('注意：本测试用 node:sqlite，trigger 行为与 D1 可能不同。');
console.log('A-9 定稿仍需真实 D1 复核。');
process.exit(fail > 0 ? 1 : 0);
