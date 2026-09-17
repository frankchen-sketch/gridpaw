// POST /api/events —— 自建漏斗事件采集（见 GRIDPAW-FUNNEL-VERSIONING.md §3.5）
// 链路：开关 → 体积上限 → session 解析 → guest id 签发 → 白名单/限额 → 落库 → visit 时注册版本 → Set-Cookie
import type { Env } from './_lib';
import { json, getCookie, verifySessionValue } from './_lib';
import { isFunnelEvent, GUEST_COOKIE } from './_funnel-sql';

const MAX_BODY = 32 * 1024;      // 单请求 32KB（furriq 同款）
const MAX_EVENTS = 5;            // 单请求最多 5 条
const MAX_META = 4096;           // 单条 metadata 上限

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // 开关未开 → 静默 200（furriq 同策略：客户端无需感知）
  if ((env.FUNNEL_EVENT_INGESTION_ENABLED ?? 'false') !== 'true') return json({ ok: true });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: 'too_large' }, 413);

  // 登录用户：mt_session 解 uid；未登录 user_id 为空串
  const sid = getCookie(request, 'mt_session');
  const userId = sid ? (await verifySessionValue(env.OAUTH_STATE_SECRET, sid)) ?? '' : '';

  // 访客 id：无 cookie 则签发新 gp_gid（HttpOnly，1 年）
  let guestId = getCookie(request, GUEST_COOKIE) ?? '';
  const isNewGuest = !guestId;
  if (isNewGuest) guestId = crypto.randomUUID();

  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ error: 'bad_json' }, 400); }
  const list = Array.isArray(body?.events) ? body.events.slice(0, MAX_EVENTS) : [body];

  const now = Date.now();
  const insert = env.meowtrail_users.prepare(
    `INSERT INTO gp_event (id, user_id, guest_id, event_name, source, build_id, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const registerBuild = env.meowtrail_users.prepare(
    `INSERT OR IGNORE INTO gp_build (build_id, commit_message, committed_at, first_seen_at)
     VALUES (?, ?, ?, ?)`
  );
  const batch = [];
  for (const e of list) {
    const name = typeof e?.eventName === 'string' ? e.eventName : '';
    // 白名单外直接 400，不静默丢（静默丢会让新增埋点看起来「没数据」）
    if (!isFunnelEvent(name)) return json({ error: 'unsupported_event' }, 400);
    const meta = e?.metadata && typeof e.metadata === 'object' ? e.metadata : null;
    if (meta && JSON.stringify(meta).length > MAX_META) return json({ error: 'metadata_too_large' }, 400);
    // buildId 只做长度/来源校验 —— 版本归属由客户端上报（wrangler 直传 dist，平台无 commit 变量可注入）
    const buildId = typeof e?.buildId === 'string' ? e.buildId.slice(0, 64) : '';
    batch.push(insert.bind(
      crypto.randomUUID(), userId, guestId, name,
      typeof e?.source === 'string' ? e.source.slice(0, 40) : 'web',
      buildId || null, meta ? JSON.stringify(meta) : null, now
    ));
    if (name === 'visit' && buildId) {
      // 版本注册：只在首次 visit 时发生；INSERT OR IGNORE 天生幂等、并发安全
      batch.push(registerBuild.bind(
        buildId,
        String(e?.commitMessage ?? '').slice(0, 160),
        String(e?.committedAt ?? '').slice(0, 40),
        new Date(now).toISOString()
      ));
    }
  }
  if (batch.length) await env.meowtrail_users.batch(batch);

  return json({ ok: true }, 200, isNewGuest
    ? { 'Set-Cookie': `${GUEST_COOKIE}=${guestId}; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly` }
    : {});
};
