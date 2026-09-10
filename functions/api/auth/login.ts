import { Env, makeState, stateCookie, safeNext } from '../_lib';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const clientID = env.GOOGLE_CLIENT_ID;
  if (!clientID) return new Response('OAuth not configured', { status: 500 });

  // state + 回跳地址（登录成功后回到发起页）
  const state = await makeState(env.OAUTH_STATE_SECRET);
  const safe = safeNext(url.origin, url.searchParams.get('next'));

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientID);
  authUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('prompt', 'select_account');

  const headers: Record<string, string> = {
    'Set-Cookie': stateCookie(state + '|' + safe),
    'cache-control': 'no-store',
  };
  return new Response(null, { status: 302, headers: { ...headers, Location: authUrl.toString() } });
};
