#!/usr/bin/env node
// Generates public/llms-full.txt (llmstxt.org "full" variant) from src/pages content:
// per-page title + description + FAQPage JSON-LD Q&A, expanded verbatim.
//
// ⚠️ NOT wired into the build chain yet: package.json is held by the parallel PWA-SW
// session (2026-10-29). After that lands, add `node scripts/gen-llms-full.mjs &&` before
// `node scripts/fix-sitemap.mjs` in the build script. Until then run it by hand:
//   node scripts/gen-llms-full.mjs
//
// Excludes: de/pt-br locale lines (English file), offline.astro (PWA session WIP), admin/api/404.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const PAGES = join(ROOT, 'src', 'pages');
const OUT = join(ROOT, 'public', 'llms-full.txt');

const EXCLUDE_DIRS = new Set(['de', 'pt-br', 'api', 'admin']);
const EXCLUDE_FILES = new Set(['404.astro', 'offline.astro', 'badges.astro']);

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!EXCLUDE_DIRS.has(name)) walk(p, acc);
    } else if (name === 'index.astro' && !EXCLUDE_FILES.has(name)) {
      acc.push(p);
    }
  }
  return acc;
}

// Extract string literal for  key from the frontmatter text (handles \" escapes).
function grab(src, key) {
  const re = new RegExp(`const ${key} = "((?:[^"\\\\]|\\\\.)*)";`);
  const m = src.match(re);
  return m ? m[1].replace(/\\"/g, '"').replace(/\\'/g, "'") : '';
}

// FAQ extraction — three shapes in the codebase:
//   1. const faqJsonLd = { ... "name": "Q", "text": "A" ... }      (BP3 / RR pages)
//   2. const faqJsonLd = [ { ... name: "Q", text: "A" ... }, ... ] (guide pages, unquoted keys)
//   3. const faqs = [ { q: "Q", a: "A" }, ... ]                    (solver etc.)
function grabFAQ(src) {
  const faqLd = src.match(/const faqJsonLd = [\s\S]*?;\n/);
  if (faqLd) {
    const block = faqLd[0];
    const names = [...block.matchAll(/(?:^|[{,\n]\s*)(?:"name"|name):\s*"((?:[^"\\]|\\.)*)"/gm)].map(x => x[1]);
    const texts = [...block.matchAll(/(?:^|[{,\n]\s*)(?:"text"|text):\s*"((?:[^"\\]|\\.)*)"/gm)].map(x => x[1]);
    const pairs = names.map((n, i) => ({ q: n, a: texts[i] || '' })).filter(p => p.q && p.a);
    if (pairs.length) return pairs;
  }
  const faqs = src.match(/const faqs = \[[\s\S]*?\n\];/);
  if (faqs) {
    return [...faqs[0].matchAll(/q:\s*"((?:[^"\\]|\\.)*)"\s*,\s*a:\s*"((?:[^"\\]|\\.)*)"/g)]
      .map(m => ({ q: m[1], a: m[2] }));
  }
  return [];
}

// BP3 task line: "<…> answer: <task>. Full step order plus video walkthrough."
function grabTask(desc) {
  const m = desc.match(/answer:\s*(.+?)\.\s*Full step order/);
  return m ? m[1] : '';
}

function urlFor(rel) {
  // rel = path relative to src/pages, ending with /index.astro
  let u = '/' + rel.slice(0, -'index.astro'.length);
  if (u === '/') return 'https://gridpaw.com/';
  return `https://gridpaw.com${u.endsWith('/') ? u : u + '/'}`;
}

const files = walk(PAGES);
const pages = files.map(f => {
  const src = readFileSync(f, 'utf8');
  const rel = relative(PAGES, f);
  const front = src.split('---')[1] || '';
  return {
    rel,
    url: urlFor(rel),
    title: grab(front, 'title'),
    desc: grab(front, 'description'),
    faq: grabFAQ(front),
  };
}).filter(p => p.title || p.desc);

const gamePages = ['/index.astro', 'akari', 'kakuro', 'nonogram', 'nurikabe', 'binary', 'hashi',
  'kenken', 'slitherlink', 'star-battle', 'murdoku', 'calcudoku', 'pictomino', 'meowdoku'];
// Pictomino lives in public/pictomino/ (pure static, no astro page) — hand-authored entry.
const PICTOMINO_ENTRY = `### Pictomino — Spatial Reasoning for Kids
URL: https://gridpaw.com/pictomino/
Drag and rotate cat puzzle pieces to fill the grid. Spatial reasoning puzzle game for kids, multiple difficulty levels from 3x3 to 5x5, with a daily puzzle and leaderboard.
`;
const isBP3 = p => p.rel.startsWith('brain-puzzle-3');
const isRR = p => p.rel.startsWith('rotate-rings');
const isLoop = p => p.rel.startsWith('the-loop');
const isGame = p => gamePages.some(g => p.rel === (g === '/index.astro' ? 'index.astro' : g + '/index.astro'));

const lvl = p => (p.rel.match(/level-(\d+)/) || [])[1];
const byNum = (a, b) => (Number(lvl(a)) || 0) - (Number(lvl(b)) || 0);

function fmtPage(p, { withTask = false } = {}) {
  let out = `### ${p.title || p.rel}\nURL: ${p.url}\n`;
  if (withTask) {
    const task = grabTask(p.desc);
    if (task) out += `Task: ${task}\n`;
    else out += `${p.desc}\n`;
  } else if (p.desc) {
    out += `${p.desc}\n`;
  }
  for (const { q, a } of p.faq) out += `\nQ: ${q}\nA: ${a}`;
  return out + '\n';
}

const out = [];
out.push(`# GridPaw — Full Site Content for LLMs`);
out.push('');
out.push(`> GridPaw is a free online platform for cat-themed Japanese logic puzzle games (Shikaku, Akari, Kakuro, Nonogram, Nurikabe and more), plus fan-made walkthroughs and answers for popular brain-puzzle mobile games. Unofficial guides where applicable; no game assets are reproduced.`);
out.push('');
out.push(`Last generated: from repository source at build time. All URLs use trailing slashes.`);

out.push(`\n## Games`);
const gameSections = gamePages.map(g => pages.find(p => p.rel === (g === '/index.astro' ? 'index.astro' : g + '/index.astro'))).filter(Boolean).map(p => fmtPage(p)).join('');
out.push(gameSections + (pages.some(p => p.rel === 'pictomino/index.astro') ? '' : PICTOMINO_ENTRY));

const bp3 = pages.filter(isBP3);
const bp3Hub = bp3.find(p => p.rel === 'brain-puzzle-3-answers/index.astro');
const bp3Levels = bp3.filter(p => p.rel !== 'brain-puzzle-3-answers/index.astro').sort(byNum);
if (bp3Levels.length) {
  out.push(`\n## Brain Puzzle 3: Crazy Mind — Level Answers and Walkthroughs`);
  out.push(`> Brain Puzzle 3 (subtitled Crazy Mind, by Joygame) is a mobile brain-teaser game. Each page below carries the level's exact task text, the full step-by-step answer, and video-timestamp verification. Unofficial fan-made guide.`);
  if (bp3Hub) out.push(fmtPage(bp3Hub));
  out.push(bp3Levels.map(p => fmtPage(p, { withTask: true })).join(''));
}

const rr = pages.filter(isRR);
const rrHub = rr.find(p => p.rel === 'rotate-rings/index.astro');
const rrLevels = rr.filter(p => p.rel !== 'rotate-rings/index.astro').sort(byNum);
if (rrLevels.length) {
  out.push(`\n## Rotate Rings — Level Hints & Walkthroughs`);
  out.push(`> Rotate Rings (by Nebula Studio) is a ring-rotation puzzle game. Each page is solved frame-by-frame with timed burst timestamps. Unofficial fan-made guide.`);
  if (rrHub) out.push(fmtPage(rrHub));
  out.push(rrLevels.map(p => fmtPage(p)).join(''));
}

const loop = pages.filter(isLoop).sort((a, b) => a.rel.localeCompare(b.rel));
if (loop.length) {
  out.push(`\n## The Loop (Britannica daily picture puzzle) — Guides`);
  out.push(`> The Loop is Britannica's daily picture puzzle. These pages track daily answers and strategy. Unofficial fan-made guide.`);
  out.push(loop.map(p => fmtPage(p)).join(''));
}

const content = pages.filter(p => !isBP3(p) && !isRR(p) && !isLoop(p) && !isGame(p));
if (content.length) {
  out.push(`\n## Guides and Content Pages`);
  out.push(content.sort((a, b) => a.rel.localeCompare(b.rel)).map(p => fmtPage(p)).join(''));
}

writeFileSync(OUT, out.join('\n'));
const kb = (statSync(OUT).size / 1024).toFixed(0);
console.log(`llms-full.txt written: ${pages.length} pages (${kb} KB)`);
const missing = pages.filter(p => !p.faq.length && !isGame(p) && !p.rel.startsWith('the-loop'));
if (missing.length) console.log(`pages without FAQ (fine for games, check content pages): ${missing.map(p => p.rel).join(', ')}`);
if (!existsSync(join(ROOT, 'public', 'llms.txt'))) console.error('WARN: public/llms.txt (index) missing');
