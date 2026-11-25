#!/usr/bin/env node
/**
 * Krillion Daily Dive 数据抓取 → src/data/krillion-dives/<date>.json
 *
 * 数据分层（重要，别混）：
 *   1) 题面 / dive 号 / 重置时间 —— 官方 krillion.io/api/today（免费、第一手、权威）
 *   2) 答案 + 玩家数 —— krillionunlimited.org（SSR 出公开 reveal 的二次整理）
 *      官方把答案数据锁在 /api/archive/*（402 locked，$5 解锁），所以这是唯一可得来源
 *
 * 关键校验：两边的题面必须逐条一致。不一致 = 竞品页面还没换题或延迟，
 * 这时**不写文件**，避免把 A 日的题面配 B 日的答案。
 *
 * 用法：
 *   node scripts/krillion/fetch-dive.mjs                  # 今日（含对齐校验）
 *   node scripts/krillion/fetch-dive.mjs --backfill 30    # 回填最近 N 天
 *   node scripts/krillion/fetch-dive.mjs --date 2026-11-20
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const OUT_DIR = join(ROOT, 'src', 'data', 'krillion-dives');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const OFFICIAL = 'https://krillion.io/api/today';
const AGG_DAY = (d) => `https://krillionunlimited.org/krillion-answers/${d}/`;
const AGG_TODAY = 'https://krillionunlimited.org/krillion-answers/';

const TIER_PTS = { Plankton: 10, Schooler: 30, Rare: 60, 'Deep Cut': 85, 'One in a Krillion': 100 };

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

const num = (s) => Number(String(s ?? '').replace(/[^0-9]/g, '')) || 0;

export function slugify(prompt) {
  return prompt
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, ''); // slice 可能切在短横线上，收尾再去一次
}

/** 归一化题面用于比对：去标点、统一撇号、压空格 */
const normQ = (s) =>
  String(s)
    .toLowerCase()
    .replace(/['’`]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** 解析聚合站的答案区（一个页面里的 7 个 oa-prompt 段） */
export function parseAnswers(html) {
  const out = [];
  const sections = [
    ...html.matchAll(/<section class="oa-prompt" id="prompt-(\d+)">([\s\S]*?)<\/section>/g),
  ];

  for (const [, nStr, body] of sections) {
    const n = Number(nStr);
    const h2 = body.match(/<h2>([\s\S]*?)<\/h2>/);
    const prompt = h2 ? decode(h2[1]).replace(/^\d+\.\s*/, '').trim() : '';
    if (!prompt) continue;

    const metaTxt = decode((body.match(/<p class="oa-meta">([\s\S]*?)<\/p>/) || [])[1] || '');
    const answersGiven = num((metaTxt.match(/([\d,]+)\s*answers given/) || [])[1]);
    const accepted = num((metaTxt.match(/([\d,]+)\s*accepted answers/) || [])[1]);
    const deepCuts = num((metaTxt.match(/([\d,]+)\s*Deep Cuts/) || [])[1]);
    const oneCount = num((metaTxt.match(/([\d,]+)\s*One in a Krillion/) || [])[1]);

    const crowd = [];
    for (const m of body.matchAll(
      /<li class="oa-row"[^>]*>[\s\S]*?<span class="oa-a">([\s\S]*?)<\/span>[\s\S]*?<span class="oa-t">([\s\S]*?)<\/span>[\s\S]*?<span class="oa-n">([\s\S]*?)<\/span>/g,
    )) {
      const tierRaw = decode(m[2]);
      const tier = (tierRaw.split('·')[0] || '').trim();
      crowd.push({
        a: decode(m[1]),
        tier,
        pts: TIER_PTS[tier] ?? num(tierRaw.split('·')[1]),
        pct: Number(decode(m[3]).replace('%', '')) || 0,
      });
    }

    const one = [];
    const krBlock = body.match(/<ul class="oa-kr">([\s\S]*?)<\/ul>/);
    if (krBlock) {
      for (const m of krBlock[1].matchAll(/<li>([\s\S]*?)<\/li>/g)) {
        const txt = decode(m[1]);
        const strong = m[1].match(/<strong>([\s\S]*?)<\/strong>/);
        const answer = strong ? decode(strong[1]) : txt.split('·')[0].trim();
        if (answer) one.push({ a: answer, players: num((txt.match(/([\d,]+)\s*players?/) || [])[1]) });
      }
    }

    const deep = [];
    const deepBlock = body.match(/<p class="oa-deep">([\s\S]*?)<\/p>/);
    if (deepBlock) {
      for (const m of deepBlock[1].matchAll(/([^,<]+?)\s*<span class="muted">\(([\d,]+)\)<\/span>/g)) {
        const answer = decode(m[1]).replace(/^,\s*/, '');
        if (answer) deep.push({ a: answer, players: num(m[2]) });
      }
    }

    const summary = decode((body.match(/<p class="oa-line">([\s\S]*?)<\/p>/) || [])[1] || '');

    out.push({ n, prompt, slug: slugify(prompt), answersGiven, accepted, deepCuts, oneCount, crowd, one, deep, summary });
  }
  return out;
}

async function getJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.json();
}

async function getHtml(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) return { html: null, status: r.status };
  return { html: await r.text(), status: r.status };
}

/** 抓一天：官方题面 + 聚合答案，逐条对齐校验 */
async function fetchDay(date) {
  // 1) 官方（只有「今天」这一个免费入口）
  let official = null;
  if (!date) {
    official = await getJson(OFFICIAL);
    date = official.date;
  }

  // 2) 聚合站
  const aggUrl = date ? AGG_DAY(date) : AGG_TODAY;
  let { html, status } = await getHtml(aggUrl);
  if (!html || status !== 200) {
    // 某天归档 404 时（聚合站归档有延迟），退回今日页
    ({ html, status } = await getHtml(AGG_TODAY));
    if (!html || status !== 200) throw new Error(`聚合站不可用（${aggUrl} → ${status}）`);
  }

  const parsed = parseAnswers(html);
  if (parsed.length === 0) throw new Error('聚合站解析出 0 题（页面结构可能变了）');

  // 3) 对齐校验：官方题面 vs 聚合题面
  let aligned = false;
  let mismatch = [];
  if (official?.prompts?.length) {
    const off = official.prompts.map((p) => normQ(p.text));
    const agg = parsed.map((p) => normQ(p.prompt));
    mismatch = off.filter((q, i) => q !== agg[i]).map((q, i) => ({ n: i + 1, official: official.prompts[i].text, agg: parsed[i]?.prompt }));
    aligned = mismatch.length === 0 && off.length === agg.length;
    if (!aligned) {
      // 官方说今天是 X，聚合站还在昨天的题 → 不写文件
      throw new Error(
        `题面未对齐（官方 ${official.date} / Dive ${official.dayNumber}）：\n` +
          mismatch.slice(0, 3).map((m) => `  p${m.n} 官方="${m.official}" 聚合="${m.agg}"`).join('\n'),
      );
    }
  }

  return {
    date,
    dive: official?.dayNumber ?? null,
    resetsAt: official?.resetsAt ?? null,
    promptSource: official ? 'krillion.io/api/today' : null,
    answerSource: 'krillionunlimited.org',
    answerSourceNote: 'Answers and player counts are aggregated from the game\'s public reveal data.',
    fetchedAt: new Date().toISOString(),
    aligned,
    promptCount: parsed.length,
    prompts: parsed,
  };
}

function save(dive) {
  mkdirSync(OUT_DIR, { recursive: true });
  const file = join(OUT_DIR, `${dive.date}.json`);
  writeFileSync(file, JSON.stringify(dive, null, 2) + '\n');
  return file;
}

const isoDate = (d) => d.toISOString().slice(0, 10);

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--backfill') {
    const days = Number(args[1] || 30);
    let ok = 0;
    let skipped = 0;
    let failed = 0;
    let fake = 0;

    // 聚合站对「不存在的日期」会返回 200 + 最新一天的内容（题面与今天一字不差）。
    // 用今日题面做指纹：连续多天题面完全一致 = 兜底内容，不是真实归档，跳过。
    let baseline = null;
    try {
      const t = await fetchDay();
      baseline = t.prompts.map((p) => normQ(p.prompt)).join('|');
    } catch {
      /* 拿不到基线就只按已存文件跳过 */
    }

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const date = isoDate(d);
      if (existsSync(join(OUT_DIR, `${date}.json`))) {
        skipped++;
        continue;
      }
      try {
        const dive = await fetchDay(date);
        const sig = dive.prompts.map((p) => normQ(p.prompt)).join('|');
        if (baseline && sig === baseline) {
          fake++;
          process.stdout.write(`⊘ ${date} — 题面与今日相同（聚合站兜底内容，跳过）\n`);
          continue;
        }
        dive.date = date;
        save(dive);
        ok++;
        process.stdout.write(`✓ ${date} — ${dive.promptCount} prompts\n`);
      } catch (e) {
        failed++;
        process.stdout.write(`✗ ${date} — ${e.message.split('\n')[0]}\n`);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    console.log(`\nbackfill: wrote ${ok}, skipped ${skipped}, fake ${fake}, failed ${failed} (window ${days}d)`);
    return;
  }

  const dateArg = args[0] === '--date' ? args[1] : null;
  const dive = await fetchDay(dateArg);
  if (dateArg) dive.date = dateArg;
  const file = save(dive);
  const listed = dive.prompts.reduce((n, p) => n + p.crowd.length + p.one.length + p.deep.length, 0);
  console.log(
    `${file}\n  date=${dive.date} dive=${dive.dive} prompts=${dive.promptCount} listedAnswers=${listed} aligned=${dive.aligned}`,
  );
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
