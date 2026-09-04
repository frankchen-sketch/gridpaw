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
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    clarity: (...args: any[]) => void;
  }
}

/**
 * Track an event to both GA4 and Microsoft Clarity
 * @param event - Event name (e.g. 'game_start', 'level_up', 'share_copy')
 * @param params - Optional key-value pairs (sent to GA4 as event params, to Clarity as custom properties)
 */
export function track(event: string, params?: Record<string, string | number | boolean>): void {
  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params || {});
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
  if (typeof window.gtag === 'function') window.gtag('event', event, params || {});
  if (typeof window.clarity === 'function') {
    window.clarity('event', event);
    if (params) Object.keys(params).forEach(function(k) { window.clarity('set', k, String(params[k])); });
  }
}
`;
