import { Env, json, getCookie, verifySessionValue } from './_lib';

function clampLevel(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 1;
  return Math.min(9999, Math.max(1, Math.round(n)));
}

// GET: 云端关卡进度
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ error: 'unauthorized' }, 401);
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  const row = await env.meowtrail_users
    .prepare('SELECT level FROM level_progress WHERE user_id = ?')
    .bind(uid)
    .first<{ level: number }>();

  return json({ level: row ? row.level : null });
};

// POST: 上传本地关卡（服务端取 max）
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ error: 'unauthorized' }, 401);
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  let body: { level?: unknown };
  try {
    const text = await request.text();
    if (text.length > 256) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const level = clampLevel(body.level);

  await env.meowtrail_users
    .prepare(
      `INSERT INTO level_progress (user_id, level, updated_at) VALUES (?, ?, ?)
       ON CONFLICT (user_id) DO UPDATE SET level = MAX(level, excluded.level), updated_at = excluded.updated_at`
    )
    .bind(uid, level, Date.now())
    .run();

  const row = await env.meowtrail_users
    .prepare('SELECT level FROM level_progress WHERE user_id = ?')
    .bind(uid)
    .first<{ level: number }>();

  return json({ level: row ? row.level : level });
};
