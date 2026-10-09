-- Apex 0025_spins.sql
-- 用途：游戏 spin 记录表（幂等 + 审计 + 对账）
--
-- 背景（real 模式服务器权威）：
--   每次 /api/game/spin 请求服务端必须原子地：
--     ① 校验 spinId 未处理过（幂等）
--     ② 扣 bet，算 win（用服务端引擎）
--     ③ 一个 db.batch 提交：更新 users.wallet_balance + 插本表
--
-- 关键约束：
--   spin_id UNIQUE  → 同一请求重复到达不会重复扣款
--   result_json     → 完整 spin 结果（回放 / 审计 / 客服复查）
--   balance_before/after → 每笔对账依据
--   game_version / math_version → 数学变更后能追溯历史
--
-- 安全：
--   本迁移不执行 DROP / DELETE，不改已有表，不重建索引。
--   重复执行报 duplicate，由 _sql_apply / _migrations 识别并跳过。

CREATE TABLE IF NOT EXISTS spins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spin_id TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  mode TEXT NOT NULL,
  is_free INTEGER NOT NULL DEFAULT 0,
  free_round_total INTEGER,
  bet_minor INTEGER NOT NULL,
  win_minor INTEGER NOT NULL,
  multiplier_sum INTEGER NOT NULL DEFAULT 0,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  game_version TEXT NOT NULL,
  math_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spins_user_created ON spins(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spins_created ON spins(created_at);
