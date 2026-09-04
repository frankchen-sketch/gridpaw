import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const pages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/akari/', changefreq: 'weekly', priority: '0.9' },
    { url: '/daily/', changefreq: 'daily', priority: '0.9' },
    { url: '/rules/', changefreq: 'monthly', priority: '0.6' },
    { url: '/tips/', changefreq: 'monthly', priority: '0.6' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>https://gridpaw.com${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
