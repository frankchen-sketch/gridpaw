-- 去广告一次性购买（Stripe hosted Checkout）
-- 契约见 skill `stripe-checkout-integration` §2 模式 B：webhook 与 status 反查都发货，
-- 靠 order_no 主键 + status='paid' 判据做幂等，重复投递不重复发权益。

CREATE TABLE IF NOT EXISTS gp_orders (
  order_no   TEXT PRIMARY KEY,
  product    TEXT NOT NULL DEFAULT 'adfree',
  provider   TEXT NOT NULL DEFAULT 'stripe',
  session_id TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | refunded | expired
  email      TEXT NOT NULL DEFAULT '',
  amount     INTEGER NOT NULL DEFAULT 0,       -- 分
  currency   TEXT NOT NULL DEFAULT 'usd',
  created_at INTEGER NOT NULL,
  paid_at    INTEGER,
  webhook_seen INTEGER NOT NULL DEFAULT 0
);

-- 凭邮箱恢复权益：按邮箱查最近一笔已付订单
CREATE INDEX IF NOT EXISTS idx_gp_orders_email_status ON gp_orders (email, status, paid_at);
-- 反查 Stripe session（status 端点 / 对账脚本）
CREATE INDEX IF NOT EXISTS idx_gp_orders_session ON gp_orders (session_id);
