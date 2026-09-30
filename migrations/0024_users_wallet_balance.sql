-- Apex 0024_users_wallet_balance.sql
-- 用途：为 users 表补全 wallet_balance 列
--
-- 背景：
--   functions/_auth.js 在 getCurrentUser() 中查询 u.wallet_balance，
--   functions/api/me.js 返回 user.walletBalance，
--   但原始 users schema 未包含该列 → 相关查询会失败。
--
-- 说明：
--   - 使用 ADD COLUMN 方式，兼容已有数据
--   - 默认值 0，NOT NULL
--   - SQLite ALTER TABLE ADD COLUMN 只能追加，不能修改已有列
--   - 重复执行会报 "duplicate column name"，
--     由 scripts/_sql_apply.cjs 识别并跳过（local 模式）
--     或由 _migrations 表记录（remote 模式，二次执行直接 skip）
--
-- 安全：
--   本迁移不执行任何 DROP / DELETE，不重建表，不修改已有列。

ALTER TABLE users
ADD COLUMN wallet_balance INTEGER NOT NULL DEFAULT 0;
