-- Apex 0028_wallet_ledger.sql
-- 钱包账本：所有余额变更的权威记录。
-- delta 是权威字段（本笔净变化，分）。
-- event_id UNIQUE，spin_id 不 UNIQUE（一 spin 多事件）。
-- 首次启用时为每个现有账户创建一条 opening 事件（见 0028 尾部）。

CREATE TABLE IF NOT EXISTS wallet_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  spin_id TEXT,
  delta INTEGER NOT NULL,
  change_type TEXT NOT NULL,
  ref_type TEXT,
  ref_id TEXT,
  math_version TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ledger_user ON wallet_ledger(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_spin ON wallet_ledger(spin_id);

-- 首次启用：为每个现有账户创建 opening 事件
-- event_id 用 'opening-' + user_id 保证幂等
INSERT OR IGNORE INTO wallet_ledger (event_id, user_id, spin_id, delta, change_type, math_version)
SELECT 'opening-' || id, id, NULL, wallet_balance, 'opening', '1.0.0'
FROM users
WHERE wallet_balance IS NOT NULL AND wallet_balance != 0;
