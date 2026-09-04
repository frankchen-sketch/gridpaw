#!/usr/bin/env node
// indexnow-ping.mjs — submit sitemap to IndexNow (Bing/Yandex) after deploy
// Called as: node scripts/indexnow-ping.mjs [app-url] [key]

const appUrl = process.argv[2] || 'https://gridpaw.com';
const key = process.argv[3] || '390e708d7bc94f369a866111e32df9c3';

const sitemapUrl = `${appUrl}/sitemap-index.xml`;

async function main() {
  console.log(`IndexNow: submitting sitemap ${sitemapUrl}`);
  // POST is more reliable than GET for IndexNow
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: new URL(appUrl).hostname,
      key,
      urlList: [sitemapUrl],
    }),
  });
  if (res.ok) {
    console.log(`IndexNow: success (HTTP ${res.status})`);
  } else {
    const body = await res.text().catch(() => '');
    console.error(`IndexNow: failed (HTTP ${res.status}) — ${body}`);
    process.exit(1);
  }
}

main();
