#!/usr/bin/env node
// indexnow-ping.mjs — submit sitemap URLs to IndexNow (Bing/Naver/Yandex) after deploy
//
// Usage:
//   node scripts/indexnow-ping.mjs [app-url] [key]
//   node scripts/indexnow-ping.mjs [app-url] --urls https://gridpaw.com/a/ https://gridpaw.com/b/
//
// The key is NEVER hardcoded. Resolution order:
//   1. explicit argv[3]
//   2. env INDEXNOW_KEY
//   3. auto-detect from public/*.txt — the IndexNow key file is named after the key
//      and contains the key (that is the protocol's own verification mechanism),
//      so basename == content identifies it unambiguously.
//
// Why not hardcode: this repo is public. A hardcoded key lets anyone submit URLs
// as this domain. The key FILE must be publicly fetchable (protocol requirement),
// but that is not a reason to also publish it in source control.

import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const argv = process.argv.slice(2);
const isUrl = (s) => /^https?:\/\//.test(s || '');
// argv[0] 是可选的站点根，argv[1] 是可选 key；两者都必须先过掉 --urls 这类开关，
// 否则 `--urls` 会被当成 appUrl（2026-11-05 实测 ERR_INVALID_URL）。
const appUrl = isUrl(argv[0]) ? argv[0] : 'https://gridpaw.com';
// IndexNow keys are hex-ish identifiers (32 chars for the one we ship). Anything
// else in argv[1] is a flag *value* — `--from-git HEAD~1` previously matched the
// old "not a URL, doesn't start with --" test and got sent as the key.
const KEY_RE = /^[A-Za-z0-9_-]{8,128}$/;
// Values that follow a flag are not keys either: `--from-git main` is a ref, and a
// ref like "main" or "abc123" would otherwise satisfy KEY_RE.
const fromGitRaw = (() => {
  const i = process.argv.indexOf('--from-git');
  return i >= 0 ? process.argv[i + 1] : null;
})();
const explicitKey = argv[1] && KEY_RE.test(argv[1]) && argv[1] !== fromGitRaw ? argv[1] : null;

function detectKey() {
  const explicit = explicitKey;
  if (explicit) return { key: explicit, source: 'argv' };
  if (process.env.INDEXNOW_KEY) return { key: process.env.INDEXNOW_KEY, source: 'env INDEXNOW_KEY' };

  const dir = join(repoRoot, 'public');
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.txt')) continue;
    const body = readFileSync(join(dir, f), 'utf8').trim();
    if (body && body === basename(f, '.txt')) return { key: body, source: `public/${f}` };
  }
  return { key: null, source: null };
}

const { key, source } = detectKey();
if (!key) {
  console.error('IndexNow: no key found. Pass it as argv[3], set INDEXNOW_KEY, '
    + 'or place public/<key>.txt containing <key>.');
  process.exit(1);
}

// Derive the list of pages whose content actually changed between <ref> and HEAD.
// Why: the default sitemap-index payload only tells Bing "something on the site
// moved", which is nearly useless — IndexNow exists to say *which* URL changed so
// the crawler refetches that one. But we must stay honest: a change to a shared
// component (HelpArticle, GameNav, SolverTiles, engine libs) affects an unknown
// number of pages, so in that case we also submit the sitemap index and let the
// crawler sort it out.
function urlsFromGit(ref) {
  let changed;
  try {
    changed = execSync(`git diff --name-only ${ref} HEAD`, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim().split('\n').filter(Boolean);
  } catch {
    console.warn(`IndexNow: git diff against ${ref} failed; falling back to sitemap index.`);
    return [`${appUrl}/sitemap-index.xml`];
  }

  const urls = new Set();
  let sharedChanged = false;

  for (const f of changed) {
    if (f.startsWith('src/pages/') && f.endsWith('.astro')) {
      if (f.includes('[')) {
        // Dynamic route ([slug], [id], [level]): the concrete URLs aren't in the
        // diff, so treat it like a shared change.
        sharedChanged = true;
        continue;
      }
      let p = f.slice('src/pages'.length).replace(/\.astro$/, '');
      if (p === '/index' || p === '') p = '/';
      else if (p.endsWith('/index')) p = p.slice(0, -'/index'.length);
      if (!p.startsWith('/')) p = `/${p}`;
      if (!p.endsWith('/')) p = `${p}/`;
      urls.add(`${appUrl}${p}`);
    } else if (f.startsWith('public/') && f.endsWith('.html')) {
      // public/ 下的 HTML 被原样拷进 dist，URL 就是文件路径本身——这类页面
      // 不在 src/pages 里，早先版本完全漏判（2026-11-17 实测：改
      // public/pictomino/index.html 后 IndexNow 报 "no page-level changes"）。
      // index.html 收敛成目录 URL（/pictomino/），其余保留 .html 后缀。
      // noindex 页不进 IndexNow：提交它们只浪费抓取配额。
      let body = '';
      try {
        body = readFileSync(join(repoRoot, f), 'utf8');
      } catch {
        continue; // 已删除的文件等
      }
      if (/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(body)) continue;
      let p = f.slice('public'.length);
      if (p.endsWith('/index.html')) p = p.slice(0, -'index.html'.length);
      urls.add(`${appUrl}${p}`);
    } else if (/^src\/(components|layouts|lib)\//.test(f)) {
      sharedChanged = true;
    }
  }

  if (sharedChanged) urls.add(`${appUrl}/sitemap-index.xml`);
  if (urls.size === 0) {
    console.warn(`IndexNow: no page-level changes since ${ref}; falling back to sitemap index.`);
    return [`${appUrl}/sitemap-index.xml`];
  }
  return [...urls];
}

// Default payload: the sitemap index. --urls switches to explicit URL list.
// --from-git derives the changed pages from git instead (see urlsFromGit).
const urlsIdx = process.argv.indexOf('--urls');
const fromGitIdx = process.argv.indexOf('--from-git');
const fromGitRef = fromGitIdx >= 0 ? (process.argv[fromGitIdx + 1] || 'HEAD~1') : null;
const urlList = urlsIdx >= 0
  ? process.argv.slice(urlsIdx + 1)
  : fromGitRef
    ? urlsFromGit(fromGitRef)
    : [`${appUrl}/sitemap-index.xml`];

if (urlList.length === 0) {
  console.error('IndexNow: --urls given but no URLs after it.');
  process.exit(1);
}

const host = new URL(appUrl).hostname;
console.log(`IndexNow: key from ${source}; submitting ${urlList.length} URL(s) for ${host}`);
for (const u of urlList) console.log(`  · ${u}`);

if (process.argv.includes('--dry-run')) {
  console.log('IndexNow: dry run — no request sent.');
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `${appUrl}/${key}.txt`,
    urlList,
  }),
});

if (res.ok) {
  console.log(`IndexNow: success (HTTP ${res.status})`);
} else {
  const body = await res.text().catch(() => '');
  console.error(`IndexNow: failed (HTTP ${res.status}) — ${body}`);
  process.exit(1);
}