// POST /api/profile —— 设置展示昵称（P2 排行榜 / 徽章墙用，2026-10-20）
// 登录态必填（mt_session 签名校验，与 progress/leaderboard 同一套）。
// 存 users.display_name；榜单展示一律 COALESCE(display_name, name)，为空即回退。
// 校验：trim 后按 Unicode 码点计数 2-20；只允许 字母/数字/空格/下划线/点/连字符（\p{L} 覆盖中日韩）。
import type { Env } from './_lib';
import { json, getCookie, verifySessionValue } from './_lib';

const NAME_MIN = 2;
const NAME_MAX = 20;
const NAME_RE = /^[\p{L}\p{N} ._-]+$/u;

interface ProfileBody {
  displayName?: unknown;
}

function normalize(raw: unknown): { value: string } | { error: string } {
  if (typeof raw !== 'string') return { error: 'display_name_required' };
  // 内部连续空白压成单空格（含全角空格 \u3000）；unpaired surrogate 由 \p{L} 校验兜住
  const value = raw.replace(/\s+/gu, ' ').trim();
  const len = Array.from(value).length; // 码点计数：一个汉字 = 1
  if (len < NAME_MIN) return { error: 'display_name_too_short' };
  if (len > NAME_MAX) return { error: 'display_name_too_long' };
  if (!NAME_RE.test(value)) return { error: 'display_name_invalid_chars' };
  if (/^[ ._-]+$/.test(value)) return { error: 'display_name_invalid_chars' };
  return { value };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ error: 'unauthorized' }, 401);
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  let body: ProfileBody;
  try {
    const text = await request.text();
    if (text.length > 512) return json({ error: 'payload_too_large' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const out = normalize(body?.displayName);
  if ('error' in out) return json({ error: out.error }, 400);

  const res = await env.meowtrail_users
    .prepare('UPDATE users SET display_name = ?1 WHERE id = ?2')
    .bind(out.value, uid)
    .run();
  const changes = (res?.meta as { changes?: number } | undefined)?.changes ?? 0;
  if (!changes) return json({ error: 'user_not_found' }, 404);

  return json({ ok: true, displayName: out.value });
};

// GET /api/profile —— 当前昵称（前端设置面板回填用；未设置返回 null）
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ error: 'unauthorized' }, 401);
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  const row = await env.meowtrail_users
    .prepare('SELECT COALESCE(display_name, name) AS displayName, display_name AS custom FROM users WHERE id = ?1')
    .bind(uid)
    .first<{ displayName: string | null; custom: string | null }>();

  return json({ displayName: row?.displayName ?? null, custom: row?.custom ?? null });
};
