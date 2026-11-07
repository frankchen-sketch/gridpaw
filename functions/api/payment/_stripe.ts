// Stripe 一次性 Checkout 的零依赖实现（Web 标准 fetch + WebCrypto，无 SDK）
// 契约真源：skill `stripe-checkout-integration`（参数表 §1 / 发货 §2 模式 B / 验签 §3）
// 部署目标：Cloudflare Pages Functions
import type { Env } from '../_lib';

const STRIPE_API = 'https://api.stripe.com';

export interface OrderRow {
  order_no: string;
  product: string;
  provider: string;
  session_id: string;
  status: string;
  email: string;
  amount: number;
  currency: string;
  created_at: number;
  paid_at: number | null;
  webhook_seen: number;
}

/** 订单号：小写字母数字，满足 webhook 侧 `^[a-z0-9]{6,}$` 的保守校验 */
export function newOrderNo(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6).padEnd(4, '0');
  return `gp${t}${r}`;
}

export function priceConfig(env: Env) {
  return {
    amount: Number(env.ADFREE_PRICE_CENTS || '499'),
    currency: (env.ADFREE_CURRENCY || 'usd').toLowerCase(),
    taxCode: env.ADFREE_TAX_CODE || 'txcd_10000000',
    label: env.ADFREE_PRODUCT_LABEL || 'GridPaw Ad-Free (lifetime)',
  };
}

/** 建 hosted Checkout Session。参数顺序与命名照 skill §1，缺一个就 400 或算错钱。 */
export async function createCheckoutSession(
  env: Env,
  opts: { orderNo: string; email?: string; successUrl: string; cancelUrl: string },
): Promise<{ id: string; url: string }> {
  const apiKey = env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('stripe_not_configured');
  const { amount, currency, taxCode, label } = priceConfig(env);

  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('success_url', opts.successUrl);
  body.set('cancel_url', opts.cancelUrl);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', currency);
  body.set('line_items[0][price_data][unit_amount]', String(amount));
  body.set('line_items[0][price_data][product_data][name]', label);
  body.set('line_items[0][price_data][product_data][tax_code]', taxCode);
  // tax_behavior 在 price_data 层，不是 product_data（写错层级 = 400 unknown parameter）
  body.set('line_items[0][price_data][tax_behavior]', 'inclusive');
  // Stripe 当 MoR + 按管辖地算税；含税口径下客户实付 = 标价
  body.set('managed_payments[enabled]', 'true');
  body.set('automatic_tax[enabled]', 'true');
  body.set('invoice_creation[enabled]', 'true');
  body.set('client_reference_id', opts.orderNo);
  body.set('metadata[order_no]', opts.orderNo);
  if (opts.email && /.+@.+\..+/.test(opts.email)) body.set('customer_email', opts.email);

  const res = await fetch(`${STRIPE_API}/v1/checkout/sessions`, {
    method: 'POST',
    headers: {
      authorization: ['Bearer', apiKey].join(' '),
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    let msg = `Checkout session could not be created (${res.status}).`;
    try {
      msg = (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? msg;
    } catch {
      /* 上游返回非 JSON：保留原始文案 */
    }
    console.error(`[stripe] session create ${res.status}: ${text.slice(0, 500)}`);
    throw new Error(msg);
  }
  const session = JSON.parse(text) as { id?: string; url?: string };
  if (!session.id || !session.url) throw new Error('Stripe returned no payment URL.');
  return { id: session.id, url: session.url };
}

/**
 * 反查 session 是否为「已付」。
 * status==='complete' 单独不够：异步支付可能 complete 但 payment_status 仍是 unpaid。
 */
export async function querySession(
  env: Env,
  sessionId: string,
): Promise<{ paid: boolean; email: string; amount: number; currency: string; clientRef: string } | null> {
  const apiKey = env.STRIPE_SECRET_KEY;
  if (!apiKey || !sessionId) return null;
  try {
    const res = await fetch(`${STRIPE_API}/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { authorization: ['Bearer', apiKey].join(' ') },
      signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      console.error(`[stripe] session query ${res.status}: ${text.slice(0, 400)}`);
      return null;
    }
    const s = JSON.parse(text) as {
      status?: string;
      payment_status?: string;
      amount_total?: number;
      currency?: string;
      client_reference_id?: string;
      customer_details?: { email?: string };
      customer_email?: string;
    };
    return {
      paid: s.status === 'complete' && s.payment_status === 'paid',
      email: (s.customer_details?.email || s.customer_email || '').toLowerCase(),
      amount: s.amount_total ?? 0,
      currency: s.currency ?? 'usd',
      clientRef: s.client_reference_id ?? '',
    };
  } catch (e) {
    console.error(`[stripe] session query failed: ${String(e).slice(0, 200)}`);
    return null;
  }
}

/** WebCrypto 验签：HMAC-SHA256 over `${t}.${payload}`，5 分钟重放窗，常量时间比较 */
export async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  if (!sigHeader || !secret) return false;
  const parts = sigHeader.split(',').map((p) => p.trim().split('='));
  const t = parts.find((p) => p[0] === 't')?.[1] ?? '';
  const v1 = parts.find((p) => p[0] === 'v1')?.[1] ?? '';
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

/**
 * 权益 token：`<order_no>.<hmac>`。
 * 前端只存不等价校验（密钥在服务端），服务端将来要核可复算；
 * 用 ENTITLEMENT_SECRET，未配置时退到 OAUTH_STATE_SECRET（同站已有 secret，避免裸奔）。
 */
export async function issueToken(
  env: Env,
  order: Pick<OrderRow, 'order_no' | 'email' | 'paid_at'>,
): Promise<string> {
  const secret = env.ENTITLEMENT_SECRET || env.OAUTH_STATE_SECRET || '';
  if (!secret) return '';
  const raw = `${order.order_no}.${order.email}.${order.paid_at ?? 0}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${order.order_no}.${hex.slice(0, 32)}`;
}

// ---------- D1 ----------

export async function dbCreateOrder(
  env: Env,
  row: { order_no: string; email: string; amount: number; currency: string },
): Promise<void> {
  await env.meowtrail_users
    .prepare(
      `INSERT INTO gp_orders (order_no, product, provider, status, email, amount, currency, created_at)
       VALUES (?, 'adfree', 'stripe', 'pending', ?, ?, ?, ?)`,
    )
    .bind(row.order_no, row.email, row.amount, row.currency, Date.now())
    .run();
}

export async function dbGetOrder(env: Env, orderNo: string): Promise<OrderRow | null> {
  return await env.meowtrail_users
    .prepare('SELECT * FROM gp_orders WHERE order_no = ?')
    .bind(orderNo)
    .first<OrderRow>();
}

export async function dbAttachSession(env: Env, orderNo: string, sessionId: string): Promise<void> {
  await env.meowtrail_users
    .prepare('UPDATE gp_orders SET session_id = ? WHERE order_no = ?')
    .bind(sessionId, orderNo)
    .run();
}

/**
 * 标记已付（幂等）：已 paid 的订单直接返回 false，不发第二次权益。
 * 条件更新 + 受影响行数判据，避免先查后写的竞态。
 */
export async function dbMarkPaid(
  env: Env,
  orderNo: string,
  email: string,
  amount: number,
  currency: string,
): Promise<boolean> {
  const res = await env.meowtrail_users
    .prepare(
      `UPDATE gp_orders
          SET status = 'paid', paid_at = ?, webhook_seen = 1,
              email = CASE WHEN ? <> '' THEN ? ELSE email END,
              amount = CASE WHEN ?> 0 THEN ? ELSE amount END,
              currency = CASE WHEN ? <> '' THEN ? ELSE currency END
        WHERE order_no = ? AND status <> 'paid'`,
    )
    .bind(Date.now(), email, email, amount, amount, currency, currency, orderNo)
    .run();
  return ((res.meta as { changes?: number } | undefined)?.changes ?? 0) > 0;
}

export async function dbFindPaidByEmail(env: Env, email: string): Promise<OrderRow | null> {
  return await env.meowtrail_users
    .prepare("SELECT * FROM gp_orders WHERE email = ? AND status = 'paid' ORDER BY paid_at DESC LIMIT 1")
    .bind(email.toLowerCase())
    .first<OrderRow>();
}

export async function dbTouchWebhook(env: Env, orderNo: string): Promise<void> {
  await env.meowtrail_users
    .prepare('UPDATE gp_orders SET webhook_seen = 1 WHERE order_no = ?')
    .bind(orderNo)
    .run();
}
