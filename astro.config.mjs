import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import path from 'path';

// Pages to exclude from sitemap (noindex or thin content)
const excludedPages = [
  '/akari/community/',
  '/akari/levels/easy/',
  '/akari/levels/medium/',
  '/akari/blog/',           // Index page — let sub-pages be indexed individually
  '/akari/privacy/',
  '/akari/akari-puzzle-online/',  // Duplicate — redirects to /akari/akari-puzzle/
];

export default defineConfig({
  site: 'https://gridpaw.com',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => {
        // Exclude noindex pages (exact match, not prefix)
        const exactExcludes = [
          'https://gridpaw.com/akari/community/',
          'https://gridpaw.com/akari/levels/easy/',
          'https://gridpaw.com/akari/levels/medium/',
          'https://gridpaw.com/akari/blog/',        // Index page only
          'https://gridpaw.com/akari/privacy/',
          'https://gridpaw.com/akari/akari-puzzle-online/',
        ];
        if (exactExcludes.includes(page)) {
          return false;
        }
        // Exclude puzzle single pages (70 pages)
        if (page.includes('/akari/puzzle/puzzle-')) {
          return false;
        }
        // Exclude admin pages（否则 /admin/funnel/ 会自动进 sitemap-0.xml → GSC，坑 #9）
        if (page.includes('/admin/')) {
          return false;
        }
        return true;
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@lib': path.resolve('./src/lib'),
      },
    },
  },
});
