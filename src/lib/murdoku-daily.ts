/**
 * Murdoku Daily —— 日期确定性核心（纯函数，无 DOM / 无 storage 依赖）。
 *
 * 为什么单独成模块：`/murdoku/daily/` 的成败全靠三件事可验证——
 *   ① 同一天所有人同一盘（seed 只由 UTC 日期派生，不碰 Math.random）
 *   ② UTC 零点换日（倒计时与「今天」的判据同源）
 *   ③ streak 只认「完成当天那盘」的连续天数
 * 这三件事都是纯函数，写在这里就能直接被 node 跑断言（见 scripts 内联测试
 * / 卡验收 1、2），不必靠浏览器黑盒。
 *
 * 口径（2026-11-24 卡 t_7ff6a578 写死）：
 *   - 日期键 = UTC 日历日 `YYYY-MM-DD`（toISOString 切片，天然 UTC）
 *   - 盘面大小按 UTC 星期轮换：周一至周五 4×4，周六周日 6×6（对齐 Akari daily 的 Weekend Super 先例）
 *   - seed = FNV-1a 32bit('murdoku-daily|' + 日期键)，同年同月同日的 4×4 与 6×6 是不同盘（前缀固定、key 不同）
 *   - streak 状态：{ lastSolved, streak, best, solved[] }，solved 只留最近 14 天（7 天存档 + 缓冲，防无限增长）
 */

export const STREAK_KEY = 'murdoku_daily_streak';

const DAY_MS = 86400000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const KEEP_SOLVED = 14;

export type DailyStreak = {
  lastSolved: string | null;
  streak: number;
  best: number;
  solved: string[];
};

/** UTC 日历日键，`2026-11-24`。传 Date 便于测试注入。 */
export function dateKeyUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** 日期键平移 N 天（负数向前）。 */
export function shiftDateKey(key: string, days: number): string {
  const t = Date.parse(key + 'T00:00:00Z');
  return new Date(t + days * DAY_MS).toISOString().slice(0, 10);
}

/** UTC 星期：0=周日 … 6=周六。 */
export function weekdayUtc(key: string): number {
  return new Date(key + 'T00:00:00Z').getUTCDay();
}

/** 盘面大小：周末 6×6，工作日 4×4。 */
export function sizeForDateKey(key: string): 4 | 6 {
  const wd = weekdayUtc(key);
  return wd === 0 || wd === 6 ? 6 : 4;
}

/** 日期键 → 引擎 seed（FNV-1a 32bit，稳定跨浏览器/跨机器）。 */
export function seedForDateKey(key: string): number {
  const s = 'murdoku-daily|' + key;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** 距下一个 UTC 零点的毫秒数（UTC 日边界 = epoch ms % 86400000 === 0）。 */
export function msUntilNextUtcMidnight(now: Date = new Date()): number {
  const rem = now.getTime() % DAY_MS;
  return DAY_MS - (rem < 0 ? rem + DAY_MS : rem);
}

/** 毫秒 → `HH:MM:SS`（倒计时显示）。 */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n: number) => (n < 10 ? '0' : '') + n;
  return p(h) + ':' + p(m) + ':' + p(s);
}

function isKey(v: unknown): v is string {
  return typeof v === 'string' && DATE_RE.test(v);
}

/** localStorage 原文 → 状态。脏数据一律降级成空状态，永不抛。 */
export function parseStreak(raw: string | null): DailyStreak {
  const empty: DailyStreak = { lastSolved: null, streak: 0, best: 0, solved: [] };
  if (!raw) return empty;
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return empty;
  }
  if (!o || typeof o !== 'object') return empty;
  const rec = o as Record<string, unknown>;
  const streak = Number.isFinite(rec.streak) ? Math.max(0, Math.floor(Number(rec.streak))) : 0;
  const best = Number.isFinite(rec.best) ? Math.max(0, Math.floor(Number(rec.best))) : 0;
  const solved = Array.isArray(rec.solved) ? rec.solved.filter(isKey).slice(-KEEP_SOLVED) : [];
  return {
    lastSolved: isKey(rec.lastSolved) ? rec.lastSolved : null,
    streak,
    best: Math.max(best, streak),
    solved,
  };
}

/**
 * 完成某天的盘后更新状态。
 * - 同一天重复完成：不重复加 streak（幂等）
 * - 昨天完成过 → streak + 1
 * - 其余（首次 / 漏过一天以上）→ streak 归 1
 */
export function recordSolve(state: DailyStreak, key: string): DailyStreak {
  const solved = state.solved.indexOf(key) >= 0
    ? state.solved.slice()
    : state.solved.concat(key).slice(-KEEP_SOLVED);
  if (state.lastSolved === key) {
    return { lastSolved: key, streak: state.streak, best: Math.max(state.best, state.streak), solved };
  }
  const streak = state.lastSolved === shiftDateKey(key, -1) ? state.streak + 1 : 1;
  return { lastSolved: key, streak, best: Math.max(state.best, streak), solved };
}

/** 当前有效 streak：最后完成日是今天或昨天才算连着，否则已断（显示 0，但 best 保留）。 */
export function effectiveStreak(state: DailyStreak, todayKey: string): number {
  if (state.lastSolved === todayKey) return state.streak;
  if (state.lastSolved === shiftDateKey(todayKey, -1)) return state.streak;
  return 0;
}

export function isSolvedOn(state: DailyStreak, key: string): boolean {
  return state.lastSolved === key || state.solved.indexOf(key) >= 0;
}

/** 7 天存档的日期键：今天在前，往前数 6 天。 */
export function archiveKeys(todayKey: string, count: number = 7): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(shiftDateKey(todayKey, -i));
  return out;
}
