import {
  Env,
  getCookie,
  makeSessionValue,
  sessionCookie,
  json,
  hashPassword,
  normalizeEmail,
  makeEmailUserId,
  EMAIL_PROVIDER,
} from '../_lib';

// POST /api/auth/register — 邮箱密码注册（PBKDF2-SHA256 100k 迭代）
// body JSON: { email, password, name? }
// 成功：建用户 + 发会话 cookie，返回 { ok: true }（前端 location.reload 刷新登录态）
// 失败：4xx JSON，前端静默降级。不做邮件验证/密码重置（无邮件基础设施，已确认裁剪）。

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  const email = normalizeEmail(typeof body.email === 'string' ? body.email : '');
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim().slice(0, 80) : null;

  if (!EMAIL_RE.test(email) || email.length > 254) return json({ error: 'invalid_email' }, 400);
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return json({ error: 'weak_password' }, 400);
  }

  const db = env.meowtrail_users;

  // 重复邮箱：提示用原方式登录（不泄露是哪种原方式）
  const dup = await db
    .prepare('SELECT id FROM users WHERE lower(email) = ?')
    .bind(email)
    .first<{ id: string }>();
  if (dup) return json({ error: 'email_exists', message: '该邮箱已注册，请用原方式登录' }, 409);

  const uid = makeEmailUserId();
  const passwordHash = await hashPassword(password);
  // 邮箱身份视为 provider='email'，provider_user_id = 归一化邮箱（复合寻址统一）
  await db
    .prepare(
      'INSERT INTO users (id, google_sub, provider, provider_user_id, email, name, picture, password_hash, created_at) VALUES (?, NULL, ?, ?, ?, ?, NULL, ?, ?)'
    )
    .bind(uid, EMAIL_PROVIDER, email, email, name, passwordHash, Date.now())
    .run();

  const sessionVal = await makeSessionValue(env.OAUTH_STATE_SECRET, uid);
  // 与 OAuth 回调一致：guest cookie 名下历史行为归到新用户（幂等）
  const gid = getCookie(request, 'gp_gid');
  if (gid) {
    await db
      .prepare(`UPDATE gp_event SET user_id = ?1 WHERE guest_id = ?2 AND (user_id IS NULL OR user_id = '')`)
      .bind(uid, gid)
      .run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(sessionVal) });
};
