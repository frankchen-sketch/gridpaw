// 自建漏斗客户端打点（GRIDPAW-FUNNEL-VERSIONING.md §3.4）
// 由 SEOHead.astro 的 Vite 打包脚本引入（非 is:inline，可以正常 import）：
//   window.gpTrack = trackFunnel;  trackVisit(location.pathname);
// 游戏页的内联 track() 只需追加一行 window.gpTrack?.(event, params)。
import { APP_BUILD } from './app-build.generated';

// 白名单 = 现有埋点名（§1.4 实测清单）+ visit。新增业务事件时先加到这里（以及
// functions/api/_funnel-sql.ts）再加埋点，顺序错了会 400 而不是静默丢弃。
export const FUNNEL_EVENTS = [
  'visit',
  'game_start', 'first_move', 'level_up', 'level_complete_1', 'level_complete_3',
  'level_complete_5', 'level_complete_10', 'level_complete_20',
  'hint_click', 'hint_blocked', 'puzzle_reset', 'puzzle_skip', 'game_over',
  'daily_start', 'daily_solved', 'daily_challenge_click',
  'share_reddit', 'share_copy', 'share_twitter', 'community_click',
  'sign_in_prompt_shown', 'sign_in_click', 'tool_start', 'tool_action',
];

// 只有生产域上报（与本仓库既有铁律一致：dev/预览域静默，避免污染）
const PROD = /(^|\.)gridpaw\.com$/;
const UTM_SAFE = ['reddit', 'twitter', 'x', 'google', 'bing', 'pinterest', 'facebook', 'hn', 'newsletter'];

export function buildAttribution(search: string): Record<string, string | boolean> {
  const p = new URLSearchParams(search);
  const out: Record<string, string | boolean> = {};
  const src = (p.get('utm_source') || '').trim().toLowerCase();
  if (UTM_SAFE.indexOf(src) !== -1) out.utmSource = src;   // 白名单防注入（furriq 同策略）
  if (p.has('utm_campaign')) out.utmCampaignPresent = true;
  return out;
}

export function referrerHost(): string {
  if (!document.referrer) return '';
  try { return new URL(document.referrer).host; } catch { return ''; }
}

// 轻度 bot 标记：gridpaw 约一半会话来自机房（STATUS.md），先记后滤
function looksLikeBot(): boolean {
  const ua = navigator.userAgent || '';
  return !ua || /bot|crawl|spider|headless|python|curl|wget|monitor/i.test(ua);
}

function send(payload: unknown): void {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

export function trackFunnel(eventName: string, metadata: Record<string, unknown> = {}): void {
  if (!PROD.test(location.hostname)) return;
  if (FUNNEL_EVENTS.indexOf(eventName) === -1) return;
  send({ events: [{ eventName, source: 'web', buildId: APP_BUILD.id, metadata }] });
}

// 每页每会话一条 visit；归因原料必须齐（utmSource + referrerHost），
// 否则三级兜底退化成 organic/direct，P1 流量注脚失去解释力（坑 #5）
export function trackVisit(path: string): void {
  if (!PROD.test(location.hostname)) return;
  const key = 'gp_visit_logged:' + path;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  const firstSeen = localStorage.getItem('gp_first_visit_at');
  if (!firstSeen) localStorage.setItem('gp_first_visit_at', new Date().toISOString());
  trackFunnel('visit', {
    path,
    referrerHost: referrerHost(),
    attribution: buildAttribution(location.search),  // 键名固定 attribution，跨站 SQL 才可复用
    returning: Boolean(firstSeen),
    ua: navigator.userAgent.slice(0, 200),
    isLikelyBot: looksLikeBot(),
    browserLanguage: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    commitMessage: APP_BUILD.message,                // 服务端无平台 commit 变量，随客户端一并发（§1.3 决策 2）
    committedAt: APP_BUILD.committedAt,
  });
}
