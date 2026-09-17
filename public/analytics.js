/* GridPaw 分析加载器（供 public/pictomino/ 下的纯静态 HTML 使用）
 *
 * 口径铁律：只有生产域名（gridpaw.com / www.gridpaw.com）上报。
 * localhost、127.0.0.1、局域网 IP、*.pages.dev 预览域一律静默。
 * 原因：自测 / 预览部署流量会混进 GA4（2026-09 实测污染约 9%，见 STATUS.md §一）。
 *
 * 静默分支保留同名 no-op，页面里的 track() / gtag() / clarity() 调用不会抛错。
 * ID 与 src/lib/site-config.ts 保持一致 —— 改 ID 时两处都要改。
 */
(function () {
  var GA4_ID = 'G-4FWP61DJCC';
  var CLARITY_ID = 'yd0fauosa4';
  var host = location.hostname;

  if (!/(^|\.)gridpaw\.com$/.test(host)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {};
    window.clarity = function () {};
    if (!window.posthog) {
      window.posthog = { capture: function () {}, init: function () {} };
    }
    return;
  }

  // Google Analytics 4
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA4_ID);
  var g = document.createElement('script');
  g.async = true;
  g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
  document.head.appendChild(g);

  // Microsoft Clarity
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);
})();
