-- Apex 0037_provably_fair.sql
-- Provably Fair 支持：server_seed_hash / client_seed / nonce。
-- 重复执行报 duplicate column name 由 _migrations 识别跳过。

CREATE TABLE IF NOT EXISTS pf_nonces (
  user_id INTEGER PRIMARY KEY,
  nonce   INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE spins ADD COLUMN server_seed_hash TEXT;
ALTER TABLE spins ADD COLUMN client_seed      TEXT;
ALTER TABLE spins ADD COLUMN nonce            INTEGER;

CREATE INDEX IF NOT EXISTS idx_spins_server_seed ON spins(server_seed_hash);
