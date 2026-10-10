-- 0035: add game_id to free_spin_sessions for multi-game isolation.
-- Existing rows default to 'sweet' (candy), preserving behavior.
ALTER TABLE free_spin_sessions ADD COLUMN game_id TEXT NOT NULL DEFAULT 'sweet';
CREATE INDEX IF NOT EXISTS idx_fs_user_game_status
  ON free_spin_sessions(user_id, game_id, status);
