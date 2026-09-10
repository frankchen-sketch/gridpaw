import { Env, getCookie, verifySessionValue, json } from '../_lib';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const val = getCookie(request, 'mt_session');
  if (!val) return json({ user: null });
  const uid = await verifySessionValue(env.OAUTH_STATE_SECRET, val);
  if (!uid) return json({ user: null });
  const user = await env.meowtrail_users
    .prepare('SELECT id, name, picture, email FROM users WHERE id = ?')
    .bind(uid)
    .first<{ id: string; name: string | null; picture: string | null; email: string | null }>();
  if (!user) return json({ user: null });
  return json({ user: { id: user.id, name: user.name, picture: user.picture } });
};
