/* Sourdough Workbench — scoped service worker.
 * Bump CACHE_VERSION whenever the app shell or PWA assets change.
 */
const CACHE_VERSION = "v3-2026-07-21";
const CACHE = `sourdough-workbench-${CACHE_VERSION}`;
const APP_URL = "/non-clinical/personal/sourdough-workflow.html";
const ASSETS = [
  APP_URL,
  "/non-clinical/personal/sourdough-manifest.json",
  "/non-clinical/personal/sourdough-icon-192.png",
  "/non-clinical/personal/sourdough-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith("sourdough-workbench-") && key !== CACHE)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(APP_URL, copy));
        }
        return response;
      }).catch(() => caches.match(APP_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response && response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
