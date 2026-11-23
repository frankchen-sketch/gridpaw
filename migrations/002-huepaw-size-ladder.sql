-- 分难度（尺寸）阶梯榜（2026-11-23）
-- 背景：现有 game_results PK=(user_id, game, puzzle_date) 只有"按天"一个维度，
-- 每日尺寸随星期轮换（3/4/5），所以"6×6 人类最快"这类常青榜无处可存。
-- 本表按 (user_id, game, size) 存 best-ever，永不过期；每日榜 game_results 不动。
-- 执行：npx -y wrangler d1 execute meowtrail-users --remote --file migrations/002-huepaw-size-ladder.sql
CREATE TABLE IF NOT EXISTS game_results_size (
  user_id   TEXT    NOT NULL,
  game      TEXT    NOT NULL,
  size      INTEGER NOT NULL,
  time_ms   INTEGER NOT NULL,
  solved_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, game, size)
);
CREATE INDEX IF NOT EXISTS idx_game_size ON game_results_size(game, size, time_ms);
