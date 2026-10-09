-- Apex 0030_spins_ext.sql
-- spins 扩展：幂等指纹 + 结算上下文。
-- 重复执行报 duplicate column name，由 _sql_apply / _migrations 识别跳过。

ALTER TABLE spins ADD COLUMN request_fingerprint TEXT;
ALTER TABLE spins ADD COLUMN effective_bet_minor INTEGER;
ALTER TABLE spins ADD COLUMN fs_session_id INTEGER;
ALTER TABLE spins ADD COLUMN chain_id TEXT;
ALTER TABLE spins ADD COLUMN balance_delta INTEGER;

CREATE INDEX IF NOT EXISTS idx_spins_fingerprint ON spins(user_id, request_fingerprint);
