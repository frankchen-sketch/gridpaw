// GridPaw service worker — CACHE_VERSION is stamped by scripts/stamp-sw.mjs at build time. Do not edit by hand.
// Policies:
//   - Same-origin GET only; /api/*, /from/*, POST and all cross-origin (ads/GA4/pagefind) fully bypassed.
//   - Navigation (HTML): network-first (3s timeout) -> runtime cache -> /offline/ fallback.
//     No page HTML is precached: HTML+its hashed assets fill the runtime cache together on first
//     visit, so a cache-served page can never be a broken half-cached shell.
//   - Same-origin static: stale-while-revalidate.
//   - activate: purge every gridpaw-* cache not matching current version; skipWaiting + claim.
const CACHE_VERSION = 'dev';
const STATIC_CACHE = `gridpaw-static:${CACHE_VERSION}`;
const RUNTIME_CACHE = `gridpaw-runtime:${CACHE_VERSION}`;
// Precache = stable first-party assets only (engines + core scripts + icons + offline shell).
// Every entry must exist at deploy time or install rejects — check public/ before editing.
const PRECACHE = [
  '/offline/',
  '/manifest.webmanifest',
  '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png',
  '/puzzle-engine.js', '/akari-engine.js', '/kakuro-engine.js', '/nonogram-engine.js',
  '/nonogram-solver.js', '/nurikabe-engine.js', '/murdoku-engine.js', '/slitherlink-engine.js',
  '/binary-engine.js', '/hashi-engine.js', '/star-battle-engine.js', '/calcudoku-engine.js',
  '/leaderboard.js', '/gp-badges.js', '/gp-comments.js', '/sfx.js', '/analytics.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n.startsWith('gridpaw-') && !n.endsWith(`:${CACHE_VERSION}`))
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

function fetchWithTimeout(req, ms) {
  return Promise.race([
    fetch(req),
    new Promise((_, rej) => setTimeout(() => rej(new Error('sw-timeout')), ms)),
  ]);
}

async function networkFirstHTML(req) {
  const runtime = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetchWithTimeout(req, 3000);
    if (fresh && fresh.ok) runtime.put(req, fresh.clone());
    if (fresh) return fresh;
  } catch (_) { /* offline or slow — fall through to cache */ }
  const cached =
    (await runtime.match(req, { ignoreSearch: true })) ||
    (await caches.open(STATIC_CACHE).then((c) => c.match(req, { ignoreSearch: true })));
  if (cached) return cached;
  return (
    (await caches.open(STATIC_CACHE).then((c) => c.match('/offline/'))) ||
    new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  );
}

async function staleWhileRevalidate(req) {
  const runtime = await caches.open(RUNTIME_CACHE);
  const cached = await runtime.match(req, { ignoreSearch: true });
  const fresh = fetch(req)
    .then((res) => {
      if (res && res.ok) runtime.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await fresh) || new Response('', { status: 504 });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // writes: bypass
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;             // third-party (ads/GA4/pagefind): bypass
  if (url.pathname.startsWith('/api/')) return;           // leaderboard/geo/auth: bypass
  if (url.pathname.startsWith('/from/')) return;          // server-side short links: bypass
  const isNav = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isNav) {
    e.respondWith(networkFirstHTML(req));
  } else {
    e.respondWith(staleWhileRevalidate(req));
  }
});
