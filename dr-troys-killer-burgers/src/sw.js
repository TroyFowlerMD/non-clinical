const CACHE_NAME = "dr-troys-killer-burgers-v1";
const APP_SHELL = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "recipe-data.js",
  "manifest.webmanifest",
  "assets/hero-640.avif",
  "assets/hero-960.avif",
  "assets/hero-1280.avif",
  "assets/hero-640.webp",
  "assets/hero-960.webp",
  "assets/hero-1280.webp",
  "assets/hero-1280.jpg",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-maskable-192.png",
  "assets/icon-maskable-512.png",
  "assets/apple-touch-icon.png",
  "assets/qr-canonical.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("dr-troys-killer-burgers-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }
          return caches.match("index.html");
        });
    })
  );
});
