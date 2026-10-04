-- migrations/003_password_reset.sql  邮箱密码重置令牌表（2026-10-04）
-- 背景：multi-auth（002）引入邮箱密码账号后，用户忘记密码需邮件重置。
-- password_resets 存一次性随机令牌（32 字节 hex，64 字符）→ 邮箱 + 过期时间（unix 毫秒）。
--
-- 注意：
-- 1) 本文件全部 CREATE TABLE/INDEX IF NOT EXISTS，可安全重复执行。
-- 2) D1 免费额度（5M rows_read/日）UTC 午夜重置；--remote 补跑挂在 002 的 20:18
--    东八区 cron 任务里连带执行（与 002 同命令模式）：
--      npx -y wrangler d1 execute meowtrail-users --remote --file migrations/003_password_reset.sql
--    本地立即执行：
--      npx -y wrangler d1 execute meowtrail-users --local --file migrations/003_password_reset.sql

CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_presets_email ON password_resets(email, expires_at);
