/**
 * Krillion 页面共享逻辑 —— 从 .astro frontmatter 里抽出来。
 *
 * 为什么不在页面里写：带 getStaticPaths 的页面 + 超过 ~60 行的 frontmatter，
 * Astro 5.18 的编译链会抛 `Unexpected "export"`（esbuild 报在 frontmatter 中部，
 * 行号随 frontmatter 长度漂移）。同样内容放进独立 .ts 模块再 import 就正常。
 * 所以这里承载全部数据整理，页面只留渲染。
 */
import { fmt, longDate, shortDate, diveTag, type Dive, type Prompt } from './krillion';

export const TIERS = [
  { key: 'plank', label: 'Plankton', pts: 10 },
  { key: 'school', label: 'Schooler', pts: 30 },
  { key: 'rare', label: 'Rare', pts: 60 },
  { key: 'deep', label: 'Deep Cut', pts: 85 },
  { key: 'one', label: 'One in a Krillion', pts: 100 },
] as const;

export type TierKey = (typeof TIERS)[number]['key'];

export interface TierItem {
  name: string;
  note: string;
}

export interface TierGroup {
  key: TierKey;
  label: string;
  pts: number;
  items: TierItem[];
  more: number;
}

/** 把一道题的答案按五档分组（Plankton → One in a Krillion） */
export function tiersOf(p: Prompt): TierGroup[] {
  const groups: TierGroup[] = [];
  for (const t of TIERS) {
    if (t.key === 'one') {
      groups.push({
        ...t,
        items: p.one.map((a) => ({ name: a.a, note: a.players ? fmt(a.players) : '' })),
        more: 0,
      });
      continue;
    }
    if (t.key === 'deep') {
      groups.push({
        ...t,
        items: p.deep.map((a) => ({ name: a.a, note: a.players ? fmt(a.players) : '' })),
        more: Math.max(0, (p.deepCuts || 0) - p.deep.length),
      });
      continue;
    }
    const want = t.key === 'plank' ? 'Plankton' : t.key === 'school' ? 'Schooler' : 'Rare';
    groups.push({
      ...t,
      items: p.crowd
        .filter((a) => a.tier === want)
        .map((a) => ({ name: a.a, note: a.pct ? `${a.pct}%` : '' })),
      more: 0,
    });
  }
  return groups.filter((g) => g.items.length > 0);
}

/** 紧凑数字：33M / 383K / 1234 */
export function compact(n: number): number | string {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return Math.round(n / 1e3) + 'K';
  return n;
}

/** 归档页的年份/月份分组 */
export function groupByYear(dives: Dive[]): Array<{ year: number; months: Array<[string, Dive[]]> }> {
  const byYear = new Map<number, Dive[]>();
  for (const d of dives) {
    const y = Number(d.date.slice(0, 4));
    const arr = byYear.get(y) ?? [];
    arr.push(d);
    byYear.set(y, arr);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => {
      const m = new Map<string, Dive[]>();
      for (const d of list) {
        const key = d.date.slice(0, 7);
        const arr = m.get(key) ?? [];
        arr.push(d);
        m.set(key, arr);
      }
      return { year, months: [...m.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)) };
    });
}

export const monthLabel = (isoDate: string): string =>
  new Date(isoDate + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/** 日页 FAQ */
export function dayFaqs(dive: Dive, listed: number, minAcc: number, maxAcc: number) {
  const dtag = diveTag(dive);
  return [
    {
      q: `What were the Krillion prompts on ${longDate(dive.date)}?`,
      a: `${dtag || 'That Dive'} had ${dive.promptCount} prompts: ${dive.prompts
        .map((p) => `“${p.prompt}”`)
        .join('; ')}. Between them they accepted ${fmt(minAcc)} to ${fmt(maxAcc)} answers each.`,
    },
    {
      q: 'How are the rarity tiers scored?',
      a: 'Plankton 10 · Schooler 30 · Rare 60 · Deep Cut 85 · One in a Krillion 100. The game scores answers against a familiarity database plus editorial review, so the same answer always gets the same tier.',
    },
    {
      q: 'Why are only some accepted answers listed?',
      a: `We document ${fmt(
        listed,
      )} of the answers that change your score — the top tier, Deep Cuts, and the crowd favourites — rather than every low-value variant. The full list is revealed inside the game.`,
    },
    {
      q: 'Is this the official Krillion site?',
      a: 'No. GridPaw is independent and not affiliated with krillion.io. This is an answer archive for players who want to check a score or see what they missed.',
    },
  ];
}

/** 单题页 FAQ */
export function promptFaqs(dive: Dive, prompt: Prompt, listed: number) {
  const dtag = diveTag(dive);
  const one = prompt.one[0];
  return [
    {
      q: `What answers work for “${prompt.prompt}”?`,
      a: `The game accepted ${fmt(prompt.accepted)} answers for this prompt in ${
        dtag || 'this Dive'
      }. We document ${listed} of the most valuable and most-missed ones: ${
        one ? `the top-tier pick is “${one.a}”; ` : ''
      }${prompt.deep
        .slice(0, 6)
        .map((a) => `“${a.a}”`)
        .join(', ')} sit in Deep Cuts, and ${prompt.crowd
        .slice(0, 4)
        .map((a) => `“${a.a}”`)
        .join(', ')} are what most players typed.`,
    },
    {
      q: `What was the rarest answer for “${prompt.prompt}”?`,
      a: one
        ? `“${one.a}” — a One in a Krillion answer worth 100 points, found by ${fmt(
            one.players,
          )} of ${fmt(prompt.answersGiven)} players.`
        : 'This prompt had no top-tier answer recorded in our catalogue.',
    },
    {
      q: `Why are only ${listed} of ${fmt(prompt.accepted)} accepted answers listed?`,
      a: 'The full answer list is revealed inside the game, and the official archive of past answers requires a one-off unlock. We catalogue the answers that actually change your score — the top tier, Deep Cuts, and the crowd favourites — rather than every low-value Plankton variant.',
    },
    {
      q: `When did “${prompt.prompt}” appear in Krillion?`,
      a: `It was one of the ${dive.promptCount} prompts in ${dtag || 'this Dive'} on ${longDate(
        dive.date,
      )}. Krillion resets daily at 05:00 UTC, so a prompt only appears once.`,
    },
  ];
}

/** 归档页 FAQ */
export function archiveFaqs(dives: Dive[], totalAnswers: number) {
  const oldest = dives[dives.length - 1];
  const newest = dives[0];
  return [
    {
      q: 'How far back does this archive go?',
      a: `The oldest Dive we can fully document is ${
        diveTag(oldest) || shortDate(oldest.date)
      } on ${longDate(oldest.date)} — ${dives.length} Dives in total, ${fmt(
        totalAnswers,
      )} documented answers. Earlier Dives can't be reconstructed because the public reveal data doesn't go back further.`,
    },
    {
      q: 'Why does the archive start where it does?',
      a: `Krillion reveals each day's answer bank only for that day. Past answer lists are normally behind the game's own one-off unlock, so an independent archive can only cover the days it captured. We add one Dive per day going forward — most recently ${
        diveTag(newest) || shortDate(newest.date)
      }.`,
    },
    {
      q: 'Is this the official Krillion archive?',
      a: `No. GridPaw is independent and not affiliated with krillion.io. Prompt text comes from Krillion's public daily endpoint; answer tiers and player counts come from the game's public reveal data.`,
    },
  ];
}

/** FAQPage JSON-LD */
export function faqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
