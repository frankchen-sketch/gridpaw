// POST /api/payment/notify/stripe —— webhook（skill §3）
// 纪律：raw body 验签 → 反查 session 确认已付 → 按 order_no 幂等发货。
// 验签失败 fail-closed 返回 404（不暴露端点存在），Stripe 会重试并最终告警；
// 真正的静默吞单是「验签失败还回 200」。
import type { Env } from '../../_lib';
import { dbMarkPaid, dbTouchWebhook, querySession, verifyStripeSignature } from '../_stripe';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const raw = await request.text();
  const sig = request.headers.get('stripe-signature') ?? '';
  const secret = env.STRIPE_SIGNING_SECRET;

  const ok = secret ? await verifyStripeSignature(raw, sig, secret) : false;
  if (!ok) {
    console.error(
      `[stripe-webhook] sig fail ua=${request.headers.get('user-agent')} ` +
        `ip=${request.headers.get('cf-connecting-ip')} len=${raw.length} secret=${secret ? 'set' : 'missing'}`,
    );
    return new Response('Not Found', { status: 404 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } } = {};
  try {
    event = JSON.parse(raw);
  } catch {
    // 已验签但 body 坏了：记日志后 200，别让 Stripe 无意义重试
    console.error('[stripe-webhook] bad json after valid sig');
    return Response.json({ received: true });
  }

  const type = event.type ?? 'unknown';
  const obj = (event.data?.object ?? {}) as Record<string, unknown>;
  const orderNo = String(obj.client_reference_id ?? (obj.metadata as Record<string, unknown>)?.order_no ?? '');
  const sessionId = String(obj.id ?? '');

  if (type === 'checkout.session.completed' && /^[a-z0-9]{6,40}$/i.test(orderNo)) {
    await dbTouchWebhook(env, orderNo).catch(() => {});
    // 不信 event 里的 payment_status，反查一次权威状态（异步支付可能 complete 但未付）
    const s = sessionId ? await querySession(env, sessionId) : null;
    if (s?.paid) {
      const changed = await dbMarkPaid(env, orderNo, s.email, s.amount, s.currency);
      console.log(`[stripe-webhook] order=${orderNo} paid first_time=${changed}`);
    } else {
      console.warn(`[stripe-webhook] order=${orderNo} completed but not paid yet (session=${sessionId})`);
    }
  }

  return Response.json({ received: true });
};
