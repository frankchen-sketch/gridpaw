import { Env, json, getCookie, verifySessionValue } from './_lib';
import { GUEST_PREFIX, isValidAnonId, isGuestUid, displayNameFor } from './_guest';

const GAMES = new Set([
  'shikaku', 'akari', 'kenken', 'binary', 'hashi', 'slitherlink', 'star-battle', 'kakuro', 'nonogram', 'nurikabe',
  // 2026-10-20 P2：补齐 GameSwitcher 全量 13 款。pictomino 此前不在白名单 → POST 落到旧 daily_results、
  // GET ?game=pictomino 退化成全站混合榜；本次起三处上报统一写 game_results（旧表历史数据不混入新榜）。
  'pictomino', 'murdoku', 'meowdoku',
]);

// 每游戏成绩下限（ms）：低于它必须有 24h 内 daily_start 佐证才入库（2026-10-26 加）。
// 背景：常规关随机盘的关卡快通曾污染 daily 榜（客户端 bug + 幽灵提交 4.0s/1.0s 上了当日最快）。
// 10×10 akari 真人不可能 <8s；5×5 shikaku daily 最快 ~5s 留余量；pictomino daily 盘 ≥8s。
const DAILY_FLOORS: Record<string, number> = { shikaku: 5000, akari: 8000, pictomino: 8000 };

// 双轨兼容：
//  - 带 game     → 新 game_results，分游戏当日榜（登录用户 + 游客 anonId 都可写，2026-10-22）
//  - 无 game     → 旧 daily_results（仅登录用户，首页 shikaku / akari daily 现行为，勿破坏）
// 游客身份：无 mt_session cookie 时，body.anonId 校验通过即以 'guest:<anonId>' 落库；
// ON CONFLICT (user_id, game, puzzle_date) 天然限频（每游客每游戏每天最多一行最优成绩）。
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { game?: unknown; date?: unknown; timeMs?: unknown; anonId?: unknown };
  try {
    const text = await request.text();
    if (text.length > 512) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const val = getCookie(request, 'mt_session');
  let uid: string | null = null;
  if (val) uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);

  const date = typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : new Date().toISOString().slice(0, 10);
  const timeMs = Number(body.timeMs);
  if (!Number.isFinite(timeMs) || timeMs < 0 || timeMs > 86_400_000) return json({ error: 'bad_time' }, 400);

  const game = typeof body.game === 'string' && GAMES.has(body.game) ? body.game : null;
  if (!game) {
    // 旧表（无 game 字段）维持登录闸——游客只进新榜
    if (!uid) return json({ error: 'unauthorized' }, 401);
    await env.meowtrail_users
      .prepare(
        `INSERT INTO daily_results (user_id, puzzle_date, time_ms, solved_at) VALUES (?, ?, ?, ?)
         ON CONFLICT (user_id, puzzle_date) DO UPDATE SET time_ms = MIN(time_ms, excluded.time_ms), solved_at = excluded.solved_at`
      )
      .bind(uid, date, Math.round(timeMs), Date.now())
      .run();
    return json({ ok: true });
  }

  // 新表：登录优先；无会话 → 游客 anonId（成绩下限见下方 DAILY_FLOORS 防线）
  if (!uid) {
    if (!isValidAnonId(body.anonId)) return json({ error: 'unauthorized' }, 401);
    uid = GUEST_PREFIX + body.anonId;
  }
  const isGuest = isGuestUid(uid);

  // 下限防线：低于真人不可能的每游戏下限 → 必须有 24h 内 daily_start 佐证（daily 页正常流零误伤）。
  // 常规关快通 / 幽灵提交 / 脚本刷 0.1-4s 全挡。佐证查询对登录用户查 user_id，对游客查 guest_id。
  const floor = DAILY_FLOORS[game] ?? 5000;
  if (timeMs < floor) {
    const gid = isGuest ? uid.slice(GUEST_PREFIX.length) : uid;
    const evidence = await env.meowtrail_users
      .prepare(
        `SELECT 1 FROM gp_event WHERE event_name = 'daily_start' AND created_at >= ?1 AND (guest_id = ?2 OR user_id = ?2) LIMIT 1`
      )
      .bind(Date.now() - 86_400_000, gid)
      .first();
    if (!evidence) return json({ error: 'bad_time' }, 400);
  }

  // 新表：按 (user, game, date) 唯一，多次完成保留最好
  await env.meowtrail_users
    .prepare(
      `INSERT INTO game_results (user_id, game, puzzle_date, time_ms, solved_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (user_id, game, puzzle_date) DO UPDATE SET time_ms = MIN(time_ms, excluded.time_ms), solved_at = excluded.solved_at`
    )
    .bind(uid, game, date, Math.round(timeMs), Date.now())
    .run();

  return json({
    ok: true,
    ...(isGuest ? { guest: true, name: displayNameFor(uid, null).name } : {}),
  });
};

// 展示名口径：用户自定义昵称优先，未设置回退 OAuth/注册名（migrations/005 加列）
const DISPLAY_NAME = 'COALESCE(u.display_name, u.name)';

// 连胜榜分批读取（D1 单次结果集别太大）：每批 1000 行，硬上限 5 万行
const STREAK_BATCH = 1000;
const STREAK_MAX_ROWS = 50_000;

interface StreakRow {
  uid: string;
  d: string;
  name: string | null;
}

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000;
}

// GET /api/leaderboard?game=shikaku&date=YYYY-MM-DD        — 当日榜（top 20）
// GET /api/leaderboard?game=shikaku&type=streak            — 全时最长连胜榜（top 20）
// 带 game → 新 game_results；无 game → 旧 daily_results（首页等现有面板，行为不变）
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'bad_date' }, 400);
  const gameParam = url.searchParams.get('game');
  const game = gameParam && GAMES.has(gameParam) ? gameParam : null;
  const type = url.searchParams.get('type');

  // ── 全时最长连胜（P2）：只读该 game 的新表，旧 daily_results 不混入（口径不同、避免跨表拼接）
  if (type === 'streak') {
    if (!game) return json({ error: 'bad_game' }, 400);

    // (user, date) 去重升序累加：SQL 已按 user_id, puzzle_date 升序 → JS 逐条算最长连续段
    // 游客行 user_id='guest:<anonId>' → LEFT JOIN 无匹配 → name=null，用确定性猫名（displayNameFor）
    const buckets = new Map<string, { name: string | null; days: string[]; guest: boolean }>();
    let offset = 0;
    let fetched = 0;
    for (;;) {
      const { results } = await env.meowtrail_users
        .prepare(
          `SELECT r.user_id AS uid, r.puzzle_date AS d, ${DISPLAY_NAME} AS name
           FROM game_results r LEFT JOIN users u ON u.id = r.user_id
           WHERE r.game = ?1
           ORDER BY r.user_id ASC, r.puzzle_date ASC
           LIMIT ?2 OFFSET ?3`
        )
        .bind(game, STREAK_BATCH, offset)
        .all();
      const rows = (results ?? []) as StreakRow[];
      if (!rows.length) break;
      fetched += rows.length;
      for (const r of rows) {
        let bucket = buckets.get(r.uid);
        if (!bucket) {
          bucket = { name: r.name, days: [], guest: isGuestUid(r.uid) };
          buckets.set(r.uid, bucket);
        }
        if (!bucket.name && r.name) bucket.name = r.name;
        const last = bucket.days[bucket.days.length - 1];
        if (last !== r.d) bucket.days.push(r.d); // 同日多行只算一天
      }
      if (rows.length < STREAK_BATCH || fetched >= STREAK_MAX_ROWS) break;
      offset += STREAK_BATCH;
    }

    const scored: { name: string; streak: number; guest: boolean }[] = [];
    for (const [uid, bucket] of buckets.entries()) {
      let best = 0;
      let run = 0;
      let prev = '';
      for (const d of bucket.days) {
        run = prev && dayDiff(prev, d) === 1 ? run + 1 : 1;
        if (run > best) best = run;
        prev = d;
      }
      if (best > 0) {
        const dn = displayNameFor(uid, bucket.name);
        scored.push({ name: dn.name, streak: best, guest: dn.guest });
      }
    }
    scored.sort((a, b) => b.streak - a.streak || a.name.localeCompare(b.name));

    return json({
      game,
      type: 'streak',
      entries: scored.slice(0, 20).map((e, i) => ({ rank: i + 1, name: e.name, streak: e.streak, guest: e.guest || undefined })),
    });
  }

  let sql: string;
  let bind: string[];
  if (game) {
    // LEFT JOIN：游客行 users 无匹配 → name=null，displayNameFor 兜猫名（2026-10-22）
    sql = `SELECT r.user_id AS uid, ${DISPLAY_NAME} AS name, r.time_ms, r.solved_at
       FROM game_results r LEFT JOIN users u ON u.id = r.user_id
       WHERE r.game = ?1 AND r.puzzle_date = ?2
       ORDER BY r.time_ms ASC LIMIT 20`;
    bind = [game, date];
  } else {
    sql = `SELECT ${DISPLAY_NAME} AS name, r.time_ms, r.solved_at
       FROM daily_results r JOIN users u ON u.id = r.user_id
       WHERE r.puzzle_date = ?1
       ORDER BY r.time_ms ASC LIMIT 20`;
    bind = [date];
  }

  const { results } = await env.meowtrail_users
    .prepare(sql)
    .bind(...bind)
    .all();
  const raw = (results ?? []) as { uid?: string; name: string | null; time_ms: number; solved_at: number }[];

  const entries = raw.map((r, i) => {
    // 旧表路径无 uid 列 → 登录行为不变；新表路径游客映射猫名 + guest 标记
    if (r.uid == null) return { rank: i + 1, name: r.name || 'Anonymous Cat', timeMs: r.time_ms };
    const dn = displayNameFor(r.uid, r.name);
    return { rank: i + 1, name: dn.name, timeMs: r.time_ms, guest: dn.guest || undefined };
  });

  return json({
    game: game || null,
    date,
    entries,
  });
};
