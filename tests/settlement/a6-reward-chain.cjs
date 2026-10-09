'use strict';
/* Apex · A-6 奖励链联合一致性测试
 *
 * 覆盖施工单 §A-6.3：
 *   - 每日对账 SQL 检出：user / bet / math_version 不一致
 *   - base_spin 存在性（外键已保证）
 *   - chain_win_minor 与 base_spin.win_minor 一致性
 */
const sqlite = require('node:sqlite');
const ROOT = '/root/projects/Apex';
const bootstrap = require(ROOT + '/tests/settlement/bootstrap.cjs');

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

function freshDb() {
  var mem = new sqlite.DatabaseSync(':memory:');
  mem.exec('PRAGMA foreign_keys = ON;');
  var r = bootstrap.applyCuratedMigrations(mem, ROOT);
  if (r.failed.length > 0) throw new Error(JSON.stringify(r.failed));
  return mem;
}

// 每日对账 SQL（施工单 §A-6.3 原样）
function chainConsistencyCheck(mem) {
  return mem.prepare(
    "SELECT rc.chain_id, rc.user_id, s.user_id AS base_spin_user, " +
    "       rc.effective_bet_minor, s.bet_minor AS base_spin_bet, " +
    "       rc.math_version, s.math_version AS base_spin_math " +
    "FROM reward_chains rc " +
    "JOIN spins s ON s.spin_id = rc.base_spin_id " +
    "WHERE rc.user_id != s.user_id " +
    "   OR rc.effective_bet_minor != s.bet_minor " +
    "   OR rc.math_version != s.math_version"
  ).all();
}

// 链累计一致性
function chainWinConsistencyCheck(mem) {
  return mem.prepare(
    "SELECT rc.chain_id, rc.chain_win_minor, s.win_minor AS base_win " +
    "FROM reward_chains rc " +
    "JOIN spins s ON s.spin_id = rc.base_spin_id " +
    "WHERE rc.chain_win_minor < s.win_minor"
  ).all();
}

console.log('\n=== T1: 正常链一致 ===');
var db = freshDb();
db.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e','h',1000000);
var uid = db.prepare("SELECT id FROM users WHERE username='u1'").get().id;
db.prepare("INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,effective_bet_minor,balance_before,balance_after,balance_delta,result_json,game_version,math_version) VALUES (?,?,'real',0,NULL,200,500,200,1000000,999800,0,'{}','1.0.0','1.0.0')").run('base-spin-01', uid);
db.prepare("INSERT INTO reward_chains (chain_id,user_id,base_spin_id,effective_bet_minor,max_win_multiplier,chain_win_minor,math_version) VALUES (?,?,?,?,?,?,?)").run('ch-01', uid, 'base-spin-01', 200, 5000, 500, '1.0.0');

t('T1 一致检出 0 行', chainConsistencyCheck(db).length === 0);
t('T1 累计一致', chainWinConsistencyCheck(db).length === 0);

console.log('\n=== T2: 主动构造错误 1 - user 不一致 ===');
var db2 = freshDb();
db2.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e','h',1000000);
db2.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u2','u2@e','h',1000000);
var uid1 = db2.prepare("SELECT id FROM users WHERE username='u1'").get().id;
var uid2 = db2.prepare("SELECT id FROM users WHERE username='u2'").get().id;
db2.prepare("INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,effective_bet_minor,balance_before,balance_after,balance_delta,result_json,game_version,math_version) VALUES (?,?,'real',0,NULL,200,0,200,1000000,1000000,0,'{}','1.0.0','1.0.0')").run('base-spin-02', uid1);
// 链的 user_id 指向 u2（错误）
db2.prepare("INSERT INTO reward_chains (chain_id,user_id,base_spin_id,effective_bet_minor,max_win_multiplier,chain_win_minor,math_version) VALUES (?,?,?,?,?,?,?)").run('ch-02', uid2, 'base-spin-02', 200, 5000, 0, '1.0.0');
var res2 = chainConsistencyCheck(db2);
t('T2 检出 1 行 user 不一致', res2.length === 1);
t('T2 值正确', res2[0].user_id === uid2 && res2[0].base_spin_user === uid1);

console.log('\n=== T3: 主动构造错误 2 - bet 不一致 ===');
var db3 = freshDb();
db3.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e','h',1000000);
var uid3 = db3.prepare("SELECT id FROM users WHERE username='u1'").get().id;
db3.prepare("INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,effective_bet_minor,balance_before,balance_after,balance_delta,result_json,game_version,math_version) VALUES (?,?,'real',0,NULL,200,0,200,1000000,1000000,0,'{}','1.0.0','1.0.0')").run('base-spin-03', uid3);
// 链的 bet 是 300（与 base spin 的 200 不一致）
db3.prepare("INSERT INTO reward_chains (chain_id,user_id,base_spin_id,effective_bet_minor,max_win_multiplier,chain_win_minor,math_version) VALUES (?,?,?,?,?,?,?)").run('ch-03', uid3, 'base-spin-03', 300, 5000, 0, '1.0.0');
var res3 = chainConsistencyCheck(db3);
t('T3 检出 1 行 bet 不一致', res3.length === 1);
t('T3 bet 值正确', res3[0].effective_bet_minor === 300 && res3[0].base_spin_bet === 200);

console.log('\n=== T4: 主动构造错误 3 - math_version 不一致 ===');
var db4 = freshDb();
db4.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e','h',1000000);
var uid4 = db4.prepare("SELECT id FROM users WHERE username='u1'").get().id;
db4.prepare("INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,effective_bet_minor,balance_before,balance_after,balance_delta,result_json,game_version,math_version) VALUES (?,?,'real',0,NULL,200,0,200,1000000,1000000,0,'{}','1.0.0','1.0.0')").run('base-spin-04', uid4);
db4.prepare("INSERT INTO reward_chains (chain_id,user_id,base_spin_id,effective_bet_minor,max_win_multiplier,chain_win_minor,math_version) VALUES (?,?,?,?,?,?,?)").run('ch-04', uid4, 'base-spin-04', 200, 5000, 0, '2.0.0');
var res4 = chainConsistencyCheck(db4);
t('T4 检出 1 行 math_version 不一致', res4.length === 1);

console.log('\n=== T5: 主动构造错误 4 - chain_win < base_win ===');
var db5 = freshDb();
db5.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e','h',1000000);
var uid5 = db5.prepare("SELECT id FROM users WHERE username='u1'").get().id;
db5.prepare("INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,effective_bet_minor,balance_before,balance_after,balance_delta,result_json,game_version,math_version) VALUES (?,?,'real',0,NULL,200,5000,200,1000000,995000,0,'{}','1.0.0','1.0.0')").run('base-spin-05', uid5);
// 链的累计是 1000（< base 5000，异常）
db5.prepare("INSERT INTO reward_chains (chain_id,user_id,base_spin_id,effective_bet_minor,max_win_multiplier,chain_win_minor,math_version) VALUES (?,?,?,?,?,?,?)").run('ch-05', uid5, 'base-spin-05', 200, 5000, 1000, '1.0.0');
var res5 = chainWinConsistencyCheck(db5);
t('T5 检出 1 行累计异常', res5.length === 1);
t('T5 累计 < base_win', res5[0].chain_win_minor === 1000 && res5[0].base_win === 5000);

console.log('\n=== T6: 外键阻止链无对应 base_spin ===');
var db6 = freshDb();
db6.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e','h',1000000);
var uid6 = db6.prepare("SELECT id FROM users WHERE username='u1'").get().id;
var fkErr = false;
try {
  db6.prepare("INSERT INTO reward_chains (chain_id,user_id,base_spin_id,effective_bet_minor,max_win_multiplier,chain_win_minor,math_version) VALUES (?,?,?,?,?,?,?)").run('ch-orphan', uid6, 'no-such-spin', 200, 5000, 0, '1.0.0');
} catch (e) {
  fkErr = String(e.message).indexOf('FOREIGN KEY') >= 0;
}
t('T6 FK 阻止无 base_spin 的链', fkErr);

console.log('\n=== T7: base_spin_id UNIQUE 阻止一 spin 两链 ===');
var db7 = freshDb();
db7.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e','h',1000000);
var uid7 = db7.prepare("SELECT id FROM users WHERE username='u1'").get().id;
db7.prepare("INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,effective_bet_minor,balance_before,balance_after,balance_delta,result_json,game_version,math_version) VALUES (?,?,'real',0,NULL,200,0,200,1000000,1000000,0,'{}','1.0.0','1.0.0')").run('base-spin-07', uid7);
db7.prepare("INSERT INTO reward_chains (chain_id,user_id,base_spin_id,effective_bet_minor,max_win_multiplier,chain_win_minor,math_version) VALUES (?,?,?,?,?,?,?)").run('ch-07a', uid7, 'base-spin-07', 200, 5000, 0, '1.0.0');
var dupErr = false;
try {
  db7.prepare("INSERT INTO reward_chains (chain_id,user_id,base_spin_id,effective_bet_minor,max_win_multiplier,chain_win_minor,math_version) VALUES (?,?,?,?,?,?,?)").run('ch-07b', uid7, 'base-spin-07', 200, 5000, 0, '1.0.0');
} catch (e) {
  dupErr = String(e.message).indexOf('UNIQUE') >= 0;
}
t('T7 UNIQUE 阻止一 spin 两链', dupErr);

console.log('\n=== T8: FK RESTRICT 阻止删 base_spin ===');
var db8 = freshDb();
db8.prepare('INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)').run('u1','u1@e','h',1000000);
var uid8 = db8.prepare("SELECT id FROM users WHERE username='u1'").get().id;
db8.prepare("INSERT INTO spins (spin_id,user_id,mode,is_free,free_round_total,bet_minor,win_minor,effective_bet_minor,balance_before,balance_after,balance_delta,result_json,game_version,math_version) VALUES (?,?,'real',0,NULL,200,0,200,1000000,1000000,0,'{}','1.0.0','1.0.0')").run('base-spin-08', uid8);
db8.prepare("INSERT INTO reward_chains (chain_id,user_id,base_spin_id,effective_bet_minor,max_win_multiplier,chain_win_minor,math_version) VALUES (?,?,?,?,?,?,?)").run('ch-08', uid8, 'base-spin-08', 200, 5000, 0, '1.0.0');
var restrictErr = false;
try {
  db8.prepare("DELETE FROM spins WHERE spin_id='base-spin-08'").run();
} catch (e) {
  restrictErr = String(e.message).indexOf('FOREIGN KEY') >= 0;
}
t('T8 FK RESTRICT 阻止删 base_spin', restrictErr);

console.log('\n============================================');
console.log('总计 ' + pass + ' 通过 / ' + fail + ' 失败');
console.log('============================================');
console.log('');
console.log('局限：本地 SQLite，D1 需真实测试。');
process.exit(fail > 0 ? 1 : 0);
