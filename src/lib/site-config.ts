// Site-wide analytics & verification IDs
export const siteConfig = {
  // Google Analytics 4
  ga4Id: 'G-4FWP61DJCC',

  // Microsoft Clarity
  clarityId: 'yd0fauosa4',

  // PostHog
  posthogKey: '',

  // Umami 自建（mini Docker → CF Tunnel）。只有生产域加载。
  umamiId: '10832c00-4697-4573-adf1-bb961f26ab13', // gridpaw.com 的 website id
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
