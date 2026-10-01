-- leaderboard 查询索引（2026-10-02）
-- 背景：daily_results PK=(user_id, puzzle_date)、game_results PK=(user_id, game, puzzle_date)，
-- 按 puzzle_date 查当日榜走不了 PK 前缀 → 全表扫。每个访客 mount 一次榜扫一遍全表，
-- 是 D1 免费版 5M rows_read/日配额被烧穿的元凶。
-- 复合索引覆盖 WHERE + ORDER BY，查询 rows_read 从全表降到 ~20 行。
-- 在 D1 配额重置后（UTC 午夜）执行：
--   npx -y wrangler d1 execute meowtrail-users --remote --file migrations/001-leaderboard-index.sql
CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_results(puzzle_date, time_ms);
CREATE INDEX IF NOT EXISTS idx_game_date ON game_results(game, puzzle_date, time_ms);
