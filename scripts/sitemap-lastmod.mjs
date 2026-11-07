#!/usr/bin/env node
/**
 * sitemap-lastmod.mjs — 把 dist/sitemap-0.xml 的 <lastmod> 换成真实内容日期。
 *
 * 背景：@astrojs/sitemap 的 lastmod 默认取构建时间，全站 URL 同一个时间戳 →
 * 等于告诉 Google「每次部署全站都更新了」，是假信号（2026-11-05 竞品侦察实测：
 * 对手是逐页真实日期，7/30/90 天分布各不相同）。
 *
 * 做法：git log 拉一次「文件 → 最近提交时间」映射，再把每个 URL 映射回
 * 它的源文件（含动态路由 [param].astro），页面若 import 了 src/data/* 数据文件，
 * 取两者中较新的那个。找不到源文件的 URL 直接删掉 <lastmod>（宁缺勿假）。
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, relative, join } from 'path';

const ROOT = resolve('.');
const SITEMAP = resolve('dist/sitemap-0.xml');

// ── 1. 文件 → 最近提交时间 ────────────────────────────────────────────
const fileDate = new Map();
try {
  const log = execSync(
    "git log --pretty=format:__C__%cI --name-only -- src public functions",
    { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, encoding: 'utf-8' }
  );
  let cur = null;
  for (const line of log.split('\n')) {
    if (line.startsWith('__C__')) {
      cur = line.slice(5).trim();
    } else if (line.trim() && cur && !fileDate.has(line.trim())) {
      fileDate.set(line.trim(), cur); // 第一次出现 = 最新提交
    }
  }
} catch (e) {
  console.warn('[sitemap-lastmod] git log 失败，全部 lastmod 将删除:', e.message);
}

// ── 2. 源文件 → 路由正则 ─────────────────────────────────────────────
const pageFiles = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(astro|md|mdx)$/.test(name)) pageFiles.push(relative(ROOT, p));
  }
}
try { walk(resolve('src/pages')); } catch { /* no pages dir */ }

function toRoute(file) {
  let r = file.replace(/^src\/pages\//, '').replace(/\.(astro|md|mdx)$/, '');
  r = r.replace(/\/index$/, '');
  if (r === 'index') r = '';
  // 动态段 [x] → 匹配一段；[...x] → 匹配多段
  r = r.replace(/\[\.\.\.[^\]]+\]/g, '___REST___').replace(/\[[^\]]+\]/g, '___ONE___');
  const esc = r.replace(/[.*+?^${}()|\\]/g, '\\$&');
  const re = '^/' + esc.replace(/___REST___/g, '.*').replace(/___ONE___/g, '[^/]+') + '/?$';
  return new RegExp(re);
}

// ── 3. 页面 import 的数据文件 ────────────────────────────────────────
function dataImports(file) {
  try {
    const src = readFileSync(resolve(ROOT, file), 'utf-8');
    const out = [];
    const re = /(?:from\s*|import\s*)['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(src))) {
      const spec = m[1];
      if (!spec.startsWith('.')) continue;
      let p = resolve(ROOT, file, '..', spec);
      for (const cand of [p, p + '.json', p + '.ts', p + '.js', p + '/index.ts', p + '/index.js']) {
        try {
          if (statSync(cand).isFile()) { p = cand; break; }
        } catch { /* keep trying */ }
      }
      const rel = relative(ROOT, p);
      if (/^src\/data\//.test(rel)) out.push(rel);
    }
    return out;
  } catch {
    return [];
  }
}

const routeMatchers = pageFiles.map((f) => ({ file: f, re: toRoute(f) }));

/** 静态路由（无动态段）直接比对；动态路由走正则 */
function staticRoute(file) {
  let r = file.replace(/^src\/pages\//, '').replace(/\.(astro|md|mdx)$/, '').replace(/\/index$/, '');
  if (r.includes('[')) return null;
  if (r === 'index') r = '';
  return '/' + (r ? r + '/' : '');
}
const staticMap = new Map();
for (const f of pageFiles) {
  const s = staticRoute(f);
  if (s) staticMap.set(s, f);
}

const dataCache = new Map();

function bestDate(url) {
  const path = url.replace(/^https?:\/\/[^/]+/, '').replace(/\/?$/, '/');
  let files = [];
  const exact = staticMap.get(path);
  if (exact) files = [exact];
  else files = routeMatchers.filter((m) => m.re.test(path)).map((m) => m.file).slice(0, 4);
  let best = null;
  for (const f of files) {
    const ds = [fileDate.get(f), ...dataImportsCached(f).map((d) => fileDate.get(d))].filter(Boolean);
    for (const d of ds) if (!best || new Date(d) > new Date(best)) best = d;
  }
  return best;
}
function dataImportsCached(f) {
  if (!dataCache.has(f)) dataCache.set(f, dataImports(f));
  return dataCache.get(f);
}

// ── 4. 改写 sitemap ─────────────────────────────────────────────────
let xml;
try {
  xml = readFileSync(SITEMAP, 'utf-8');
} catch {
  console.log('[sitemap-lastmod] 没有 dist/sitemap-0.xml，跳过');
  process.exit(0);
}

const seen = new Map();
let replaced = 0, dropped = 0;
xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (whole, inner) => {
  const loc = (inner.match(/<loc>([^<]+)<\/loc>/) || [])[1];
  if (!loc) return whole;
  const body = inner.replace(/<lastmod>[^<]*<\/lastmod>/g, '');
  const d = bestDate(loc);
  if (!d) {
    dropped++;
    return '<url>' + body + '</url>';
  }
  const iso = new Date(d).toISOString();
  seen.set(loc, iso);
  replaced++;
  // Astro 不再输出 lastmod，所以是「插入」不是「替换」：紧跟 </loc> 之后
  return '<url>' + body.replace('</loc>', `</loc>\n    <lastmod>${iso}</lastmod>`) + '</url>';
});

writeFileSync(SITEMAP, xml);

// 索引里的 lastmod 用全站最大值
const dates = [...new Set(seen.values())].sort();
if (dates.length) {
  try {
    const idxPath = resolve('dist/sitemap-index.xml');
    let idx = readFileSync(idxPath, 'utf-8');
    idx = idx.replace(/(<loc>[^<]*sitemap-0\.xml<\/loc>\s*)<lastmod>[^<]*<\/lastmod>/, `$1<lastmod>${dates[dates.length - 1]}</lastmod>`);
    writeFileSync(idxPath, idx);
  } catch { /* index 可能不存在 */ }
}

const buckets = { '7d': 0, '30d': 0, '90d': 0, older: 0 };
const now = Date.now();
for (const iso of seen.values()) {
  const days = (now - new Date(iso).getTime()) / 86400000;
  if (days <= 7) buckets['7d']++;
  else if (days <= 30) buckets['30d']++;
  else if (days <= 90) buckets['90d']++;
  else buckets.older++;
}
console.log(`[sitemap-lastmod] 真实 lastmod ${replaced} 条 / 无源文件删除 ${dropped} 条 | 7天 ${buckets['7d']} · 30天 ${buckets['30d']} · 90天 ${buckets['90d']} · 更早 ${buckets.older}`);
console.log(`[sitemap-lastmod] 不同日期值 ${dates.length} 个（旧版全站同一个构建时间戳）`);
