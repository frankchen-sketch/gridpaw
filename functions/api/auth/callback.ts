import {
  Env,
  verifyState,
  makeSessionValue,
  sessionCookie,
  getCookie,
  safeNext,
  canonicalOrigin,
  AUTH_PROVIDERS,
  normalizeEmail,
} from '../_lib';
import type { AuthProvider } from '../_lib';

// OAuth 回调：按 provider 分发 token 交换与 userinfo。
// 所有错误分支一律 302 回游戏页带 ?auth_error=，绝不裸 500/502。

const PROVIDERS = AUTH_PROVIDERS as readonly string[];

function errorRedirect(origin: string, code: string): Response {
  return Response.redirect(origin + '/?auth_error=' + encodeURIComponent(code), 302);
}

interface TokenResult {
  ok: true;
  accessToken: string;
}
interface TokenFailure {
  ok: false;
  error: string;
}
type TokenOutcome = TokenResult | TokenFailure;

// code → access_token（各供应商端点不同）
// 统一 10s 超时：上游慢/挂起时必须走 token_exchange 分支 302，绝不悬挂或裸抛
const FETCH_TIMEOUT_MS = 10_000;

async function exchangeCode(
  provider: AuthProvider,
  code: string,
  redirectUri: string,
  env: Env
): Promise<TokenOutcome> {
  try {
    if (provider === 'facebook') {
      const url = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      url.searchParams.set('client_id', env.FACEBOOK_CLIENT_ID ?? '');
      url.searchParams.set('client_secret', env.FACEBOOK_CLIENT_SECRET ?? '');
      url.searchParams.set('code', code);
      url.searchParams.set('redirect_uri', redirectUri);
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!res.ok) return { ok: false, error: 'token_exchange' };
      const data = (await res.json()) as { access_token?: string };
      if (!data.access_token) return { ok: false, error: 'token_exchange' };
      return { ok: true, accessToken: data.access_token };
    }

    const tokenUrl =
      provider === 'google'
        ? 'https://oauth2.googleapis.com/token'
        : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const params: Record<string, string> = {
      code,
      client_id: provider === 'google' ? env.GOOGLE_CLIENT_ID : (env.MICROSOFT_CLIENT_ID ?? ''),
      client_secret: provider === 'google' ? env.GOOGLE_CLIENT_SECRET : (env.MICROSOFT_CLIENT_SECRET ?? ''),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };
    if (provider === 'microsoft') params.scope = 'openid email profile';
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, error: 'token_exchange' };
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) return { ok: false, error: 'token_exchange' };
    return { ok: true, accessToken: data.access_token };
  } catch {
    return { ok: false, error: 'token_exchange' };
  }
}

interface UserInfo {
  id: string; // provider 侧用户标识（google/microsoft=sub，facebook=id）
  email: string | null;
  name: string | null;
  picture: string | null;
}

// access_token → 用户信息（各供应商 userinfo 端点与字段形状不同）
// 同样挂 10s 超时：userinfo 失败/超时 → 302 auth_error=userinfo
async function fetchUserInfo(provider: AuthProvider, accessToken: string): Promise<UserInfo | null> {
  try {
    if (provider === 'google') {
      const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const ui = (await res.json()) as { sub?: string; email?: string; name?: string; picture?: string };
      if (!ui.sub) return null;
      return { id: ui.sub, email: ui.email ? normalizeEmail(ui.email) : null, name: ui.name ?? null, picture: ui.picture ?? null };
    }
    if (provider === 'microsoft') {
      const res = await fetch('https://graph.microsoft.com/oidc/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const ui = (await res.json()) as {
        sub?: string;
        email?: string;
        preferred_username?: string;
        name?: string;
        picture?: string;
      };
      if (!ui.sub) return null;
      return {
        id: ui.sub,
        email: ui.email ? normalizeEmail(ui.email) : null,
        name: ui.name ?? null,
        picture: ui.picture ?? null,
      };
    }
    // facebook：picture 是对象 { data: { url } }，取 url；email 可能不给（字段可空）
    const url = new URL('https://graph.facebook.com/v19.0/me');
    url.searchParams.set('fields', 'id,name,email,picture.type(large)');
    url.searchParams.set('access_token', accessToken);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    const ui = (await res.json()) as {
      id?: string;
      name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
    };
    if (!ui.id) return null;
    return {
      id: ui.id,
      email: ui.email ? normalizeEmail(ui.email) : null,
      name: ui.name ?? null,
      picture: ui.picture?.data?.url ?? null,
    };
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const origin = url.origin;
  // 供应商授权失败/用户取消：跳回带 error 参数
  const oauthError = url.searchParams.get('error');
  if (oauthError) return errorRedirect(origin, oauthError);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const stateCookieVal = getCookie(request, 'mt_oauth_state');
  if (!code || !state || !stateCookieVal) return errorRedirect(origin, 'missing_code');

  // state cookie 三段式：raw.sig | provider | 回跳路径
  // 兼容旧两段式（raw.sig | path）：缺 provider 段按 google 兜底
  let savedState: string;
  let provider: AuthProvider = 'google';
  let nextRaw: string;
  const sep1 = stateCookieVal.indexOf('|');
  if (sep1 < 0) return errorRedirect(origin, 'bad_state');
  savedState = stateCookieVal.slice(0, sep1);
  const rest = stateCookieVal.slice(sep1 + 1);
  const sep2 = rest.indexOf('|');
  if (sep2 < 0) {
    nextRaw = rest;
  } else {
    const p = rest.slice(0, sep2).toLowerCase();
    if (PROVIDERS.includes(p)) provider = p as AuthProvider;
    nextRaw = rest.slice(sep2 + 1);
  }
  const next = safeNext(origin, nextRaw);

  if (savedState !== state || !(await verifyState(env.OAUTH_STATE_SECRET, state))) {
    return errorRedirect(origin, 'state_mismatch');
  }

  // redirect_uri 沿用 login.ts 的 canonicalOrigin 归一化
  const redirectUri = `${canonicalOrigin(url)}/api/auth/callback`;

  const token = await exchangeCode(provider, code, redirectUri, env);
  if (!token.ok) return errorRedirect(origin, token.error);

  const ui = await fetchUserInfo(provider, token.accessToken);
  if (!ui) return errorRedirect(origin, 'userinfo');

  // upsert 用户：按 (provider, provider_user_id) 复合寻址
  const db = env.meowtrail_users;
  const existing = await db
    .prepare('SELECT id FROM users WHERE provider = ? AND provider_user_id = ?')
    .bind(provider, ui.id)
    .first<{ id: string }>();

  let uid: string;
  if (existing) {
    uid = existing.id;
    await db
      .prepare('UPDATE users SET email = ?, name = ?, picture = ? WHERE id = ?')
      .bind(ui.email ?? null, ui.name ?? null, ui.picture ?? null, uid)
      .run();
  } else {
    uid = crypto.randomUUID();
    // google 行保留 google_sub 字段（历史兼容）；microsoft/facebook 置 NULL，
    // 身份一律走 (provider, provider_user_id)
    await db
      .prepare(
        'INSERT INTO users (id, google_sub, provider, provider_user_id, email, name, picture, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        uid,
        provider === 'google' ? ui.id : null,
        provider,
        ui.id,
        ui.email ?? null,
        ui.name ?? null,
        ui.picture ?? null,
        Date.now()
      )
      .run();
  }

  const sessionVal = await makeSessionValue(env.OAUTH_STATE_SECRET, uid);
  // P0-1b 首登/再登绑定：把该浏览器 guest cookie 名下的历史行为数据归到 user（幂等，
  // 无行也不报错）。此后 GA4/D1 分析可见真人全周期漏斗。
  const gid = getCookie(request, 'gp_gid');
  if (gid) {
    await db
      .prepare(`UPDATE gp_event SET user_id = ?1 WHERE guest_id = ?2 AND (user_id IS NULL OR user_id = '')`)
      .bind(uid, gid)
      .run();
  }
  const headers = new Headers({ Location: next, 'cache-control': 'no-store' });
  headers.append('Set-Cookie', sessionCookie(sessionVal));
  // 清掉一次性 state cookie
  headers.append('Set-Cookie', 'mt_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  return new Response(null, { status: 302, headers });
};
