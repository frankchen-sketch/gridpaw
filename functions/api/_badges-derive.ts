// 徽章派生纯函数（badges.ts 与 comments.ts 共用）——输入 gp_event 行，输出已获得徽章。
// 规则与设计稿 gridpaw-badges-comments.html v1 一致（11 枚）；阈值改动只改这里。
// ⚠️ Shikaku 阶梯历史数据有 0-based 污染（6128d13 之前），max 口径对档位只轻微偏差，可接受。

export const LEVEL_EVENTS = `'level_complete_1','level_complete_3','level_complete_5','level_complete_10','level_complete_20','level_up','daily_solved'`;

export interface EventRow {
  event_name: string;
  metadata: string | null;
  created_at: number;
}

export interface Badge {
  id: string;
  tier: string;
}

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

export function deriveBadges(rows: EventRow[]): Badge[] {
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

  const badges: Badge[] = [];
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
  return badges;
}

// 徽章展示名（留言墙徽章 chip 用；与设计稿 ④C 一致）
export const BADGE_LABELS: Record<string, string> = {
  'rookie-paw': 'Rookie Paw',
  'detective': 'Detective',
  'chief-detective': 'Chief Detective',
  'mastermind': 'Mastermind',
  'first-case-closed': 'First Case Closed',
  'serial-solver': 'Serial Solver',
  'six-six-cracked': '6×6 Cracked',
  'private-eye': 'Private Eye',
  'warm-up': '3-day streak',
  'streak-keeper': '7-day streak',
  'night-owl': '14-day streak',
};

// 全部徽章 id（升序档位；与 src/lib/badge-icons.ts 的 BADGES 一一对应）。
// 稀有度聚合（/api/badges?stats=1）用它给 0 持有者补行，避免前端缺 key。
export const ALL_BADGE_IDS = [
  'rookie-paw',
  'detective',
  'chief-detective',
  'mastermind',
  'first-case-closed',
  'serial-solver',
  'six-six-cracked',
  'private-eye',
  'warm-up',
  'streak-keeper',
  'night-owl',
] as const;

const TIER_ORDER: Record<string, number> = { bronze: 0, silver: 1, gold: 2, mythic: 3 };

// 留言墙 chip：取最高档的两枚（设计稿 ④C 每条评论最多 2 个徽章）
export function topBadges(badges: Badge[], n = 2): { id: string; label: string }[] {
  return badges
    .slice()
    .sort((a, b) => (TIER_ORDER[b.tier] ?? 0) - (TIER_ORDER[a.tier] ?? 0))
    .slice(0, n)
    .map((b) => ({ id: b.id, label: BADGE_LABELS[b.id] ?? b.id }));
}
