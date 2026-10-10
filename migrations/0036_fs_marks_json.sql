-- 0036: sugar-rush marks persistence (P0-7 A2d).
-- marks_json: MarkState snapshot [[pos,val],...] carried across FS spins.
-- engine_version: SR engine version, for future format migrations.
ALTER TABLE free_spin_sessions ADD COLUMN marks_json TEXT;
ALTER TABLE free_spin_sessions ADD COLUMN engine_version TEXT;
