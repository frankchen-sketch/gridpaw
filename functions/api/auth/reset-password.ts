import {
  Env,
  getCookie,
  makeSessionValue,
  sessionCookie,
  json,
  hashPassword,
  normalizeEmail,
  EMAIL_PROVIDER,
} from '../_lib';

// POST /api/auth/reset-password — 用重置 token 设置新密码（消费一次性 token）
// body JSON: { token, password }
// 校验：token 存在 + 未过期 + 过期时间不可能是伪造的未来值；
// 密码强度对齐 register.ts（8-128 位）。成功后 UPDATE 密码 + DELETE token
// + 自动登录（照 login-password.ts 的 session 签发），返回 { ok: true }。

const RESET_TTL_MS = 60 * 60 * 1000; // 与 forgot-password 签发有效期一致
const CLOCK_SKEW_MS = 60 * 1000;     // 时钟偏差容忍
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 4096) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!token || token.length > 128) return json({ error: 'invalid_token' }, 400);

  const db = env.meowtrail_users;
  const now = Date.now();

  // 1) token 有效性：存在 + 未过期 + 拒绝远超签发窗口的未来日期（防作弊/脏数据）
  const row = await db
    .prepare('SELECT email, expires_at FROM password_resets WHERE token = ?')
    .bind(token)
    .first<{ email: string; expires_at: number }>();
  if (
    !row ||
    !row.email ||
    row.expires_at <= now ||
    row.expires_at > now + RESET_TTL_MS + CLOCK_SKEW_MS
  ) {
    return json({ error: 'invalid_token' }, 400);
  }

  // 2) 密码强度对齐 register.ts
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return json({ error: 'weak_password' }, 400);
  }

  const email = normalizeEmail(row.email);

  // 3) 换密：仅邮箱密码账号（provider='email' 且已有 password_hash）
  const user = await db
    .prepare('SELECT id FROM users WHERE lower(email) = ? AND provider = ? AND password_hash IS NOT NULL')
    .bind(email, EMAIL_PROVIDER)
    .first<{ id: string }>();

  // 4) 一次性消费：无论下方是否成功都先删 token，防止重放
  await db.prepare('DELETE FROM password_resets WHERE token = ?').bind(token).run();

  if (!user) return json({ error: 'invalid_token' }, 400);

  const passwordHash = await hashPassword(password);
  await db
    .prepare('UPDATE users SET password_hash = ? WHERE id = ? AND password_hash IS NOT NULL')
    .bind(passwordHash, user.id)
    .run();

  // 5) 自动登录：照 login-password.ts 签发会话 + guest 历史归并（幂等）
  const sessionVal = await makeSessionValue(env.OAUTH_STATE_SECRET, user.id);
  const gid = getCookie(request, 'gp_gid');
  if (gid) {
    await db
      .prepare(`UPDATE gp_event SET user_id = ?1 WHERE guest_id = ?2 AND (user_id IS NULL OR user_id = '')`)
      .bind(user.id, gid)
      .run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(sessionVal) });
};
