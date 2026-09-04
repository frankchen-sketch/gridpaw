import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import path from 'path';

export default defineConfig({
  site: 'https://gridpaw.com',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
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
