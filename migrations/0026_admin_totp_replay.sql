-- P11-J: TOTP 重放保护
-- 记录每个管理员最后一次成功验证的 TOTP 时间步（counter = floor(unix_ms / 30000)）
-- 验证时要求本次 counter 严格大于已记录值，否则拒绝（RFC 6238 §5.2）
ALTER TABLE admin_users ADD COLUMN last_totp_counter INTEGER NOT NULL DEFAULT 0;
