-- Migration 0024: 补齐 admin_sessions 缺失列
-- 背景：
--   functions/_admin.js 的 createAdminSession 会 INSERT 6 列：
--     (id, admin_id, created_at, expires_at, last_seen_at, ip_hash, user_agent)
--   但表实际只有 4 列 (id, admin_id, expires_at, created_at)，
--   导致 Admin 登录时 SQL 报错 → Admin 无法登录（P0 功能性 Bug）。
-- 修复：补齐 4 列 + 2 个索引。
-- 幂等：本迁移只运行一次（由 _migrations 跟踪）。
-- =============================================

ALTER TABLE admin_sessions ADD COLUMN last_seen_at TEXT;
ALTER TABLE admin_sessions ADD COLUMN revoked_at TEXT;
ALTER TABLE admin_sessions ADD COLUMN ip_hash TEXT;
ALTER TABLE admin_sessions ADD COLUMN user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_admin_sessions_revoked_at
  ON admin_sessions(revoked_at);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id
  ON admin_sessions(admin_id);
