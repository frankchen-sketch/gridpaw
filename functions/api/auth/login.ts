import { Env, makeState, stateCookie, safeNext } from '../_lib';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const clientID = env.GOOGLE_CLIENT_ID;
  if (!clientID) return new Response('OAuth not configured', { status: 500 });

  // state + 回跳地址（登录成功后回到发起页）
  const state = await makeState(env.OAUTH_STATE_SECRET);

  // origin 归一化：redirect_uri 必须与 Google Console 登记的完全一致。
  // 非 localhost 的入口（www. / *.pages.dev 等）一律收敛到 apex，
  // 否则从 www 或预览域名点登录会触发 400 redirect_uri_mismatch。
  const isLocalhost = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(url.hostname);
  const canonicalOrigin = isLocalhost ? url.origin : 'https://gridpaw.com';
  const safe = safeNext(canonicalOrigin, url.searchParams.get('next'));

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientID);
  authUrl.searchParams.set('redirect_uri', `${canonicalOrigin}/api/auth/callback`);
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
