import { Env, makeState, stateCookie, safeNext, canonicalOrigin, AUTH_PROVIDERS } from '../_lib';
import type { AuthProvider } from '../_lib';

// 多供应商 OAuth 登录入口
// GET /api/auth/login?provider=google|microsoft|facebook&next=<站内路径>
// provider 缺省 = google（兼容既有 ?next= 链接）。
// state cookie 三段式：raw.sig | provider | 回跳路径（provider 编码进现有 payload）。

function buildAuthUrl(provider: AuthProvider, clientId: string, redirectUri: string, state: string): string {
  const u = new URL(
    provider === 'google'
      ? 'https://accounts.google.com/o/oauth2/v2/auth'
      : provider === 'microsoft'
        ? 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
        : 'https://www.facebook.com/v19.0/dialog/oauth'
  );
  u.searchParams.set('client_id', clientId);
  u.searchParams.set('redirect_uri', redirectUri);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('state', state);
  if (provider === 'google') {
    u.searchParams.set('scope', 'openid email profile');
    u.searchParams.set('prompt', 'select_account');
  } else if (provider === 'microsoft') {
    // 授权码走 query 回跳（response_mode=query），token 交换仍走 v2.0 token 端点
    u.searchParams.set('scope', 'openid email profile');
    u.searchParams.set('response_mode', 'query');
  } else {
    u.searchParams.set('scope', 'public_profile,email');
  }
  return u.toString();
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const providerRaw = (url.searchParams.get('provider') || 'google').toLowerCase();
  // 未知 provider 一律 302 回游戏页（绝不裸 500）
  if (!(AUTH_PROVIDERS as readonly string[]).includes(providerRaw)) {
    return Response.redirect(url.origin + '/?auth_error=bad_provider', 302);
  }
  const provider = providerRaw as AuthProvider;

  const clientId =
    provider === 'google'
      ? env.GOOGLE_CLIENT_ID
      : provider === 'microsoft'
        ? env.MICROSOFT_CLIENT_ID
        : env.FACEBOOK_CLIENT_ID;
  if (!clientId) {
    return Response.redirect(url.origin + '/?auth_error=not_configured', 302);
  }

  const state = await makeState(env.OAUTH_STATE_SECRET);

  // origin 归一化：redirect_uri 必须与各供应商 Console 登记的完全一致。
  // 非 localhost 的入口（www. / *.pages.dev 等）一律收敛到 apex。
  const origin = canonicalOrigin(url);
  const safe = safeNext(origin, url.searchParams.get('next'));

  const headers: Record<string, string> = {
    'Set-Cookie': stateCookie(state + '|' + provider + '|' + safe),
    'cache-control': 'no-store',
  };
  return new Response(null, {
    status: 302,
    headers: {
      ...headers,
      Location: buildAuthUrl(provider, clientId, `${origin}/api/auth/callback`, state),
    },
  });
};
