// GET /api/geo —— 广告前置闸用（2026-10-22）：返回访问者 IP 的国家码（CF 边缘判断，无 geo IP 库）
// 消费方：AdGate.astro（window.__gpGeoGate）——CN/HK 黑名单 + bot UA 拦截后才注入广告。
// 背景：Adsterra imp 口径被零收入流量污染（10/14-22 HK 133 imp $0 + Iran 47 imp $0.06），
// 拉低分 unit CPM → 11-04 Native 对账「≥$3」判定会失真。在自家站拦：不注入=不发请求=不计 imp。
// ⚠️ fail-open 契约：本接口 5xx/超时/坏 JSON 时客户端默认放行——US 贡献 74% 收入，别在这里改 fail-closed。
// ⚠️ cache-control no-store：响应因 IP 而异，禁止任何层（CDN/浏览器）缓存。
import type { Env } from './_lib';
import { json } from './_lib';

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const cf: any = (request as any).cf ?? {};
  const country = typeof cf.country === 'string' ? cf.country : '';
  return json({ country });
};
