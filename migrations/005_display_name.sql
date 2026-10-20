-- migrations/005_display_name.sql  P2 排行榜昵称 + 徽章稀有度缓存（2026-10-20）
--
-- ⚠️ SQLite 的 ALTER TABLE ADD COLUMN 没有 IF NOT EXISTS —— 本文件对同一库只能执行一次。
-- 执行：
--   npx -y wrangler d1 execute meowtrail-users --remote --file migrations/005_display_name.sql
-- 顺序：先 migration 后部署新代码（profile.ts 的 UPDATE 引用 display_name，列不存在会 500）。

-- 1) 用户自定义昵称：榜单展示优先取它，为空回退 users.name。
--    NULL = 未设置；服务端校验 2-20 码点 + 字母/数字/空格/_ . - 与 CJK。
ALTER TABLE users ADD COLUMN display_name TEXT;

-- 2) 徽章稀有度缓存：/api/badges?stats=1 全量派生一次后落库，24h 内直接读。
--    缓存伪行规则：badge_id = '__total__' 时 holders 存的是总访客键数 totalKeys
--    （11 枚真实徽章 id 都不含前导下划线，不会撞车）。
CREATE TABLE IF NOT EXISTS badge_stats (
  badge_id TEXT PRIMARY KEY,     -- 徽章 id（含 11 枚目录 id + '__total__' 汇总行）
  holders INTEGER NOT NULL,      -- '__total__' 行为 totalKeys，其余为持有该徽章的人数
  updated_at INTEGER NOT NULL    -- ms epoch（整批同一时间戳，用于 24h 新鲜度判定）
);
