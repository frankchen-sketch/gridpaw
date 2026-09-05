import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const indexPath = resolve('dist/sitemap-index.xml');
let xml = readFileSync(indexPath, 'utf-8');

// Add pictomino sitemap if not already present
const pictominoEntry = '  <sitemap>\n    <loc>https://gridpaw.com/pictomino-sitemap.xml</loc>\n    <lastmod>' + new Date().toISOString() + '</lastmod>\n  </sitemap>';

if (!xml.includes('pictomino-sitemap.xml')) {
  xml = xml.replace('</sitemapindex>', pictominoEntry + '\n</sitemapindex>');
  writeFileSync(indexPath, xml);
  console.log('[fix-sitemap] Added pictomino-sitemap.xml to sitemap-index.xml');
} else {
  console.log('[fix-sitemap] pictomino-sitemap.xml already in index, skipping');
}
