-- Apex 0034_spins_max_win.sql
-- P0-2: base spin max-win 硬截断审计列。
-- 记录每次 spin 的 max_win 上限和是否触发截断。
-- 重复执行报 duplicate column name，由 _migrations 识别跳过。

ALTER TABLE spins ADD COLUMN max_win_applied INTEGER;
ALTER TABLE spins ADD COLUMN capped_this_spin INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_spins_capped ON spins(capped_this_spin) WHERE capped_this_spin = 1;
