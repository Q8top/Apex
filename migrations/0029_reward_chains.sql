-- Apex 0029_reward_chains.sql
-- 奖励链（每次触发 FS 的独立累计上限）。
-- base_spin_id UNIQUE 保证：一次基础 spin 最多创建一个链。
-- max_win_multiplier 冻结自 math_profile，随 math_version 追踪。

CREATE TABLE IF NOT EXISTS reward_chains (
  chain_id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  base_spin_id TEXT NOT NULL UNIQUE,
  effective_bet_minor INTEGER NOT NULL,
  max_win_multiplier INTEGER NOT NULL,
  chain_win_minor INTEGER NOT NULL DEFAULT 0,
  cap_reached INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  math_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (base_spin_id) REFERENCES spins(spin_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_chain_user ON reward_chains(user_id, status);
CREATE INDEX IF NOT EXISTS idx_chain_base ON reward_chains(base_spin_id);
