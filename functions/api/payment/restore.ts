// POST /api/payment/restore { email } —— 凭邮箱恢复权益（换设备/清缓存后）
// 口径：只认「该邮箱存在已付订单」，命中才签发 token。
// 没有账号体系时这是弱验证（知道别人邮箱即可解锁），但权益价值 = 一次性 $5 去广告，
// 不引入密码/邮件验证码是刻意的取舍；若要收紧，加一次性邮件验证码即可，接口形状不变。
import type { Env } from '../_lib';
import { json } from '../_lib';
import { dbFindPaidByEmail, issueToken } from './_stripe';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let payload: { email?: string } = {};
  try {
    payload = (await request.json()) as { email?: string };
  } catch {
    return json({ error: 'bad_body' }, 400);
  }
  const email = String(payload.email || '').trim().toLowerCase();
  if (!/.+@.+\..+/.test(email)) return json({ error: 'bad_email' }, 400);

  const order = await dbFindPaidByEmail(env, email);
  if (!order) return json({ status: 'not_found' }, 404);

  return json({
    status: 'paid',
    token: await issueToken(env, order),
    order_no: order.order_no,
    paid_at: order.paid_at,
  });
};
