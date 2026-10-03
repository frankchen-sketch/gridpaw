-- migrations/002_multi_auth.sql  多供应商登录 + 邮箱密码身份（2026-10-04）
-- 背景：users 表原按 google_sub 单供应商寻址；本次扩展 (provider, provider_user_id)
-- 复合寻址，支持 google/microsoft/facebook OAuth 与邮箱密码（provider='email'）。
--
-- 注意（重要）：
-- 1) SQLite 的 ALTER TABLE ADD COLUMN 没有 IF NOT EXISTS —— 本文件只加新列，
--    不要对已含本文件列的库重复执行。老列（picture/created_at/first_utm_* 等）
--    来自 meowtrail 原始 schema，生产已存在，本文件不碰。
-- 2) D1 免费额度（5M rows_read/日）在 UTC 午夜重置；今天额度已超限，--remote 会
--    报 7500。remote 执行放到 UTC 午夜后补跑：
--      npx -y wrangler d1 execute meowtrail-users --remote --file migrations/002_multi_auth.sql
--    本地立即执行：
--      npx -y wrangler d1 execute meowtrail-users --local --file migrations/002_multi_auth.sql
-- 3) 部署顺序：先 migration 后部署新代码（callback/register 的 INSERT 引用新列，
--    列不存在会导致登录 500，见 git 待办）。

-- 1) users 表新增身份列（google 老行由 2) 回填）
ALTER TABLE users ADD COLUMN provider TEXT;
ALTER TABLE users ADD COLUMN provider_user_id TEXT;
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- 2) google 老行回填：provider='google'，provider_user_id=google_sub
UPDATE users SET provider = 'google', provider_user_id = google_sub WHERE google_sub IS NOT NULL;

-- 3) 复合寻址索引：(provider, provider_user_id) 是登录查询的寻址键
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_user_id);

-- 4) 邮箱密码登录防爆破：同邮箱失败计数（5 次 / 10 分钟窗口），
--    登录成功或窗口过期后重置 / 从 1 重新计。
CREATE TABLE IF NOT EXISTS auth_login_attempts (
  email TEXT PRIMARY KEY NOT NULL,
  fail_count INTEGER NOT NULL DEFAULT 0,
  last_fail_at INTEGER NOT NULL
);
