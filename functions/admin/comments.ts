// /admin/comments —— 极简审核口（设计稿 ⑤：先审后显，别做重型后台）
// GET  /admin/comments?token=<COMMENTS_ADMIN_TOKEN>              → 待审 + 近期已处理，JSON
// POST /admin/comments?token=<COMMENTS_ADMIN_TOKEN>  {id,action} → action: 'approve' | 'delete'
// token 常量时间比对；未配置 COMMENTS_ADMIN_TOKEN 一律 403（不做「配置了才能用」之外的降级）。
// curl 用法：
//   curl "https://gridpaw.com/admin/comments?token=$TOKEN"
//   curl -X POST "https://gridpaw.com/admin/comments?token=$TOKEN" -H 'content-type: application/json' -d '{"id":"…","action":"approve"}'
import type { Env } from '../api/_lib';
import { json } from '../api/_lib';

const LIST_LIMIT = 100;

function tokenOk(expected: string | undefined, given: string): boolean {
  if (!expected || !given) return false;
  if (expected.length !== given.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

function check(request: Request, env: Env): Response | null {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (!tokenOk(env.COMMENTS_ADMIN_TOKEN, token)) return json({ error: 'forbidden' }, 403);
  return null;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const denied = check(request, env);
  if (denied) return denied;
  const db = env.meowtrail_users;
  const pending = ((await db
    .prepare(`SELECT id, game, text, visitor_key, ip_hash, created_at FROM gp_comments WHERE status = 'pending' ORDER BY created_at ASC LIMIT ${LIST_LIMIT}`)
    .all()).results ?? []) as unknown as Record<string, unknown>[];
  const recent = ((await db
    .prepare(`SELECT id, game, text, visitor_key, status, created_at FROM gp_comments WHERE status != 'pending' ORDER BY created_at DESC LIMIT ${LIST_LIMIT}`)
    .all()).results ?? []) as unknown as Record<string, unknown>[];
  return json({ pending, recent });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const denied = check(request, env);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const id = typeof body.id === 'string' ? body.id : '';
  const action = typeof body.action === 'string' ? body.action : '';
  if (!id) return json({ error: 'bad_id' }, 400);
  if (action !== 'approve' && action !== 'delete') return json({ error: 'bad_action' }, 400);
  const status = action === 'approve' ? 'approved' : 'deleted';
  const res = await env.meowtrail_users
    .prepare(`UPDATE gp_comments SET status = ?1 WHERE id = ?2`)
    .bind(status, id)
    .run();
  if (!res.success) return json({ error: 'update_failed' }, 500);
  return json({ ok: true, id, status });
};
