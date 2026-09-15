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
import { fileURLToPath } from 'node:url';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const appUrl = process.argv[2] || 'https://gridpaw.com';

function detectKey() {
  const explicit = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : null;
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

// Default payload: the sitemap index. --urls switches to explicit URL list.
const urlsIdx = process.argv.indexOf('--urls');
const urlList = urlsIdx >= 0
  ? process.argv.slice(urlsIdx + 1)
  : [`${appUrl}/sitemap-index.xml`];

if (urlList.length === 0) {
  console.error('IndexNow: --urls given but no URLs after it.');
  process.exit(1);
}

const host = new URL(appUrl).hostname;
console.log(`IndexNow: key from ${source}; submitting ${urlList.length} URL(s) for ${host}`);

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