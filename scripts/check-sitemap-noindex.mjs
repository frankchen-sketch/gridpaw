#!/usr/bin/env node
/**
 * 闸门：sitemap 与 noindex 必须一致（dist 里对着看，不看源码）。
 *
 * 为什么：`astro.config.mjs` 里的 sitemap 排除清单是手写的，页面的 noindex 也是手写的，
 * 两边一旦不同步就出事——2026-11-21 实测 `/akari/levels/hard/` 被排除出 sitemap，
 * 却没有 noindex：Google 仍可自由收录，但拿不到任何「这是有意藏着」的信号。
 * easy/medium 两个兄弟页都是 noindex，只有 hard 漏了。
 *
 * 两条规则：
 *   1. ERROR：进了 sitemap 的页，HTML 里不能有 noindex（自己打自己）
 *   2. WARN ：既不在 sitemap、也不是 noindex 的页 → 孤儿页（可能是漏加 sitemap，也可能该加 noindex）
 *
 * 用法：node scripts/check-sitemap-noindex.mjs            # dist 已构建
 *       node scripts/check-sitemap-noindex.mjs --strict   # WARN 也当失败
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

const DIST = 'dist';
const strict = process.argv.includes('--strict');

if (!existsSync(DIST)) {
  console.error('✗ 没有 dist，先 build');
  process.exit(2);
}

// 1) 收 sitemap 里的 URL（index + 可能的子 sitemap）
const sitemapUrls = new Set();
function readSitemap(file) {
  const xml = readFileSync(file, 'utf-8');
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    const loc = m[1];
    if (loc.endsWith('.xml')) {
      const p = join(DIST, loc.replace('https://gridpaw.com', ''));
      if (existsSync(p)) readSitemap(p);
    } else {
      sitemapUrls.add(loc.replace(/\/?$/, '/'));
    }
  }
}
for (const f of readdirSync(DIST)) {
  // 子站有自己的 sitemap（pictomino-sitemap.xml），文件名不一定以 sitemap 开头
  if (/sitemap.*\.xml$/.test(f)) readSitemap(join(DIST, f));
}

// 2) 走 dist 里所有 HTML，记下哪些是 noindex
const htmlPages = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) htmlPages.push(p);
  }
}
walk(DIST);

const toUrl = (p) => {
  let rel = relative(DIST, p).replace(/index\.html$/, '');
  if (!rel.endsWith('/')) rel += '/';
  return 'https://gridpaw.com/' + rel.replace(/^\/+/, '');
};

const errors = [];
const orphans = [];
for (const p of htmlPages) {
  // dist 里的 *.html 是重定向壳（legacy 路径 308 到新地址），不是可索引页
  if (p.endsWith('.html') && !p.endsWith('index.html')) continue;
  const html = readFileSync(p, 'utf-8').slice(0, 20000); // head 里就够
  const isNoindex = /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html);
  const url = toUrl(p);
  const inSitemap = sitemapUrls.has(url);
  if (inSitemap && isNoindex) errors.push(`ERROR sitemap 里有它，但页面是 noindex：${url}`);
  if (!inSitemap && !isNoindex) orphans.push(url);
}

console.log(`sitemap ${sitemapUrls.size} 个 URL / dist HTML ${htmlPages.length} 个`);
for (const e of errors) console.log(e);
if (orphans.length) {
  console.log(`WARN  ${orphans.length} 个页既不在 sitemap 也没 noindex（孤儿页）：`);
  for (const u of orphans.slice(0, 20)) console.log('  ' + u);
  if (orphans.length > 20) console.log(`  …还有 ${orphans.length - 20} 个`);
}

if (errors.length || (strict && orphans.length)) {
  console.error(`✗ 不一致：${errors.length} 个 error / ${orphans.length} 个孤儿`);
  process.exit(1);
}
console.log('✓ sitemap 与 noindex 一致');
