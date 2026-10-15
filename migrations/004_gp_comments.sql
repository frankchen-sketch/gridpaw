-- migrations/004_gp_comments.sql  幂等：可重复执行
-- 侦探留言墙 v1（设计稿 gridpaw-badges-comments.html ④C/⑤）：复用 meowtrail-users 库，
-- 表名 gp_ 前缀，别碰 meowtrail 的表。
-- 状态机：pending（上线首月全部人工审核）→ approved / deleted（软删，保留审计）。
CREATE TABLE IF NOT EXISTS gp_comments (
  id TEXT PRIMARY KEY NOT NULL,
  visitor_key TEXT NOT NULL,    -- 与 /api/badges 同口径：登录 uid 或 guest_id
  game TEXT NOT NULL,           -- 'murdoku' | 'shikaku'（服务端白名单，客户端提交）
  text TEXT NOT NULL,           -- 纯文本，2-500 字符，服务端 trim；不渲染 Markdown
  status TEXT NOT NULL DEFAULT 'pending',
  ip_hash TEXT NOT NULL,        -- SHA-256(COMMENTS_SALT + ':' + ip) 前 32 hex，不存裸 IP
  created_at INTEGER NOT NULL   -- ms epoch
);
CREATE INDEX IF NOT EXISTS idx_gp_comments_game    ON gp_comments (game, status, created_at);
CREATE INDEX IF NOT EXISTS idx_gp_comments_visitor ON gp_comments (visitor_key, created_at);
CREATE INDEX IF NOT EXISTS idx_gp_comments_ip      ON gp_comments (ip_hash, created_at);
