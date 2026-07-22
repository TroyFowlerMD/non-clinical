/* Five Crowns Scorekeeper — Service Worker
 * Strategy: precache-all + cache-first with network-update fallback.
 * Bump CACHE_VERSION any time five-crowns.html or assets change to force update.
 */
const CACHE_VERSION = 'v11-2026-07-22';
const CACHE = `five-crowns-${CACHE_VERSION}`;

// Everything the app needs to run fully offline.
// Paths are scoped to /non-clinical/ (GitHub Pages project path).
const ASSETS = [
  '/non-clinical/five-crowns.html',
  '/non-clinical/manifest.json',
  '/non-clinical/icon-192.png',
  '/non-clinical/icon-512.png',
  '/non-clinical/icon-maskable-192.png',
  '/non-clinical/icon-maskable-512.png'
];
const ALLOWED_PATHS = new Set(ASSETS);

// ── INSTALL: precache everything, then take over immediately ─────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll is atomic — if any asset fails the whole install fails, which
      // is what we want (no half-cached state).
      cache.addAll(ASSETS)
    )
  );
  self.skipWaiting();
});

// ── ACTIVATE: purge old caches, claim clients ────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first for same-origin GETs, with background refresh ─────
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET. POSTs etc. go straight to network.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin requests. Cross-origin (CDN, analytics) bypass SW.
  if (url.origin !== self.location.origin) return;
  // A legacy broad registration may remain briefly on existing devices.
  // Never intercept another app's URL during that transition.
  if (!ALLOWED_PATHS.has(url.pathname)) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      // Fire off a background fetch to refresh the cache for next time.
      const networkFetch = fetch(req)
        .then((response) => {
          // Only cache successful basic responses.
          if (response && response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => null);

      // Cache-first: serve cached immediately if available, otherwise wait for network.
      return cached || networkFetch || new Response(
        '<h1>Offline</h1><p>This resource is not cached and the network is unavailable.</p>',
        { status: 503, headers: { 'Content-Type': 'text/html' } }
      );
    })
  );
});

// ── MESSAGE: allow the page to trigger an immediate update ───────────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
