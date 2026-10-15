// GET /api/badges —— 按访客键派生徽章列表（全部来自 gp_event 已有埋点，零新打点）
// 访客键口径：登录用户按 uid 归并 + 继承同浏览器 guest 时期事件（无迁移）；未登录按 guest_id。
// 派生规则（设计稿 gridpaw-badges-comments.html v1，11 枚）：
//   Shikaku 阶梯 = max(level_complete_N, level_up 的数值 level)；⚠️ 历史数据有 0-based 污染（6128d13 之前），
//     max 口径对档位徽章只会轻微低估/高估个位数，可接受
//   Murdoku 破案 = level_up 的 metadata.level ∈ {'4x4','6x6'} 计数
//   Streak = daily_solved 按访客按 UTC 日去重后的最长连续天数
import type { Env } from './_lib';
import { json, getCookie, verifySessionValue } from './_lib';
import { GUEST_COOKIE } from './_funnel-sql';

interface EventRow {
  event_name: string;
  metadata: string | null;
  created_at: number;
}

const LEVEL_EVENTS = `'level_complete_1','level_complete_3','level_complete_5','level_complete_10','level_complete_20','level_up','daily_solved'`;

function parseLevel(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && /^\d+$/.test(raw)) return parseInt(raw, 10);
  return null;
}

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const sid = getCookie(request, 'mt_session');
  const uid = sid ? (await verifySessionValue(env.OAUTH_STATE_SECRET, sid)) ?? '' : '';
  // 访客键：gp_gid cookie 优先；现网身份链是 localStorage gp_anon_id 每请求随 events 上报
  // （events.ts 的 isNewGuest 只在无合法 anonId 时才 Set-Cookie，而 funnel-track 永远发合法
  // anonId → gp_gid cookie 实际不会被设置），所以 cookie 缺席时兜底接受 ?anonId=（同格式收紧）。
  let gid = getCookie(request, GUEST_COOKIE) ?? '';
  if (!gid) {
    const q = new URL(request.url).searchParams.get('anonId') ?? '';
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
  const rows = (await stmt.all()).results ?? [] as unknown as EventRow[];

  let maxLevel = 0;
  const caseRows: EventRow[] = [];
  let sixBySixAt: number | null = null;
  const dailyFirstTs = new Map<string, number>(); // UTC 日 → 当日首个 daily_solved
  for (const e of rows) {
    if (e.event_name.indexOf('level_complete_') === 0) {
      const n = parseLevel(e.event_name.slice('level_complete_'.length));
      if (n !== null && n > maxLevel) maxLevel = n;
    } else if (e.event_name === 'level_up') {
      let level: unknown = null;
      try { level = e.metadata ? JSON.parse(e.metadata)?.level : null; } catch { /* 坏 metadata 忽略 */ }
      const num = parseLevel(level);
      if (num !== null && num > maxLevel) maxLevel = num;
      if (level === '4x4' || level === '6x6') {
        caseRows.push(e);
        if (level === '6x6' && sixBySixAt === null) sixBySixAt = e.created_at;
      }
    } else if (e.event_name === 'daily_solved') {
      const day = new Date(e.created_at).toISOString().slice(0, 10); // UTC 日去重
      if (!dailyFirstTs.has(day)) dailyFirstTs.set(day, e.created_at);
    }
  }

  // streak：按日升序扫最长连续天数，阈值日 = 连续段第 T 天的当日首个事件
  const streakEarn: Record<number, boolean> = { 3: false, 7: false, 14: false };
  const days = Array.from(dailyFirstTs.keys()).sort();
  let prevDay: string | null = null;
  let runLen = 0;
  for (const day of days) {
    const consecutive = prevDay !== null && dayDiff(prevDay, day) === 1;
    runLen = consecutive ? runLen + 1 : 1;
    prevDay = day;
    for (const t of [3, 7, 14]) if (runLen >= t && !streakEarn[t]) streakEarn[t] = true;
  }

  const badges: { id: string; tier: string }[] = [];
  const add = (id: string, tier: string, earned: boolean) => {
    if (earned) badges.push({ id, tier });
  };
  add('rookie-paw', 'bronze', maxLevel >= 5);
  add('detective', 'silver', maxLevel >= 10);
  add('chief-detective', 'gold', maxLevel >= 20);
  add('mastermind', 'mythic', maxLevel >= 35);
  add('first-case-closed', 'bronze', caseRows.length >= 1);
  add('serial-solver', 'silver', caseRows.length >= 3);
  add('six-six-cracked', 'gold', sixBySixAt !== null);
  add('private-eye', 'mythic', caseRows.length >= 10);
  add('warm-up', 'bronze', streakEarn[3]);
  add('streak-keeper', 'silver', streakEarn[7]);
  add('night-owl', 'gold', streakEarn[14]);

  return json({ badges, signedIn: Boolean(uid) });
};
