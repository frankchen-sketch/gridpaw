#!/usr/bin/env node
/**
 * 大格数独集群页面验收（契约 docs/sudoku-cluster-contract.md 第二节）
 *
 * 逐页检查 5 项：
 *   1. 页面文件存在
 *   2. title 能取到，且 6 页两两不重复
 *   3. description 能取到，且 6 页两两不重复
 *   4. 恰好一个 <h1>
 *   5. 引入了 /sudoku-engine.js
 * 另加一条契约要求的内链检查（≥2 条指向其它大格页）。
 *
 * 页面由另一路并行开发，现在很可能整批不存在：
 *   默认 → 缺失只报「未就绪」，不判失败（随时可跑，不挡构建）
 *   --strict → 缺失也算失败，合并前验收用
 *
 * 用法：
 *   node scripts/check-sudoku-pages.mjs
 *   node scripts/check-sudoku-pages.mjs --strict
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PAGES = [
  { route: '/16x16-sudoku/', file: 'src/pages/16x16-sudoku/index.astro', size: '16×16' },
  { route: '/mega-sudoku/', file: 'src/pages/mega-sudoku/index.astro', size: '16×16' },
  { route: '/hexadoku/', file: 'src/pages/hexadoku/index.astro', size: '16×16' },
  { route: '/12x12-sudoku/', file: 'src/pages/12x12-sudoku/index.astro', size: '12×12' },
  { route: '/25x25-sudoku/', file: 'src/pages/25x25-sudoku/index.astro', size: '25×25' },
  { route: '/sudoku-with-letters/', file: 'src/pages/sudoku-with-letters/index.astro', size: '12×12' },
];

const strict = process.argv.slice(2).includes('--strict');

// ── 读取 ─────────────────────────────────────────────────────────────────
function readPage(relPath) {
  const abs = resolve(ROOT, relPath);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

// frontmatter 里 `const title = "..."` 优先，其次 <SEOHead title="..." /> 这类属性写法
function metaField(astro, name) {
  const q = '(["\'`])';
  const patterns = [
    new RegExp(`const\\s+${name}\\s*=\\s*${q}([\\s\\S]*?)\\1`),
    new RegExp(`\\b${name}\\s*=\\s*\\{\\s*${q}([\\s\\S]*?)\\1\\s*\\}`),
    new RegExp(`\\b${name}\\s*=\\s*${q}([\\s\\S]*?)\\1`),
  ];
  for (const re of patterns) {
    const m = astro.match(re);
    if (m) return m[2].replace(/\s+/g, ' ').trim();
  }
  return null;
}

const countH1 = (astro) => (astro.match(/<h1[\s>]/gi) ?? []).length;

// 契约要求每页至少 2 条指向其它大格页的内链
function siblingLinks(astro, selfRoute) {
  return PAGES.filter((p) => p.route !== selfRoute && astro.includes(p.route)).map((p) => p.route);
}

// ── 主流程 ───────────────────────────────────────────────────────────────
const report = [];
const issues = [];

for (const page of PAGES) {
  const astro = readPage(page.file);
  if (astro === null) {
    report.push({ ...page, ready: false, line: '未就绪（页面文件不存在）' });
    continue;
  }
  const title = metaField(astro, 'title');
  const description = metaField(astro, 'description');
  const h1 = countH1(astro);
  const hasEngine = astro.includes('/sudoku-engine.js');
  const links = siblingLinks(astro, page.route);
  const bad = [];

  if (!title) bad.push('取不到 title');
  if (!description) bad.push('取不到 description');
  if (h1 !== 1) bad.push(`<h1> 有 ${h1} 个（应恰好 1 个）`);
  if (!hasEngine) bad.push('未引入 /sudoku-engine.js');
  if (links.length < 2) bad.push(`指向其它大格页的内链只有 ${links.length} 条（应 ≥2）`);

  report.push({ ...page, ready: true, title, description, h1, hasEngine, links, bad });
  for (const b of bad) issues.push(`${page.route} ${page.file}：${b}`);
}

// title / description 两两重复（只比已建页；都为空的不算「重复」而是上面已报的缺失）
function duplicates(key, label) {
  const seen = new Map();
  for (const r of report) {
    if (!r.ready || !r[key]) continue;
    const norm = r[key].toLowerCase();
    if (!seen.has(norm)) seen.set(norm, []);
    seen.get(norm).push(r.route);
  }
  const out = [];
  for (const [norm, routes] of seen) {
    if (routes.length > 1) out.push(`${label} 重复（${routes.join(' 与 ')}）：${norm.slice(0, 90)}…`);
  }
  return out;
}
issues.push(...duplicates('title', 'title'), ...duplicates('description', 'description'));

// ── 输出 ─────────────────────────────────────────────────────────────────
const readyCount = report.filter((r) => r.ready).length;
console.log('大格数独集群页面验收（契约第二节）');
console.log(`就绪 ${readyCount}/${PAGES.length} 页 | 检查：title 唯一 / description 唯一 / 恰好 1 个 H1 / 引入 /sudoku-engine.js / ≥2 条同簇内链`);
console.log('');

for (const r of report) {
  if (!r.ready) {
    console.log(`  ✗ ${r.route.padEnd(23)} ${r.file}  ${r.line}`);
    continue;
  }
  const mark = r.bad.length === 0 ? '✓' : '✗';
  const detail = r.bad.length === 0
    ? `H1×${r.h1} | 引擎 ✓ | 内链 ${r.links.length} | title ${r.title.length} 字符 / desc ${r.description.length} 字符`
    : r.bad.join('；');
  console.log(`  ${mark} ${r.route.padEnd(23)} ${detail}`);
}

if (issues.length) {
  console.log(`\n问题 ${issues.length} 条：`);
  for (const it of issues) console.log(`  - ${it}`);
} else if (readyCount === PAGES.length) {
  console.log('\n全部通过。');
}

if (readyCount === 0) {
  console.log('\n6 页都还没建：等卡2（feat/sudoku-pages）合并后重跑。');
}

let exitCode = 0;
if (issues.length) exitCode = 1;
else if (strict && readyCount < PAGES.length) {
  console.log(`\n--strict：还差 ${PAGES.length - readyCount} 页未建，判失败。`);
  exitCode = 1;
}
if (readyCount === 0) console.log('\n结论：全部未就绪，没有可验收的页面。');
else if (issues.length) console.log('\n结论：已建页里有不合规项，见上面的问题清单。');
else console.log(`\n结论：已建页均合规${readyCount < PAGES.length ? `（${PAGES.length - readyCount} 页未就绪，非 --strict 下不算失败）` : ''}。`);
process.exitCode = exitCode;
