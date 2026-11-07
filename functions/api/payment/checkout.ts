// POST /api/payment/checkout —— 建单 + 建 Stripe hosted Checkout Session
// 返回 { pay_url, order_no }；页面侧只 location.assign(pay_url)，不自己判支付。
import type { Env } from '../_lib';
import { json } from '../_lib';
import {
  createCheckoutSession,
  dbAttachSession,
  dbCreateOrder,
  newOrderNo,
  priceConfig,
} from './_stripe';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.STRIPE_SECRET_KEY) {
    // 未配 key 时明确说未开通，不假装成功（stub 模式靠这条区分）
    return json({ error: 'stripe_not_configured' }, 503);
  }

  let payload: { email?: string } = {};
  try {
    payload = (await request.json()) as { email?: string };
  } catch {
    /* 空 body 合法：不带邮箱就由 Stripe 收 */
  }

  // 站点不强制登录：邮箱只作为收据与换设备恢复的凭据，不校验归属
  const email = String(payload.email || '').trim().toLowerCase();
  if (email && !/.+@.+\..+/.test(email)) return json({ error: 'bad_email' }, 400);

  const origin = new URL(request.url).origin;
  const orderNo = newOrderNo();
  const { amount, currency } = priceConfig(env);

  await dbCreateOrder(env, { order_no: orderNo, email, amount, currency });

  try {
    // success_url 必须自带 order_no：Stripe 原样返回，不会帮忙拼
    const session = await createCheckoutSession(env, {
      orderNo,
      email,
      successUrl: `${origin}/ad-free/?order_no=${orderNo}`,
      cancelUrl: `${origin}/ad-free/?canceled=1`,
    });
    await dbAttachSession(env, orderNo, session.id);
    return json({ pay_url: session.url, order_no: orderNo });
  } catch (e) {
    const msg = String((e as Error)?.message || e);
    console.error(`[checkout] failed order=${orderNo}: ${msg}`);
    return json({ error: 'checkout_failed', detail: msg.slice(0, 200) }, 502);
  }
};
