import { Env, json, getCookie, verifySessionValue } from './_lib';

const GAMES = new Set(['shikaku', 'akari', 'kenken', 'binary', 'hashi', 'slitherlink', 'star-battle', 'kakuro', 'nonogram', 'nurikabe']);

// 双轨兼容：
//  - 无 game 字段 → 旧 daily_results（首页 shikaku / akari daily / pictomino 现行为，勿破坏）
//  - 带 game     → 新 game_results，分游戏当日榜
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ error: 'unauthorized' }, 401);
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  let body: { game?: unknown; date?: unknown; timeMs?: unknown };
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

  const game = typeof body.game === 'string' && GAMES.has(body.game) ? body.game : null;
  if (game) {
    // 新表：按 (user, game, date) 唯一，多次完成保留最好
    await env.meowtrail_users
      .prepare(
        `INSERT INTO game_results (user_id, game, puzzle_date, time_ms, solved_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (user_id, game, puzzle_date) DO UPDATE SET time_ms = MIN(time_ms, excluded.time_ms), solved_at = excluded.solved_at`
      )
      .bind(uid, game, date, Math.round(timeMs), Date.now())
      .run();
  } else {
    // 旧表：按 (user, date) 唯一（历史行为）
    await env.meowtrail_users
      .prepare(
        `INSERT INTO daily_results (user_id, puzzle_date, time_ms, solved_at) VALUES (?, ?, ?, ?)
         ON CONFLICT (user_id, puzzle_date) DO UPDATE SET time_ms = MIN(time_ms, excluded.time_ms), solved_at = excluded.solved_at`
      )
      .bind(uid, date, Math.round(timeMs), Date.now())
      .run();
  }

  return json({ ok: true });
};

// GET /api/leaderboard?game=shikaku&date=YYYY-MM-DD — 当日榜（top 20）
// 带 game → 新 game_results；无 game → 旧 daily_results（首页等现有面板）
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'bad_date' }, 400);
  const gameParam = url.searchParams.get('game');
  const game = gameParam && GAMES.has(gameParam) ? gameParam : null;

  let sql: string;
  let bind: string[];
  if (game) {
    sql = `SELECT u.name, r.time_ms, r.solved_at
       FROM game_results r JOIN users u ON u.id = r.user_id
       WHERE r.game = ?1 AND r.puzzle_date = ?2
       ORDER BY r.time_ms ASC LIMIT 20`;
    bind = [game, date];
  } else {
    sql = `SELECT u.name, r.time_ms, r.solved_at
       FROM daily_results r JOIN users u ON u.id = r.user_id
       WHERE r.puzzle_date = ?2
       ORDER BY r.time_ms ASC LIMIT 20`;
    bind = [date];
  }

  const { results } = await env.meowtrail_users
    .prepare(sql)
    .bind(...bind)
    .all<{ name: string | null; time_ms: number; solved_at: number }>();

  return json({
    game: game || null,
    date,
    entries: (results ?? []).map((r, i) => ({
      rank: i + 1,
      name: r.name || 'Anonymous Cat',
      timeMs: r.time_ms,
    })),
  });
};
