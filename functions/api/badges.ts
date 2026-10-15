// GET /api/badges —— 按访客键派生徽章列表（全部来自 gp_event 已有埋点，零新打点）
// 访客键口径：登录用户按 uid 归并 + 继承同浏览器 guest 时期事件（无迁移）；未登录按 guest_id。
// 派生规则在 _badges-derive.ts（badges 与留言墙评论徽章 chip 共用一份）。
import type { Env } from './_lib';
import { json, getCookie, verifySessionValue } from './_lib';
import { GUEST_COOKIE } from './_funnel-sql';
import { LEVEL_EVENTS, deriveBadges, type EventRow } from './_badges-derive';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const sid = getCookie(request, 'mt_session');
  const uid = sid ? (await verifySessionValue(env.OAUTH_STATE_SECRET, sid)) ?? '' : '';
  // 访客键：gp_gid cookie 优先；现网身份链是 localStorage gp_anon_id 每请求随 events 上报
  // （events.ts 的 isNewGuest 只在无合法 anonId 时才 Set-Cookie，而 funnel-track 永远发合法
  // anonId → gp_gid cookie 实际不会被设置），所以 cookie 缺席时兜底接受 ?anonId=（同格式收紧）。
  let gid = getCookie(request, GUEST_COOKIE) ?? '';
  if (!gid) {
    const q = new URL(request.url).searchParams.get('anonId') ?? '';
    if (/^anon-[0-9a-fA-F-]{6,70}$/.test(q)) gid = q;
  }
  const key = uid || gid;
  if (!key) return json({ badges: [], signedIn: false });

  // 登录：user_id=uid（登录后事件）OR guest 时期事件（user_id='' AND guest_id=访客键）
  // —— 注册自动继承，无需回填迁移。未登录：user_id='' AND guest_id。
  let where: string;
  let bindArgs: string[];
  if (uid && gid) {
    where = `user_id = ?1 OR (user_id = '' AND guest_id = ?2)`;
    bindArgs = [uid, gid];
  } else if (uid) {
    where = `user_id = ?1`;
    bindArgs = [uid];
  } else {
    where = `user_id = '' AND guest_id = ?1`;
    bindArgs = [gid];
  }
  const stmt = env.meowtrail_users
    .prepare(
      `SELECT event_name, metadata, created_at FROM gp_event
       WHERE (${where}) AND event_name IN (${LEVEL_EVENTS})
       ORDER BY created_at ASC`
    )
    .bind(...bindArgs);
  const rows = (await stmt.all()).results ?? [];
  return json({ badges: deriveBadges(rows as unknown as EventRow[]), signedIn: Boolean(uid) });
};
