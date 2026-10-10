'use strict';
/* Apex · 结算路径本地 bootstrap（curated 迁移列表）
 *
 * 生产环境用 _migrations 表追踪，跳过已应用。
 * 本地空库用本文件的 curated 列表，只跑结算路径真正依赖的迁移。
 *
 * 为什么不用全量 30 个：
 *   0006~0017 是历史 ALTER TABLE ADD COLUMN，0001_initial.sql 已包含那些列，
 *   空库上再跑会报 duplicate column name。生产靠 _migrations 追踪跳过。
 */
const fs = require('node:fs');
const path = require('node:path');

const CURATED_MIGRATIONS = [
  '0001_initial.sql',
  '0003_security_fields.sql',
  '0005_captcha_tokens.sql',
  '0021_captcha_tokens_purpose.sql',
  '0022_passkeys.sql',
  '0023_rate_limit_buckets.sql',
  '0024_users_wallet_balance.sql',
  '0025_spins.sql',
  '0026_free_spin_sessions.sql',
  '0027_settlement_guard.sql',
  '0028_wallet_ledger.sql',
  '0029_reward_chains.sql',
  '0030_spins_ext.sql',
  '0031_free_spin_sessions_ext.sql',
  '0034_spins_max_win.sql',
];

function applyCuratedMigrations(db, rootDir) {
  const applied = [];
  const failed = [];
  for (const f of CURATED_MIGRATIONS) {
    const p = path.join(rootDir, 'migrations', f);
    if (!fs.existsSync(p)) {
      failed.push({ file: f, error: 'file not found' });
      continue;
    }
    try {
      db.exec(fs.readFileSync(p, 'utf-8'));
      applied.push(f);
    } catch (e) {
      // 已应用过（duplicate column name）视为成功
      const msg = String(e.message || '');
      if (msg.includes('duplicate column name')) {
        applied.push(f + ' (skipped)');
      } else {
        failed.push({ file: f, error: msg.slice(0, 120) });
      }
    }
  }
  return { applied, failed };
}

module.exports = { CURATED_MIGRATIONS, applyCuratedMigrations };
