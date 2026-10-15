import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import path from 'path';

// Sitemap exclusions live INSIDE the sitemap() filter below (exactExcludes) —
// the old top-level `excludedPages` array was dead code and was removed
// (adsense audit 2026-10: it silently didn't apply, hard/reset-password stayed in sitemap)

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
          'https://gridpaw.com/privacy/',           // noindex page (jev-seo audit 2026-10)
          'https://gridpaw.com/reset-password/',    // noindex functional page (adsense audit 2026-10)
          'https://gridpaw.com/akari/levels/hard/', // thin content, same as easy/medium
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
