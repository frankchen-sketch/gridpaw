// Krillion Daily Dive 数据层
//
/// <reference types="astro/client" />
//
// 数据来源与口径（对外页面上会如实写，别在代码里偷偷改口径）：
//   - 题面 / Dive 号 / 重置时间：官方 krillion.io/api/today（免费公开接口）
//   - 答案 / 玩家数：官方把归档与答案锁在 /api/archive/*（402，$5 解锁），
//     所以公开可得的答案只存在于聚合站的二次整理（krillionunlimited.org）
//
// 关键：tier 的「档位」是游戏官方编辑定的固定档，
// 而「players / pct」才是真实玩家数据。两者别混着讲。

export interface Answer {
  a: string;
  players?: number;
  pct?: number;
  tier?: string;
  pts?: number;
}

export interface Prompt {
  n: number;
  prompt: string;
  slug: string;
  answersGiven: number;
  accepted: number;
  deepCuts: number;
  oneCount: number;
  crowd: Answer[];
  one: Answer[];
  deep: Answer[];
  summary: string;
}

export interface Dive {
  date: string;
  dive: number | null;
  resetsAt: string | null;
  promptSource: string | null;
  answerSource: string;
  answerSourceNote: string;
  fetchedAt: string;
  aligned: boolean;
  promptCount: number;
  prompts: Prompt[];
}

export const TIER_LABEL: Record<string, string> = {
  one: 'One in a Krillion',
  deep: 'Deep Cut',
  rare: 'Rare',
  school: 'Schooler',
  plank: 'Plankton',
};

export const TIER_POINTS: Record<string, number> = {
  one: 100,
  deep: 85,
  rare: 60,
  school: 30,
  plank: 10,
};

const modules = import.meta.glob<{ default: Dive }>('../data/krillion-dives/*.json', { eager: true });

/** 全部 dive，新→旧 */
export const allDives: Dive[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const latestDive: Dive | undefined = allDives[0];

export const diveByDate = (date: string): Dive | undefined =>
  allDives.find((d) => d.date === date);

/** 单题页索引：slug → { dive, prompt } */
export const promptIndex = new Map<string, { dive: Dive; prompt: Prompt }>();
for (const d of allDives) {
  for (const p of d.prompts) {
    if (!promptIndex.has(p.slug)) promptIndex.set(p.slug, { dive: d, prompt: p });
  }
}

/** 该题所有已收录答案（合并三档，按稀有度降序） */
export function allAnswers(p: Prompt): Answer[] {
  return [...p.one, ...p.deep, ...p.crowd];
}

export const listedCount = (p: Prompt): number => p.one.length + p.deep.length + p.crowd.length;

export const totalListed = (d: Dive): number =>
  d.prompts.reduce((n, p) => n + listedCount(p), 0);

/** 格式化玩家数：5332742 → 5,332,742 */
export const fmt = (n: number | undefined | null): string =>
  typeof n === 'number' ? n.toLocaleString('en-US') : '—';

/** 2026-11-24 → November 24, 2026 */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** 2026-11-24 → Nov 24 */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** 该 dive 里最稀有的答案（One in a Krillion，找到人数最少的那条） */
export function rarestOverall(d: Dive): { answer: Answer; prompt: Prompt } | null {
  const all = d.prompts.flatMap((p) => p.one.map((a) => ({ answer: a, prompt: p })));
  if (!all.length) return null;
  return all.sort((x, y) => (x.answer.players ?? Infinity) - (y.answer.players ?? Infinity))[0];
}

// 历史数据只有聚合站页，没有官方 Dive 号。官方每天一个 Dive，所以可以从
// 「已知号的那天」按日期差反推——比显示 #null 好得多，也比留空更有信息量。
const DIVE_ANCHOR = allDives.find((d) => typeof d.dive === 'number' && d.dive > 0);

/** 该天的 Dive 号；能反推就反推，反推不了返回 null */
export function diveNo(d: Dive): number | null {
  if (typeof d.dive === 'number' && d.dive > 0) return d.dive;
  if (!DIVE_ANCHOR?.dive) return null;
  const utc = (iso: string) => {
    const [y, m, dd] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, dd);
  };
  const days = Math.round((utc(DIVE_ANCHOR.date) - utc(d.date)) / 86_400_000);
  const n = DIVE_ANCHOR.dive - days;
  return n > 0 ? n : null;
}

/** 「Dive #128」或空串（没有号时用于标题拼接） */
export const diveTag = (d: Dive): string => {
  const n = diveNo(d);
  return n ? `Dive #${n}` : '';
};

/** 总提交量（各题 answers given 相加）—— 这是真实玩家提交数据 */
export const totalSubmitted = (d: Dive): number =>
  d.prompts.reduce((n, p) => n + (p.answersGiven || 0), 0);

/** 答案速查索引：答案词（小写归一）→ [{prompt, tier, pts, players, pct}] */
export function buildFinder(d: Dive) {
  const map = new Map<string, Array<{ p: Prompt; a: Answer; tier: string }>>();
  for (const p of d.prompts) {
    for (const a of p.one) push(map, p, a, 'one');
    for (const a of p.deep) push(map, p, a, 'deep');
    for (const a of p.crowd) push(map, p, a, a.tier ? tierKey(a.tier) : 'school');
  }
  return map;
}

function tierKey(tier: string): string {
  if (tier === 'One in a Krillion') return 'one';
  if (tier === 'Deep Cut') return 'deep';
  if (tier === 'Rare') return 'rare';
  if (tier === 'Schooler') return 'school';
  return 'plank';
}

function push(
  map: Map<string, Array<{ p: Prompt; a: Answer; tier: string }>>,
  p: Prompt,
  a: Answer,
  tier: string,
) {
  const k = a.a.toLowerCase().trim();
  const arr = map.get(k) ?? [];
  arr.push({ p, a, tier });
  map.set(k, arr);
}
