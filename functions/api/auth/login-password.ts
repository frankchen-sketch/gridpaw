import {
  Env,
  getCookie,
  makeSessionValue,
  sessionCookie,
  json,
  verifyPassword,
  normalizeEmail,
  EMAIL_PROVIDER,
} from '../_lib';

// POST /api/auth/login-password — 邮箱密码登录
// body JSON: { email, password }
// 成功：发会话 cookie，返回 { ok: true }（前端 location.reload 刷新登录态）
// 基础防爆破：auth_login_attempts 小表，同邮箱连续失败 5 次后锁 10 分钟。

const ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 10 分钟
const ATTEMPT_LIMIT = 5;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 4096) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const email = normalizeEmail(typeof body.email === 'string' ? body.email : '');
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || email.length > 254 || !password) return json({ error: 'invalid_credentials' }, 401);

  const db = env.meowtrail_users;
  const now = Date.now();

  // 1) 防爆破检查（窗口内连续失败 >=5 次 → 429）
  const attempt = await db
    .prepare('SELECT fail_count, last_fail_at FROM auth_login_attempts WHERE email = ?')
    .bind(email)
    .first<{ fail_count: number; last_fail_at: number }>();
  if (attempt && attempt.fail_count >= ATTEMPT_LIMIT && now - attempt.last_fail_at < ATTEMPT_WINDOW_MS) {
    return json({ error: 'too_many_attempts' }, 429);
  }

  // 2) 查邮箱用户（provider='email'，google_sub 为 NULL 不参与寻址）
  const user = await db
    .prepare('SELECT id, password_hash FROM users WHERE lower(email) = ? AND provider = ?')
    .bind(email, EMAIL_PROVIDER)
    .first<{ id: string; password_hash: string | null }>();

  // 3) 校验 PBKDF2；失败记一次（邮箱不存在也记，防枚举节奏差异）
  if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
    const fresh = attempt && now - attempt.last_fail_at < ATTEMPT_WINDOW_MS ? attempt.fail_count + 1 : 1;
    await db
      .prepare(
        'INSERT INTO auth_login_attempts (email, fail_count, last_fail_at) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET fail_count = ?, last_fail_at = ?'
      )
      .bind(email, fresh, now, fresh, now)
      .run();
    return json({ error: 'invalid_credentials' }, 401);
  }

  // 4) 成功：重置失败计数，发会话
  await db.prepare('DELETE FROM auth_login_attempts WHERE email = ?').bind(email).run();
  const sessionVal = await makeSessionValue(env.OAUTH_STATE_SECRET, user.id);
  // 与 OAuth 回调一致：guest cookie 名下历史行为归到用户（幂等）
  const gid = getCookie(request, 'gp_gid');
  if (gid) {
    await db
      .prepare(`UPDATE gp_event SET user_id = ?1 WHERE guest_id = ?2 AND (user_id IS NULL OR user_id = '')`)
      .bind(user.id, gid)
      .run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(sessionVal) });
};
