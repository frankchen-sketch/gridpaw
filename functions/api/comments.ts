// 侦探留言墙 API（设计稿 gridpaw-badges-comments.html ④C/⑤）
// GET  /api/comments?game=murdoku[&anonId=] —— 已审核评论 + gp_event 派生自动行 + Turnstile siteKey
// POST /api/comments —— 三层闸门（缺一不可）：
//   ① 访客键近 7 天 gp_event 有 level_up / game_over（复用 /api/badges 的访客键口径）
//   ② Cloudflare Turnstile siteverify 服务端二次校验（/api/events 是公开接口，level_up 可伪造）
//   ③ 同一访客 24h ≤2 条 + IP 维度限频（24h ≤8 条）
// 全部落库 status='pending'（上线首月先审后显），审核走 /admin/comments?token=。
// 不做：注册墙、回复嵌套、Markdown、编辑。
import type { Env } from './_lib';
import { json, getCookie, verifySessionValue } from './_lib';
import { GUEST_COOKIE } from './_funnel-sql';
import { LEVEL_EVENTS, deriveBadges, topBadges, type EventRow } from './_badges-derive';

const GAMES = ['murdoku', 'shikaku'];
const MAX_TEXT = 500;
const MIN_TEXT = 2;
const VISITOR_LIMIT_24H = 2;   // 同一访客 24h 最多 2 条（含 pending）
const IP_LIMIT_24H = 8;        // 同一 IP 24h 最多 8 条
const PLAY_WINDOW_MS = 7 * 86400000;
const WALL_LIMIT = 20;         // 展示的已审核评论上限
const AUTO_LIMIT = 12;         // 自动行上限

// 匿名侦探名：visitor_key 哈希映射（确定性——同一访客永远同名，不收集任何 PII）
const NAMES = ['Miko', 'Kenji', 'Yuki', 'Sora', 'Mochi', 'Hana', 'Taro', 'Nori', 'Kuro', 'Mei', 'Riku', 'Aki', 'Miso', 'Koda', 'Nami', 'Yori'];
function pseudonym(key: string): { name: string; initial: string } {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const name = NAMES[Math.abs(h) % NAMES.length];
  return { name, initial: name.charAt(0) };
}

// 访客键：与 badges.ts 同口径（uid || gp_gid cookie || ?anonId 收紧格式）
async function visitorKey(request: Request, env: Env, bodyAnonId?: unknown): Promise<{ uid: string; gid: string; key: string }> {
  const sid = getCookie(request, 'mt_session');
  const uid = sid ? (await verifySessionValue(env.OAUTH_STATE_SECRET, sid)) ?? '' : '';
  let gid = getCookie(request, GUEST_COOKIE) ?? '';
  if (!gid && typeof bodyAnonId === 'string' && /^anon-[0-9a-fA-F-]{6,70}$/.test(bodyAnonId)) {
    gid = bodyAnonId;
  }
  return { uid, gid, key: uid || gid };
}

// 事件行归属条件：登录用户 uid 的事件 + 同键 guest 时期事件；纯访客按 guest_id
function visitorWhere(idx: number, uid: string, gid: string): { where: string; args: string[] } {
  if (uid && gid) return { where: `(user_id = ?${idx} OR (user_id = '' AND guest_id = ?${idx + 1}))`, args: [uid, gid] };
  if (uid) return { where: `user_id = ?${idx}`, args: [uid] };
  return { where: `user_id = '' AND guest_id = ?${idx}`, args: [gid] };
}

async function ipHash(env: Env, request: Request): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const salt = env.COMMENTS_SALT || env.OAUTH_STATE_SECRET || 'gridpaw';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + ip));
  const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 32);
}

async function hasRecentPlay(env: Env, uid: string, gid: string): Promise<boolean> {
  if (!uid && !gid) return false;
  const { where, args } = visitorWhere(1, uid, gid);
  const row = await env.meowtrail_users
    .prepare(`SELECT 1 AS x FROM gp_event WHERE (${where}) AND event_name IN ('level_up','game_over') AND created_at > ? LIMIT 1`)
    .bind(...args, Date.now() - PLAY_WINDOW_MS)
    .first();
  return Boolean(row);
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const game = (new URL(request.url).searchParams.get('game') ?? '').trim();
  if (GAMES.indexOf(game) === -1) return json({ error: 'bad_game' }, 400);

  const { uid, gid, key } = await visitorKey(request, env, new URL(request.url).searchParams.get('anonId') ?? undefined);

  // 已审核评论（先审后显：pending/deleted 永不出现在墙上）
  const commentsRows = ((await env.meowtrail_users
    .prepare(`SELECT id, visitor_key, text, created_at FROM gp_comments WHERE game = ?1 AND status = 'approved' ORDER BY created_at DESC LIMIT ${WALL_LIMIT}`)
    .bind(game)
    .all()).results ?? []) as unknown as { id: string; visitor_key: string; text: string; created_at: number }[];

  // 评论者徽章 chip（设计稿 ④C：评论 + 徽章并排）——一次查询带出所有评论者的派生原料
  const keys = Array.from(new Set(commentsRows.map((c) => String(c.visitor_key))));
  const rowsByKey = new Map<string, EventRow[]>();
  if (keys.length) {
    const conds: string[] = [];
    const args: string[] = [];
    keys.forEach((k, i) => {
      const w = visitorWhere(i * 2 + 1, k === gid ? uid : '', k);
      conds.push(w.where);
      args.push(...w.args);
    });
    const r = await env.meowtrail_users
      .prepare(`SELECT user_id, guest_id, event_name, metadata, created_at FROM gp_event WHERE (${conds.join(' OR ')}) AND event_name IN (${LEVEL_EVENTS})`)
      .bind(...args)
      .all();
    for (const row of (r.results ?? []) as Record<string, unknown>[]) {
      // 归属到评论者键：登录事件按 user_id，guest 事件按 guest_id
      const k = String(row.user_id || row.guest_id || '');
      const list = rowsByKey.get(k) ?? [];
      list.push({ event_name: String(row.event_name), metadata: (row.metadata as string) ?? null, created_at: Number(row.created_at) });
      rowsByKey.set(k, list);
    }
  }
  const badgesByKey = new Map<string, { id: string; label: string }[]>();
  for (const [k, rows] of rowsByKey) badgesByKey.set(k, topBadges(deriveBadges(rows)));

  // 自动行（冷启动垫底）：murdoku = level_up 的 '4x4'/'6x6'（破案签名，全量历史可用）；
  // shikaku = metadata.pagePath === '/' 的通关事件（pagePath 由 funnel-track 增量补充，
  // 仅部署后的事件带此键——历史 gp_event 无游戏维度，不伪造归属）。
  // 展示去重：同一访客同一动作只保留最新一条，防「Mei closed a 4×4 case」刷屏。
  const auto: { name: string; initial: string; text: string; at: number }[] = [];
  const seenAuto = new Set<string>();
  const pushAuto = (guestKey: string, text: string, at: number) => {
    const dedupeKey = guestKey + '|' + text;
    if (seenAuto.has(dedupeKey)) return;
    seenAuto.add(dedupeKey);
    const p = pseudonym(guestKey);
    auto.push({ name: p.name, initial: p.initial, text, at });
  };
  if (game === 'murdoku') {
    const rows = ((await env.meowtrail_users
      .prepare(`SELECT guest_id, metadata, created_at FROM gp_event WHERE event_name = 'level_up' ORDER BY created_at DESC LIMIT 200`)
      .all()).results ?? []) as unknown as { guest_id: string; metadata: string | null; created_at: number }[];
    for (const row of rows) {
      const level = safeParse(row.metadata ?? '')?.level;
      if (level !== '4x4' && level !== '6x6') continue;
      pushAuto(String(row.guest_id ?? ''), `closed a ${level === '4x4' ? '4×4' : '6×6'} case`, Number(row.created_at));
      if (auto.length >= AUTO_LIMIT) break;
    }
  } else {
    // shikaku：pagePath 过滤放 JS 侧（历史事件无此键自然被滤掉），取近 300 条通关候选
    const rows = ((await env.meowtrail_users
      .prepare(`SELECT guest_id, event_name, metadata, created_at FROM gp_event WHERE event_name IN ('level_up','level_complete_3','level_complete_5','level_complete_10','level_complete_20','daily_solved') ORDER BY created_at DESC LIMIT 300`)
      .all()).results ?? []) as unknown as { guest_id: string; event_name: string; metadata: string | null; created_at: number }[];
    for (const row of rows) {
      const meta = safeParse(row.metadata ?? '');
      if (!meta || meta.pagePath !== '/') continue;
      if (row.event_name === 'level_up' && typeof meta.level !== 'number') continue; // 无关卡号不硬凑
      const text = row.event_name === 'daily_solved'
        ? 'solved today\u2019s Daily'
        : `cleared Level ${String(meta.level ?? row.event_name.replace('level_complete_', '') ?? '')}`.trim();
      pushAuto(String(row.guest_id ?? ''), text, Number(row.created_at));
      if (auto.length >= AUTO_LIMIT) break;
    }
  }

  return json({
    game,
    siteKey: env.TURNSTILE_SITE_KEY ?? null,
    eligible: await hasRecentPlay(env, uid, gid),
    comments: commentsRows.map((c) => {
      const k = String(c.visitor_key);
      const p = pseudonym(k);
      return { id: c.id, name: p.name, initial: p.initial, text: c.text, at: Number(c.created_at), badges: badgesByKey.get(k) ?? [] };
    }),
    auto,
  });
};

function safeParse(raw: string): Record<string, unknown> | null {
  try { const v = JSON.parse(raw); return v && typeof v === 'object' ? v as Record<string, unknown> : null; } catch { return null; }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, ctx }) => {
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 4096) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const game = typeof body.game === 'string' ? body.game : '';
  if (GAMES.indexOf(game) === -1) return json({ error: 'bad_game' }, 400);
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (text.length < MIN_TEXT || text.length > MAX_TEXT) return json({ error: 'bad_text' }, 400);

  const { uid, gid, key } = await visitorKey(request, env, body.anonId);

  // 闸门①：近 7 天真玩过（level_up / game_over）——纯游客 + 广告机过不了
  if (!(await hasRecentPlay(env, uid, gid))) return json({ error: 'not_played' }, 403);

  // 闸门②：限频（deleted 不计数，pending + approved 都算）——本地 DB 查询排在前，
  // 超限直接 429 拿正确文案，还省一次 Turnstile 外部调用
  const now = Date.now();
  const since = now - 24 * 3600000;
  const visitorCount = await env.meowtrail_users
    .prepare(`SELECT COUNT(*) AS n FROM gp_comments WHERE visitor_key = ?1 AND created_at > ?2 AND status != 'deleted'`)
    .bind(key, since)
    .first<{ n: number }>();
  if (visitorCount && visitorCount.n >= VISITOR_LIMIT_24H) return json({ error: 'rate_limited' }, 429);
  const ipH = await ipHash(env, request);
  const ipCount = await env.meowtrail_users
    .prepare(`SELECT COUNT(*) AS n FROM gp_comments WHERE ip_hash = ?1 AND created_at > ?2 AND status != 'deleted'`)
    .bind(ipH, since)
    .first<{ n: number }>();
  if (ipCount && ipCount.n >= IP_LIMIT_24H) return json({ error: 'rate_limited_ip' }, 429);

  // 闸门③：Turnstile siteverify（fail closed：secret 未配置直接 503，不降级放行）
  const token = typeof body.token === 'string' ? body.token : '';
  if (!env.TURNSTILE_SECRET_KEY) return json({ error: 'captcha_not_configured' }, 503);
  let ok = false;
  try {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET_KEY);
    form.append('response', token);
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) form.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form, signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as { success?: boolean };
    ok = Boolean(data.success);
  } catch {
    ok = false;
  }
  if (!ok) return json({ error: 'captcha_failed' }, 403);

  await env.meowtrail_users
    .prepare(`INSERT INTO gp_comments (id, visitor_key, game, text, status, ip_hash, created_at) VALUES (?1, ?2, ?3, ?4, 'pending', ?5, ?6)`)
    .bind(crypto.randomUUID(), key, game, text, ipH, now)
    .run();

  // 邮件通知：RESEND 通道复用 forgot-password 的口径；收件人未配置则跳过；失败不挡评论
  if (env.COMMENTS_NOTIFY_EMAIL && env.RESEND_API_KEY && env.RESEND_FROM_EMAIL) {
    const send = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [env.COMMENTS_NOTIFY_EMAIL],
        subject: `New detective note on ${game} (pending review)`,
        text: `A new comment is waiting for review on gridpaw.com.\n\nGame: ${game}\nText: ${text}\n\nReview: https://gridpaw.com/admin/comments?token=<COMMENTS_ADMIN_TOKEN>`,
      }),
      signal: AbortSignal.timeout(10000),
    }).then((r) => { if (!r.ok) console.error('comment notify failed', r.status); }).catch(() => { /* 通知失败不挡评论 */ });
    if (ctx?.waitUntil) ctx.waitUntil(send); else await send;
  }

  return json({ ok: true, status: 'pending' });
};
