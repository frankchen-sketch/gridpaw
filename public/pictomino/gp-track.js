// Pictomino 专用漏斗打点（静态页，过不了 Vite，不能 import src/lib/funnel-track.ts）
// ⚠️ 与 src/lib/funnel-track.ts 保持同构：白名单 / PROD 守卫 / visit 去重逻辑改动要两边同步。
// build id 由 scripts/gen-build-info.mjs 构建期写入 gp-build.js（window.GP_BUILD）。
(function () {
  'use strict';
  var FUNNEL_EVENTS = [
    'visit',
    'game_start', 'first_move', 'level_up', 'level_complete_1', 'level_complete_3',
    'level_complete_5', 'level_complete_10', 'level_complete_20',
    'hint_click', 'hint_blocked', 'puzzle_reset', 'puzzle_skip', 'game_over', 'badge_help_click', 'help_click',
    'daily_start', 'daily_solved', 'daily_challenge_click',
    'share_reddit', 'share_copy', 'share_twitter', 'community_click',
    'sign_in_prompt_shown', 'sign_in_click', 'tool_start', 'tool_action'
  ];
  // 只有生产主域上报；pictomino 若被外站 iframe 跨域嵌入，/api/events 会静默失败（catch 掉）
  var PROD = /(^|\.)gridpaw\.com$/;
  var UTM_SAFE = ['reddit', 'twitter', 'x', 'google', 'bing', 'pinterest', 'facebook', 'hn', 'newsletter'];

  function buildAttribution(search) {
    var p = new URLSearchParams(search);
    var out = {};
    var src = (p.get('utm_source') || '').trim().toLowerCase();
    if (UTM_SAFE.indexOf(src) !== -1) out.utmSource = src;
    if (p.has('utm_campaign')) out.utmCampaignPresent = true;
    return out;
  }
  function referrerHost() {
    if (!document.referrer) return '';
    try { return new URL(document.referrer).host; } catch (e) { return ''; }
  }
  function looksLikeBot() {
    var ua = navigator.userAgent || '';
    return !ua || /bot|crawl|spider|headless|python|curl|wget|monitor/i.test(ua);
  }
  function send(payload) {
    try {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }
  function trackFunnel(eventName, metadata) {
    if (!PROD.test(location.hostname)) return;
    if (FUNNEL_EVENTS.indexOf(eventName) === -1) return;
    var build = (window.GP_BUILD && window.GP_BUILD.id) || '';
    send({ events: [{ eventName: eventName, source: 'web', buildId: build, metadata: metadata || {} }] });
  }
  function trackVisit(path) {
    if (!PROD.test(location.hostname)) return;
    var key = 'gp_visit_logged:' + path;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch (e) { return; }
    var firstSeen = null;
    try { firstSeen = localStorage.getItem('gp_first_visit_at'); } catch (e) {}
    if (!firstSeen) { try { localStorage.setItem('gp_first_visit_at', new Date().toISOString()); } catch (e) {} }
    trackFunnel('visit', {
      path: path,
      referrerHost: referrerHost(),
      attribution: buildAttribution(location.search),
      returning: Boolean(firstSeen),
      ua: (navigator.userAgent || '').slice(0, 200),
      isLikelyBot: looksLikeBot(),
      browserLanguage: navigator.language || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      commitMessage: (window.GP_BUILD && window.GP_BUILD.message) || '',
      committedAt: (window.GP_BUILD && window.GP_BUILD.committedAt) || ''
    });
  }
  window.gpTrack = trackFunnel;
  // game.html 同源路径（/pictomino/game.html）；DOMContentLoaded 前后都安全
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { trackVisit(location.pathname); });
  } else {
    trackVisit(location.pathname);
  }
})();
