/**
 * GA4 + Clarity dual-tracking helper
 * 
 * Usage in Astro pages:
 *   <script type="module">
 *     import { track } from '/lib/analytics.js';
 *     track('game_start', { level: 1, difficulty: 'Easy' });
 *   </script>
 * 
 * Or inline (for is:inline scripts):
 *   function track(event, params) { ... }  // copy the function body
 * 
 * 注意：gtag 会把事件参数里的 source/medium/campaign 当作流量归因参数（campaign_details 机制），
 * 覆盖会话来源报表。track() 发给 gtag 前已把这三个键消毒改名（source→trigger、
 * medium→evt_medium、campaign→evt_campaign）；gpTrack(D1) 与 Clarity 仍收原始键名。
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    clarity: (...args: any[]) => void;
    gpTrack?: (event: string, params?: Record<string, unknown>) => void;
  }
}

/**
 * gtag 会把事件参数里的 source/medium/campaign 当作流量归因参数（campaign_details 机制），
 * 覆盖会话来源报表。发给 gtag 前把这三个键改名，避免污染归因；gpTrack(D1) 与 Clarity 仍收原始键名。
 */
function sanitizeForGtag(params?: Record<string, string | number | boolean>): Record<string, string | number | boolean> | undefined {
  if (!params) return params;
  const out: Record<string, string | number | boolean> = {};
  for (const k of Object.keys(params)) {
    if (k === 'source') out['trigger'] = params[k];
    else if (k === 'medium') out['evt_medium'] = params[k];
    else if (k === 'campaign') out['evt_campaign'] = params[k];
    else out[k] = params[k];
  }
  return out;
}

/**
 * Track an event to both GA4 and Microsoft Clarity
 * @param event - Event name (e.g. 'game_start', 'level_up', 'share_copy')
 * @param params - Optional key-value pairs (sent to GA4 as event params, to Clarity as custom properties)
 */
export function track(event: string, params?: Record<string, string | number | boolean>): void {
  // 自建漏斗（版本归因），SEOHead.astro 注入 window.gpTrack
  if (typeof window.gpTrack === 'function') window.gpTrack(event, params || {});

  // GA4（source/medium/campaign 已消毒改名，防污染会话归因）
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, sanitizeForGtag(params));
  }

  // Microsoft Clarity
  if (typeof window.clarity === 'function') {
    window.clarity('event', event);
    if (params) {
      Object.keys(params).forEach(k => {
        window.clarity('set', k, String(params[k]));
      });
    }
  }
}

/**
 * Inline version for use in <script is:inline> blocks
 * Copy this function into your inline script when you can't use ES modules
 */
export const trackInline = `
function track(event, params) {
  if (window.gpTrack) window.gpTrack(event, params || {});
  if (typeof window.gtag === 'function') {
    var gtagParams = {};
    Object.keys(params || {}).forEach(function(k) {
      if (k === 'source') gtagParams['trigger'] = params[k];
      else if (k === 'medium') gtagParams['evt_medium'] = params[k];
      else if (k === 'campaign') gtagParams['evt_campaign'] = params[k];
      else gtagParams[k] = params[k];
    });
    window.gtag('event', event, gtagParams);
  }
  if (typeof window.clarity === 'function') {
    window.clarity('event', event);
    if (params) Object.keys(params).forEach(function(k) { window.clarity('set', k, String(params[k])); });
  }
}
`;
