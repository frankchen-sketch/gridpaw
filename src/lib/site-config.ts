// Site-wide analytics & verification IDs
export const siteConfig = {
  // Google Analytics 4
  ga4Id: 'G-4FWP61DJCC',

  // Microsoft Clarity
  clarityId: 'yd0fauosa4',

  // PostHog
  posthogKey: '',

  // Umami 自建已停（2026-11-18：容器 down，数据已 pg_dump 备份到 ~/umami/backups/）。
  // 留空 = 不加载脚本；真人口径改由 pvuv.ai 接手。
  umamiId: '',
  umamiSrc: 'https://umami.gridpaw.com/script.js',

  // Domain (no protocol, no trailing slash)
  domain: 'gridpaw.com',

  // Brand name (used in titles, OG, JSON-LD)
  brandName: 'GridPaw',

  // Google Search Console
  googleVerification: '',

  // Bing Webmaster Tools
  bingVerification: '',
};
