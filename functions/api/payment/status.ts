// GET /api/payment/status?order_no= —— 发货权威之一（skill §2 模式 B）
// 已付 → 签发权益 token；未付 → 反查 Stripe 一次，仍不付则 pending。
// 页面侧唯一判断依据就是这里，URL 上的 ?paid=1 一律不信。
import type { Env } from '../_lib';
import { json } from '../_lib';
import { dbGetOrder, dbMarkPaid, issueToken, querySession } from './_stripe';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const params = new URL(request.url).searchParams;
  const orderNo = (params.get('order_no') || '').trim();
  if (!/^[a-z0-9]{6,40}$/i.test(orderNo)) return json({ error: 'bad_order' }, 400);

  const order = await dbGetOrder(env, orderNo);
  if (!order) return json({ status: 'not_found' }, 404);
  if (order.status === 'refunded') return json({ status: 'refunded' });
  if (order.status === 'paid') {
    return json({ status: 'paid', token: await issueToken(env, order), email: order.email });
  }

  // 未标记已付：反查 Stripe（用户关掉成功页时，靠这条 + webhook 双路兜底）
  if (order.session_id) {
    const s = await querySession(env, order.session_id);
    if (s?.paid) {
      await dbMarkPaid(env, orderNo, s.email || order.email, s.amount, s.currency);
      const fresh = await dbGetOrder(env, orderNo);
      if (fresh) {
        return json({ status: 'paid', token: await issueToken(env, fresh), email: fresh.email });
      }
    }
  }

  return json({ status: 'pending' });
};
