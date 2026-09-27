-- Migration 0023: 修正 rate_limit_buckets 表结构
-- 背景：
--   Apex 早期版本创建的 rate_limit_buckets 表只有 2 列主键
--   (bucket_key, window_start)，且缺少 expires_at 列。
--   但 functions/_rateLimit.js 期望的表结构是 3 列主键
--   (bucket_key, action, window_start) + expires_at 字段。
--   表结构不匹配会导致限流 SQL 抛错，进而被 catch 成 allowed:false，
--   表现为"全站 429"，因此必须修正。
--
-- 策略：
--   DROP + CREATE。此表仅存储限流计数器，DROP 无业务损失。
--   幂等：先 DROP IF EXISTS，再 CREATE。

DROP TABLE IF EXISTS rate_limit_buckets;

CREATE TABLE rate_limit_buckets (
  bucket_key   TEXT    NOT NULL,
  action       TEXT    NOT NULL,
  window_start INTEGER NOT NULL,
  count        INTEGER NOT NULL DEFAULT 0,
  expires_at   TEXT    NOT NULL,
  PRIMARY KEY (bucket_key, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_expires_at
  ON rate_limit_buckets(expires_at);
