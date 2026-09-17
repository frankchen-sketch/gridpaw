-- migrations/0001_gp_funnel.sql  幂等：可重复执行
-- 复用 meowtrail-users 库（binding meowtrail_users），表名一律 gp_ 前缀，别碰 meowtrail 的表
CREATE TABLE IF NOT EXISTS gp_event (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT,                 -- 登录用户（mt_session 解出的 uid）；访客为空串
  guest_id TEXT NOT NULL,       -- gp_gid cookie 值
  event_name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  build_id TEXT,                -- 客户端上报的版本 key（''/NULL = 版本化之前的历史数据）
  metadata TEXT,                -- JSON 字符串（含 attribution / referrerHost / ua / isLikelyBot）
  created_at INTEGER NOT NULL   -- ms epoch，便于窗口函数按时间排序
);
CREATE INDEX IF NOT EXISTS idx_gp_event_build    ON gp_event (build_id, created_at);
CREATE INDEX IF NOT EXISTS idx_gp_event_name     ON gp_event (event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_gp_event_visitor  ON gp_event (guest_id, created_at);
CREATE INDEX IF NOT EXISTS idx_gp_event_user     ON gp_event (user_id, created_at);

-- 版本注册表：一行一版本，INSERT OR IGNORE 保证并发安全
CREATE TABLE IF NOT EXISTS gp_build (
  build_id TEXT PRIMARY KEY NOT NULL,
  commit_message TEXT,
  committed_at TEXT,
  first_seen_at TEXT NOT NULL   -- 首次服务到 visit 的时间（只在首次注册时写入）
);
