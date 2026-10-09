-- Apex 0026_free_spin_sessions.sql
-- 用途：服务端权威 FS 状态。前端传的 isFree 一律忽略。
--
-- 规则：
--   1. 普通 spin 出现 4+ Scatter → 建 session (remaining = 10)
--   2. 之后的 spin 请求，若用户有 active session，强制 isFree=true
--   3. FS 期间再出现 4+ Scatter → remaining += 10
--   4. remaining = 0 → status = 'completed'
--   5. 超过 expires_at 未活动 → 后台清理（cron / lazy）
--
-- 约束：
--   一个用户同时最多 1 个 active session（索引 + 业务层保证）
--   bet_minor 固定：FS 中奖按 session 创建时的 bet 计算
--   安全：本迁移不 DROP / DELETE / 重建已有表。

CREATE TABLE IF NOT EXISTS free_spin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  trigger_spin_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  bet_minor INTEGER NOT NULL,
  pay_scale REAL NOT NULL DEFAULT 1.0,
  total_spins INTEGER NOT NULL,
  remaining_spins INTEGER NOT NULL,
  total_win_minor INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fs_user_status ON free_spin_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_fs_status_expires ON free_spin_sessions(status, expires_at);
