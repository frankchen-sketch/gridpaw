// 会话签名与校验工具（被 callback / me / progress / leaderboard 复用）
// 部署目标：Cloudflare Pages Functions（Web 标准运行时，无 Node API）

export interface Env {
  meowtrail_users: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  OAUTH_STATE_SECRET: string;
  // 自建漏斗（functions/api/events.ts、funnel.ts）
  FUNNEL_EVENT_INGESTION_ENABLED?: string; // wrangler.toml [vars] 唯一定义，别处（Dashboard）不要重复设同名变量
  FUNNEL_ADMIN_TOKEN?: string;             // 生产 secret（wrangler pages secret put），不进 wrangler.toml
}

export const SESSION_COOKIE = 'mt_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 年

function b64urlEncode(buf: ArrayBuffer): string {
  let bin = '';
  const bytes = new Uint8Array(buf);
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// state：一次性 CSRF 值，HMAC 签名后放 cookie，回调时比对
export async function makeState(secret: string): Promise<string> {
  const raw = crypto.getRandomValues(new Uint8Array(16));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, raw);
  return b64urlEncode(raw) + '.' + b64urlEncode(sig);
}

export async function verifyState(secret: string, state: string): Promise<boolean> {
  const idx = state.indexOf('.');
  if (idx < 0) return false;
  const rawB64 = state.slice(0, idx);
  const sigB64 = state.slice(idx + 1);
  const raw = b64urlDecode(rawB64);
  const key = await hmacKey(secret);
  const expected = await crypto.subtle.sign('HMAC', key, raw);
  const expectedB64 = b64urlEncode(expected);
  // 常量时间比较
  if (expectedB64.length !== sigB64.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedB64.length; i++) {
    diff |= expectedB64.charCodeAt(i) ^ sigB64.charCodeAt(i);
  }
  return diff === 0;
}

// session cookie：uid.exp（unix 秒）.HMAC(uid:exp)
export async function makeSessionValue(secret: string, uid: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode('uid:' + uid + ':' + exp)
  );
  return uid + '.' + exp + '.' + b64urlEncode(sig);
}

export async function verifySessionValue(secret: string, value: string): Promise<string | null> {
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  const [uid, expStr, sigB64] = parts;
  const exp = Number(expStr);
  if (!Number.isInteger(exp) || exp * 1000 < Date.now()) return null; // 过期
  const key = await hmacKey(secret);
  const expected = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode('uid:' + uid + ':' + exp)
  );
  const expectedB64 = b64urlEncode(expected);
  if (expectedB64.length !== sigB64.length) return null;
  let diff = 0;
  for (let i = 0; i < expectedB64.length; i++) {
    diff |= expectedB64.charCodeAt(i) ^ sigB64.charCodeAt(i);
  }
  return diff === 0 ? uid : null;
}

export function sessionCookie(value: string): string {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function stateCookie(value: string): string {
  return `mt_oauth_state=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
}

export function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return null;
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  });
}

// 回跳路径白名单：必须是站内路径（含 /\evil.com、//evil.com、https:// 等一律拒绝）
export function safeNext(origin: string, next: string | null): string {
  if (!next) return '/';
  try {
    const u = new URL(next, origin);
    if (u.origin !== origin || u.protocol !== 'https:' && u.protocol !== 'http:') return '/daily';
    return u.pathname + u.search + u.hash;
  } catch {
    return '/daily';
  }
}
