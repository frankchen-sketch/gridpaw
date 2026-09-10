import { Env, clearSessionCookie } from '../_lib';

export const onRequestGet: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 302,
    headers: { Location: '/', 'Set-Cookie': clearSessionCookie(), 'cache-control': 'no-store' },
  });
};
