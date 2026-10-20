// GET /api/badges —— 按访客键派生徽章列表（全部来自 gp_event 已有埋点，零新打点）
// 访客键口径：登录用户按 uid 归并 + 继承同浏览器 guest 时期事件（无迁移）；未登录按 guest_id。
// 派生规则在 _badges-derive.ts（badges 与留言墙评论徽章 chip 共用一份）。
//
// GET /api/badges?stats=1 —— 全站徽章稀有度（P2）：全表扫一次 gp_event 派生每枚徽章持有数，
// 结果落 badge_stats 缓存 24h（migrations/005）。行数几百到几千级，按 500 行分批读防大结果集。
import type { Env } from './_lib';
import { json, getCookie, verifySessionValue } from './_lib';
import { GUEST_COOKIE } from './_funnel-sql';
import { LEVEL_EVENTS, ALL_BADGE_IDS, deriveBadges, type EventRow } from './_badges-derive';

const STATS_CACHE_MS = 24 * 60 * 60 * 1000;
const STATS_BATCH = 500;
const STATS_MAX_ROWS = 200_000;
const TOTAL_KEY = '__total__'; // badge_stats 里的汇总伪行：holders = 总访客键数

interface StatsRow {
  badge_id: string;
  holders: number;
  updated_at: number;
}

interface ScanRow {
  event_name: string;
  metadata: string | null;
  created_at: number;
  user_id: string | null;
  guest_id: string | null;
}

async function readCache(env: Env): Promise<StatsRow[]> {
  const { results } = await env.meowtrail_users
    .prepare('SELECT badge_id, holders, updated_at FROM badge_stats')
    .all();
  return (results ?? []) as unknown as StatsRow[];
}

// 全表扫 + 分组派生。分组键 = user_id || guest_id（与单用户端点同口径：
// 登录后事件按 uid，未登录按 guest_id；不同浏览器的 guest 与登录账号不会混成一组）。
async function computeStats(env: Env) {
  const groups = new Map<string, EventRow[]>();
  let cursor = 0;
  let scanned = 0;
  for (;;) {
    const { results } = await env.meowtrail_users
      .prepare(
        `SELECT rowid AS rid, event_name, metadata, created_at, user_id, guest_id
         FROM gp_event
         WHERE rowid > ?1 AND event_name IN (${LEVEL_EVENTS})
         ORDER BY rowid ASC LIMIT ?2`
      )
      .bind(cursor, STATS_BATCH)
      .all();
    const rows = (results ?? []) as (ScanRow & { rid: number })[];
    if (!rows.length) break;
    scanned += rows.length;
    for (const r of rows) {
      cursor = r.rid;
      const key = r.user_id || r.guest_id || '';
      if (!key) continue;
      let list = groups.get(key);
      if (!list) {
        list = [];
        groups.set(key, list);
      }
      list.push({ event_name: r.event_name, metadata: r.metadata, created_at: r.created_at });
    }
    if (rows.length < STATS_BATCH || scanned >= STATS_MAX_ROWS) break;
  }

  const counts: Record<string, number> = {};
  for (const id of ALL_BADGE_IDS) counts[id] = 0;
  for (const list of groups.values()) {
    for (const badge of deriveBadges(list)) {
      counts[badge.id] = (counts[badge.id] ?? 0) + 1;
    }
  }
  return { totalKeys: groups.size, counts };
}

async function statsResponse(env: Env) {
  let cached: StatsRow[] = [];
  try {
    cached = await readCache(env);
  } catch {
    cached = []; // 缓存表还没建（migration 未跑）：降级为现算，不 500
  }
  const now = Date.now();
  const totalRow = cached.find((r) => r.badge_id === TOTAL_KEY);
  const hasAll = ALL_BADGE_IDS.every((id) => cached.some((r) => r.badge_id === id));
  if (totalRow && hasAll) {
    // 整批写同一时间戳，__total__ 行的 updated_at 即整批的落库时间
    const updatedAt = Number(totalRow.updated_at);
    if (now - updatedAt < STATS_CACHE_MS) {
      const counts: Record<string, number> = {};
      for (const r of cached) if (r.badge_id !== TOTAL_KEY) counts[r.badge_id] = Number(r.holders);
      return json({ totalKeys: Number(totalRow.holders), counts, updatedAt, cached: true });
    }
  }

  const { totalKeys, counts } = await computeStats(env);

  // 整批 upsert（一次 batch，时间戳统一）
  try {
    const stmts = [
      env.meowtrail_users
        .prepare(
          `INSERT INTO badge_stats (badge_id, holders, updated_at) VALUES (?1, ?2, ?3)
           ON CONFLICT (badge_id) DO UPDATE SET holders = excluded.holders, updated_at = excluded.updated_at`
        )
        .bind(TOTAL_KEY, totalKeys, now),
      ...ALL_BADGE_IDS.map((id) =>
        env.meowtrail_users
          .prepare(
            `INSERT INTO badge_stats (badge_id, holders, updated_at) VALUES (?1, ?2, ?3)
             ON CONFLICT (badge_id) DO UPDATE SET holders = excluded.holders, updated_at = excluded.updated_at`
          )
          .bind(id, counts[id] ?? 0, now)
      ),
    ];
    await env.meowtrail_users.batch(stmts);
  } catch {
    // 缓存写失败不影响本次响应（下次再来再算）
  }

  return json({ totalKeys, counts, updatedAt: now, cached: false });
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  if (url.searchParams.get('stats') === '1') return statsResponse(env);

  const sid = getCookie(request, 'mt_session');
  const uid = sid ? (await verifySessionValue(env.OAUTH_STATE_SECRET, sid)) ?? '' : '';
  // 访客键：gp_gid cookie 优先；现网身份链是 localStorage gp_anon_id 每请求随 events 上报
  // （events.ts 的 isNewGuest 只在无合法 anonId 时才 Set-Cookie，而 funnel-track 永远发合法
  // anonId → gp_gid cookie 实际不会被设置），所以 cookie 缺席时兜底接受 ?anonId=（同格式收紧）。
  let gid = getCookie(request, GUEST_COOKIE) ?? '';
  if (!gid) {
    const q = url.searchParams.get('anonId') ?? '';
    if (/^anon-[0-9a-fA-F-]{6,70}$/.test(q)) gid = q;
  }
  const key = uid || gid;
  if (!key) return json({ badges: [], signedIn: false });

  // 登录：user_id=uid（登录后事件）OR guest 时期事件（user_id='' AND guest_id=访客键）
  // —— 注册自动继承，无需回填迁移。未登录：user_id='' AND guest_id。
  let where: string;
  let bindArgs: string[];
  if (uid && gid) {
    where = `user_id = ?1 OR (user_id = '' AND guest_id = ?2)`;
    bindArgs = [uid, gid];
  } else if (uid) {
    where = `user_id = ?1`;
    bindArgs = [uid];
  } else {
    where = `user_id = '' AND guest_id = ?1`;
    bindArgs = [gid];
  }
  const stmt = env.meowtrail_users
    .prepare(
      `SELECT event_name, metadata, created_at FROM gp_event
       WHERE (${where}) AND event_name IN (${LEVEL_EVENTS})
       ORDER BY created_at ASC`
    )
    .bind(...bindArgs);
  const rows = (await stmt.all()).results ?? [];
  return json({ badges: deriveBadges(rows as unknown as EventRow[]), signedIn: Boolean(uid) });
};
