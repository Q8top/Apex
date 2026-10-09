'use strict';
/* Apex · Spin API SQL 端到端测试（Node + node:sqlite 模拟 D1）
 * 验证 spin.js 用到的所有 SQL 语句在真 SQLite 上的行为：
 *   - 表结构就位
 *   - 幂等（重复 spin_id 被拒）
 *   - 并发扣款保护（UPDATE ... WHERE balance >= ?）
 *   - FS session 生命周期
 *   - 级联删除
 */
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');

// node:sqlite 需要 Node 22.5+
var sqlite;
try { sqlite = require('node:sqlite'); }
catch (e) {
  console.error('需 Node 22.5+ 支持 node:sqlite');
  process.exit(2);
}

var db = new sqlite.DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON;');

// 按顺序跑迁移
['0001_initial.sql','0024_users_wallet_balance.sql','0025_spins.sql','0026_free_spin_sessions.sql'].forEach(function(f){
  var p = path.join(ROOT, 'migrations', f);
  db.exec(fs.readFileSync(p, 'utf-8'));
  console.log('  [APPLY] ' + f);
});

var pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}
function throws(name, fn) {
  var threw = false;
  try { fn(); } catch (e) { threw = true; }
  t(name, threw);
}

console.log('\n=== 1) 表结构 ===');
var tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(function(r){ return r.name; });
t('users 存在', tables.indexOf('users') >= 0);
t('spins 存在', tables.indexOf('spins') >= 0);
t('free_spin_sessions 存在', tables.indexOf('free_spin_sessions') >= 0);

console.log('\n=== 2) 准备用户 ===');
db.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
  .run('u1', 'u1@e.com', 'h', 100000);
var uid = db.prepare("SELECT id FROM users WHERE username='u1'").get().id;
t('用户创建', typeof uid === 'number');

console.log('\n=== 3) 幂等（spin_id UNIQUE）===');
var insertSpin = db.prepare(
  'INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,multiplier_sum,balance_before,balance_after,result_json,game_version,math_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
);
insertSpin.run('spin-aaa-001', uid, 'real', 0, null, 200, 0, 0, 100000, 99800, '{}', '1.0', '1.0');
t('首插成功', true);
throws('重复 spin_id 被拒', function(){
  insertSpin.run('spin-aaa-001', uid, 'real', 0, null, 200, 0, 0, 99800, 99600, '{}', '1.0', '1.0');
});

console.log('\n=== 4) 并发扣款保护（balance >= bet）===');
var before = db.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid).wallet_balance;
t('起始余额 100000', before === 100000);
// 正常扣
var r = db.prepare(
  'UPDATE users SET wallet_balance = wallet_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wallet_balance >= ?'
).run(200, uid, 200);
t('扣款成功 changes=1', r.changes === 1);
t('余额 = 99800', db.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid).wallet_balance === 99800);
// 余额不足被拒
var r2 = db.prepare(
  'UPDATE users SET wallet_balance = wallet_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wallet_balance >= ?'
).run(200000, uid, 200000);
t('超扣 changes=0', r2.changes === 0);
t('余额未变', db.prepare('SELECT wallet_balance FROM users WHERE id=?').get(uid).wallet_balance === 99800);

console.log('\n=== 5) FS session 生命周期 ===');
db.prepare(
  'INSERT INTO free_spin_sessions (user_id,trigger_spin_id,mode,bet_minor,pay_scale,total_spins,remaining_spins,expires_at) VALUES (?,?,?,?,?,?,?,?)'
).run(uid, 'spin-fs-trigger-1', 'real', 200, 2.55, 3, 3, new Date(Date.now()+86400000).toISOString());

var active = db.prepare(
  "SELECT id, remaining_spins FROM free_spin_sessions WHERE user_id=? AND status='active' AND remaining_spins > 0 AND expires_at > ? ORDER BY id DESC LIMIT 1"
).get(uid, new Date().toISOString());
t('查到 active session', active && active.remaining_spins === 3);

// 每次 FS 用一次
var useFs = db.prepare(
  "UPDATE free_spin_sessions SET remaining_spins = remaining_spins - 1, total_win_minor = total_win_minor + ?, status = CASE WHEN remaining_spins - 1 <= 0 THEN 'completed' ELSE status END, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active' AND remaining_spins > 0"
);
useFs.run(0, active.id);
t('用一次 remaining=2', db.prepare('SELECT remaining_spins FROM free_spin_sessions WHERE id=?').get(active.id).remaining_spins === 2);
t('status 仍 active', db.prepare('SELECT status FROM free_spin_sessions WHERE id=?').get(active.id).status === 'active');
useFs.run(0, active.id);
t('用二次 remaining=1', db.prepare('SELECT remaining_spins FROM free_spin_sessions WHERE id=?').get(active.id).remaining_spins === 1);
useFs.run(5000, active.id);
t('用三次 remaining=0', db.prepare('SELECT remaining_spins FROM free_spin_sessions WHERE id=?').get(active.id).remaining_spins === 0);
t('用三次后 status=completed', db.prepare('SELECT status FROM free_spin_sessions WHERE id=?').get(active.id).status === 'completed');

// 关键：completed 后再查不到
var after = db.prepare(
  "SELECT id FROM free_spin_sessions WHERE user_id=? AND status='active' AND remaining_spins > 0 AND expires_at > ? ORDER BY id DESC LIMIT 1"
).get(uid, new Date().toISOString());
t('completed 后查不到 active', after === undefined);

// 关键：completed 后再用被拒
var r3 = useFs.run(0, active.id);
t('completed 再用 changes=0', r3.changes === 0);

console.log('\n=== 6) FS 归零→completed 原子保证 ===');
db.prepare(
  'INSERT INTO free_spin_sessions (user_id,trigger_spin_id,mode,bet_minor,pay_scale,total_spins,remaining_spins,expires_at) VALUES (?,?,?,?,?,?,?,?)'
).run(uid, 'spin-fs-trigger-2', 'real', 200, 2.55, 1, 1, new Date(Date.now()+86400000).toISOString());
var s2 = db.prepare("SELECT id FROM free_spin_sessions WHERE user_id=? AND status='active' ORDER BY id DESC LIMIT 1").get(uid).id;
var r4 = useFs.run(0, s2);
t('remaining=1 → 0 且 status 变 completed', db.prepare('SELECT status FROM free_spin_sessions WHERE id=?').get(s2).status === 'completed');

console.log('\n=== 7) 级联删除 ===');
var fsCountBefore = db.prepare('SELECT COUNT(*) AS c FROM free_spin_sessions WHERE user_id=?').get(uid).c;
var spinCountBefore = db.prepare('SELECT COUNT(*) AS c FROM spins WHERE user_id=?').get(uid).c;
t('删除前有 FS 记录', fsCountBefore > 0);
t('删除前有 spin 记录', spinCountBefore > 0);
db.prepare('DELETE FROM users WHERE id=?').run(uid);
t('删除后 spins 清空', db.prepare('SELECT COUNT(*) AS c FROM spins WHERE user_id=?').get(uid).c === 0);
t('删除后 FS 清空', db.prepare('SELECT COUNT(*) AS c FROM free_spin_sessions WHERE user_id=?').get(uid).c === 0);

console.log('\n============================================');
console.log('总计 ' + pass + ' 通过 / ' + fail + ' 失败 / ' + (pass+fail) + ' 总数');
console.log('============================================');
process.exit(fail > 0 ? 1 : 0);
