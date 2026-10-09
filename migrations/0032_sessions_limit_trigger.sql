-- Apex 0032_sessions_limit_trigger.sql
-- Session 配额：单用户最多 20 个活跃 session。
-- 用 BEFORE INSERT trigger 检测，超限 ABORT。
-- 若 D1 不支持 subquery，改用计数表方案。

CREATE TRIGGER IF NOT EXISTS trg_sessions_limit
BEFORE INSERT ON sessions
FOR EACH ROW
WHEN (
  SELECT COUNT(*) FROM sessions
  WHERE user_id = NEW.user_id
    AND revoked_at IS NULL
    AND expires_at > CURRENT_TIMESTAMP
) >= 20
BEGIN
  SELECT RAISE(ABORT, 'session_limit_exceeded');
END;
