-- Apex 0031_free_spin_sessions_ext.sql
-- free_spin_sessions 扩展：乐观并发 + 奖励链关联。

ALTER TABLE free_spin_sessions ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE free_spin_sessions ADD COLUMN retrigger_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE free_spin_sessions ADD COLUMN chain_id TEXT;
ALTER TABLE free_spin_sessions ADD COLUMN chain_win_minor INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_fs_chain ON free_spin_sessions(chain_id);
