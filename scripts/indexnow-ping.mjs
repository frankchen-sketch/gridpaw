#!/usr/bin/env node
/**
 * IndexNow Ping — submit sitemap to IndexNow (Bing/Naver/Yandex)
 * 
 * Usage:
 *   node indexnow-ping.mjs <domain> [--key <indexnow-key>]
 * 
 * Examples:
 *   node indexnow-ping.mjs spatialreasoninggame.com
 *   node indexnow-ping.mjs meowtrail.org --key ddb0a2c09ebf4ddb845f69e358e80c1b
 * 
 * IndexNow keys are per-domain. Generate at https://www.bing.com/indexnow
 */

const args = process.argv.slice(2);
const domain = args[0];
if (!domain) {
  console.error('Usage: node indexnow-ping.mjs <domain> [--key <key>]');
  process.exit(1);
}

// Parse --key flag
let key = null;
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--key' && args[i + 1]) {
    key = args[i + 1];
    break;
  }
}

// Default key (replace with your own per-domain key)
if (!key) {
  console.warn('Warning: No --key provided. Using default key. Generate your own at https://www.bing.com/indexnow');
  key = 'YOUR_INDEXNOW_KEY';
}

const sitemapUrl = `https://${domain}/sitemap.xml`;
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
