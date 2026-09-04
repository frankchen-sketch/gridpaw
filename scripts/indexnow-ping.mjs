#!/usr/bin/env node
// indexnow-ping.mjs — submit sitemap to IndexNow (Bing/Naver) after deploy
// GridPaw IndexNow — gridpaw.com key
// Called as: node scripts/indexnow-ping.mjs [app-url] [key]

const appUrl = process.argv[2] || 'https://gridpaw.com';
const key = process.argv[3] || '60e0229839b33db7ea1726c1fd99abf7';

const sitemapUrl = `${appUrl}/sitemap-index.xml`;
const indexNowUrl = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(sitemapUrl)}&key=${key}`;

async function main() {
  console.log(`IndexNow: submitting sitemap ${sitemapUrl}`);
  const res = await fetch(indexNowUrl, { method: 'GET' });
  if (res.ok) {
    console.log(`IndexNow: success (HTTP ${res.status})`);
  } else {
    const body = await res.text().catch(() => '');
    console.error(`IndexNow: failed (HTTP ${res.status}) — ${body}`);
    process.exit(1);
  }
}

main();
