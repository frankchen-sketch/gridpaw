import { Env, getCookie, verifySessionValue, json } from '../_lib';

// POST /api/auth/save-attr — 保存用户首次访问归因数据（仅新用户，幂等）
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ error: 'unauthorized' }, 401);
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 4096) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const db = env.meowtrail_users;

  // 检查是否已有归因数据（幂等：已有的不覆盖）
  const existing = await db
    .prepare('SELECT first_seen_at FROM users WHERE id = ?')
    .bind(uid)
    .first<{ first_seen_at: number | null }>();

  if (!existing) return json({ error: 'user_not_found' }, 404);
  if (existing.first_seen_at) return json({ ok: true, skipped: 'already_has_attribution' });

  // 取值，长度限制防滥用
  const str = (v: unknown, max = 200) =>
    typeof v === 'string' ? v.slice(0, max) : null;

  await db
    .prepare(`UPDATE users SET
      first_utm_source = ?,
      first_utm_medium = ?,
      first_utm_campaign = ?,
      first_utm_content = ?,
      first_channel = ?,
      first_referrer = ?,
      first_landing = ?,
      first_seen_at = ?
    WHERE id = ?`)
    .bind(
      str(body.utm_source),
      str(body.utm_medium),
      str(body.utm_campaign),
      str(body.utm_content),
      str(body.channel),
      str(body.referrer, 500),
      str(body.landing, 500),
      typeof body.first_seen_at === 'number' ? body.first_seen_at : Date.now(),
      uid,
    )
    .run();

  return json({ ok: true });
};
