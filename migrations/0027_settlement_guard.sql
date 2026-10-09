-- Apex 0027_settlement_guard.sql
-- 事务守卫表：每次需要"验证上一条 UPDATE 影响恰好 1 行"时使用。
-- 机制：CASE WHEN changes() = 1 THEN 1 ELSE 0 END。
-- 若 changes() != 1，写入 guard_value = 0，CHECK 失败，ABORT，整批回滚。
-- 设计详见 docs/settlement/settlement-transaction-design.md §3。

CREATE TABLE IF NOT EXISTS _settlement_guard (
  slot INTEGER PRIMARY KEY CHECK (slot = 1),
  guard_value INTEGER NOT NULL CHECK (guard_value = 1)
);

INSERT OR IGNORE INTO _settlement_guard (slot, guard_value) VALUES (1, 1);
