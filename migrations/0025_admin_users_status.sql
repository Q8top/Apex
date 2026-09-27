-- 0025_admin_users_status.sql
-- 修复 admin_users 表缺少 status 列
-- 与 admin/login.js 中 `admin.status !== 'active'` 的判断保持一致

ALTER TABLE admin_users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
