-- Apex 0033_users_balance_nonnegative_triggers.sql
-- 非负余额保护 trigger（施工单 §A-3.3）
--
-- 目的：在数据库层阻止任何 UPDATE/INSERT 将 wallet_balance 置为负数。
-- 应用层仍应做检查（余额不足应返回 400 而非 500），但 DB 层是最后防线。
--
-- 为什么需要：
--   spin.js 的扣款 UPDATE 已带 WHERE wallet_balance >= bet，
--   但若应用层代码回归或被绕过，trigger 能兜底。
--
-- 幂等：CREATE TRIGGER IF NOT EXISTS。

CREATE TRIGGER IF NOT EXISTS trg_users_balance_nonnegative_update
BEFORE UPDATE OF wallet_balance ON users
FOR EACH ROW
WHEN NEW.wallet_balance < 0
BEGIN
  SELECT RAISE(ABORT, 'insufficient_balance');
END;

CREATE TRIGGER IF NOT EXISTS trg_users_balance_nonnegative_insert
BEFORE INSERT ON users
FOR EACH ROW
WHEN NEW.wallet_balance < 0
BEGIN
  SELECT RAISE(ABORT, 'invalid_initial_balance');
END;
