import { Env, getCookie, verifySessionValue, json } from './_lib';

interface ProgressRow {
  user_id: string;
  streak: number;
  best_streak: number;
  best_time_ms: number | null;
  last_solved_date: string | null;
}

interface LocalProgress {
  date?: string;
  streak?: number;
  bestStreak?: number;
  bestTime?: number | null;
  solved?: boolean;
}

function clampInt(v: unknown, min: number, max: number, fallback = 0): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function validDate(v: unknown): string | null {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  // 真实日历校验（防 2026-02-31）+ 拒未来日期（防恶意 last_solved_date 永久压制合并）
  const d = new Date(v + 'T00:00:00Z');
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (v > today) return null;
  return v;
}

// GET: 云端进度
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ error: 'unauthorized' }, 401);
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  const row = await env.meowtrail_users
    .prepare('SELECT user_id, streak, best_streak, best_time_ms, last_solved_date FROM daily_progress WHERE user_id = ?')
    .bind(uid)
    .first<ProgressRow>();

  return json({
    progress: row
      ? {
          streak: row.streak,
          bestStreak: row.best_streak,
          bestTime: row.best_time_ms,
          lastSolvedDate: row.last_solved_date,
        }
      : null,
  });
};

// POST: 上传本地进度（服务端做合并，用户无感知）
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ error: 'unauthorized' }, 401);
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  let body: LocalProgress;
  try {
    const text = await request.text();
    if (text.length > 2048) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const localStreak = clampInt(body.streak, 0, 3650);
  const localBest = clampInt(body.bestStreak, 0, 3650);
  const localBestTime = body.bestTime == null ? null : clampInt(body.bestTime, 0, 86_400_000);
  // 防循环污染：超过 2h 的 bestTime 视为脏数据拒收（正常 daily 解题 <2h）
  const localBestTimeClean = (localBestTime != null && localBestTime > 7_200_000) ? null : localBestTime;
  const localDate = validDate(body.date);

  const db = env.meowtrail_users;
  const row = await db
    .prepare('SELECT streak, best_streak, best_time_ms, last_solved_date FROM daily_progress WHERE user_id = ?')
    .bind(uid)
    .first<ProgressRow>();

  if (!row) {
    // 首次登录：云端直接采纳本地（保证 best_streak >= streak 不变量）
    const best = Math.max(localBest, localStreak);
    await db
      .prepare('INSERT INTO daily_progress (user_id, streak, best_streak, best_time_ms, last_solved_date, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(uid, localStreak, best, localBestTimeClean, localDate, Date.now())
      .run();
  } else {
    // 合并：best 取 max；streak 取 last_solved_date 较新的一方；best_time 取 min
    const cloudNewer = !localDate || (row.last_solved_date ?? '') >= localDate;
    const streak = cloudNewer ? row.streak : localStreak;
    const best = Math.max(row.best_streak, localBest, streak); // best 永远 >= streak
    const bestTime =
      row.best_time_ms == null ? localBestTimeClean : localBestTimeClean == null ? row.best_time_ms : Math.min(row.best_time_ms, localBestTimeClean);
    const lastDate = cloudNewer ? row.last_solved_date : localDate;
    await db
      .prepare('UPDATE daily_progress SET streak = ?, best_streak = ?, best_time_ms = ?, last_solved_date = ?, updated_at = ? WHERE user_id = ?')
      .bind(streak, best, bestTime, lastDate, Date.now(), uid)
      .run();
  }

  const fresh = await db
    .prepare('SELECT streak, best_streak, best_time_ms, last_solved_date FROM daily_progress WHERE user_id = ?')
    .bind(uid)
    .first<ProgressRow>();

  return json({
    progress: fresh
      ? {
          streak: fresh.streak,
          bestStreak: fresh.best_streak,
          bestTime: fresh.best_time_ms,
          lastSolvedDate: fresh.last_solved_date,
        }
      : null,
  });
};
