import { Env, json, normalizeEmail, EMAIL_PROVIDER } from '../_lib';

// POST /api/auth/forgot-password — 请求邮箱密码重置邮件（Resend）
// body JSON: { email }
// 无论邮箱是否存在都返回 { ok: true }（防枚举）。存在邮箱用户（provider='email'
// 且 password_hash 非空）才落 token + 发信；其余静默成功。
// 频控：同邮箱 1 小时内有效 token >= 3 个 → 429（防刷信）。
// RESEND_API_KEY 未配置 → 503 { error: 'email_not_configured' }。

const RESET_TTL_MS = 60 * 60 * 1000; // token 有效期 1 小时（与 reset-password 校验一致）
const RESEND_URL = 'https://api.resend.com/emails';
const RESET_PAGE = 'https://gridpaw.com/reset-password';
const RATE_LIMIT = 3; // 同邮箱 1 小时最多 3 封

function randomTokenHex(bytes: number): string {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  let s = '';
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0');
  return s;
}

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
  if (!email || email.length > 254) return json({ error: 'invalid_email' }, 400);

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return json({ error: 'email_not_configured' }, 503);
  }

  const db = env.meowtrail_users;
  const now = Date.now();

  // 顺带清掉过期 token，避免表无限膨胀（expires_at 由服务端写入，只有 now+1h 一种形态）
  await db.prepare('DELETE FROM password_resets WHERE expires_at <= ?').bind(now).run();

  // 频控：同邮箱 1 小时内有效 token 数（expires_at > now 即 1 小时内签发）
  const cnt = await db
    .prepare('SELECT COUNT(*) AS n FROM password_resets WHERE email = ? AND expires_at > ?')
    .bind(email, now)
    .first<{ n: number }>();
  if (cnt && cnt.n >= RATE_LIMIT) return json({ error: 'too_many_requests' }, 429);

  // 只有邮箱密码账号（非 OAuth-only）且设了密码才真发信
  const user = await db
    .prepare('SELECT id FROM users WHERE lower(email) = ? AND provider = ? AND password_hash IS NOT NULL')
    .bind(email, EMAIL_PROVIDER)
    .first<{ id: string }>();

  if (!user) return json({ ok: true }); // 防枚举：不存在的邮箱同样返回 ok

  const token = randomTokenHex(32); // 32 字节 = 64 hex，密码学随机，不可预测
  const expiresAt = now + RESET_TTL_MS;
  await db
    .prepare('INSERT INTO password_resets (token, email, expires_at) VALUES (?, ?, ?)')
    .bind(token, email, expiresAt)
    .run();

  // Resend REST 发信（10s 超时）；发信失败返回 502 send_failed（token 保留，
  // 便于重试/排障，且重置链接仍有效）
  const resetLink = `${RESET_PAGE}?token=${token}`;
  const textBody = [
    'Hi there! 🐾',
    '',
    'We got a request to reset your GridPaw password. Tap the link below to pick a new one:',
    '',
    resetLink,
    '',
    'This link works for 1 hour. If you did not ask to reset your password, just ignore this email — your password stays exactly the same.',
    '',
    'Happy puzzling!',
    '— The GridPaw team',
  ].join('\n');
  const htmlBody = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#FFF9F0;border-radius:16px;border:1px solid #F4DFDC;">
      <p style="font-size:22px;font-weight:800;color:#342421;margin:0 0 12px;">🐾 Reset your GridPaw password</p>
      <p style="font-size:15px;color:#6F5651;line-height:1.6;margin:0 0 18px;">Hi there! We got a request to reset your GridPaw password. Tap the button below to choose a new one:</p>
      <p style="text-align:center;margin:0 0 18px;">
        <a href="${resetLink}" style="display:inline-block;background:#E8A888;color:#fff;font-size:15px;font-weight:800;padding:12px 28px;border-radius:12px;text-decoration:none;">Choose a new password</a>
      </p>
      <p style="font-size:13px;color:#9B726C;line-height:1.6;margin:0;">This link works for 1 hour. If you did not ask to reset your password, just ignore this email — your password stays exactly the same.</p>
    </div>`;

  let resendRes: Response;
  try {
    resendRes = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [email],
        subject: 'Reset your GridPaw password',
        text: textBody,
        html: htmlBody,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return json({ error: 'send_failed' }, 502);
  }
  if (!resendRes.ok) return json({ error: 'send_failed' }, 502);

  return json({ ok: true });
};
