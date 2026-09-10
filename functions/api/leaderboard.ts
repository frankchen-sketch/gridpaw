import { Env, json, getCookie, verifySessionValue } from './_lib';

// POST: 记录当日成绩（登录用户胜利时调用）
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ error: 'unauthorized' }, 401);
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  let body: { date?: unknown; timeMs?: unknown };
  try {
    const text = await request.text();
    if (text.length > 512) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const date = typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : new Date().toISOString().slice(0, 10);
  const timeMs = Number(body.timeMs);
  if (!Number.isFinite(timeMs) || timeMs < 0 || timeMs > 86_400_000) return json({ error: 'bad_time' }, 400);

  // 同一天多次完成：保留最好成绩
  await env.meowtrail_users
    .prepare(
      `INSERT INTO daily_results (user_id, puzzle_date, time_ms, solved_at) VALUES (?, ?, ?, ?)
       ON CONFLICT (user_id, puzzle_date) DO UPDATE SET time_ms = MIN(time_ms, excluded.time_ms), solved_at = excluded.solved_at`
    )
    .bind(uid, date, Math.round(timeMs), Date.now())
    .run();

  return json({ ok: true });
};

// GET /api/leaderboard?date=YYYY-MM-DD — 当日每日挑战排行榜（top 20）
// 只暴露 name + time，不暴露 email
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'bad_date' }, 400);

  const { results } = await env.meowtrail_users
    .prepare(
      `SELECT u.name, r.time_ms, r.solved_at
       FROM daily_results r JOIN users u ON u.id = r.user_id
       WHERE r.puzzle_date = ?
       ORDER BY r.time_ms ASC LIMIT 20`
    )
    .bind(date)
    .all<{ name: string | null; time_ms: number; solved_at: number }>();

  return json({
    date,
    entries: (results ?? []).map((r, i) => ({
      rank: i + 1,
      name: r.name || 'Anonymous Cat',
      timeMs: r.time_ms,
    })),
  });
};
