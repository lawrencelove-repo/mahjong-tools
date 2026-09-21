/**
 * Service worker — offline shell + runtime cache for tiles/assets.
 * Bump CACHE_VERSION when changing precache list or caching strategy.
 */
const CACHE_VERSION = "mahjong-cheatsheets-v20";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/pwa.js",
  "./js/nav-boot.js",
  "./js/tiles.js",
  "./js/settings.js",
  "./js/site-nav.js",
  "./js/hand-randomize.js",
  "./js/hand-build.js",
  "./js/yaku-data.js",
  "./js/riichi-randomize.js",
  "./js/app.js",
  "./js/nmjl-data.js",
  "./js/nmjl-randomize.js",
  "./js/nmjl-app.js",
  "./js/hk-data.js",
  "./js/hk-randomize.js",
  "./js/hk-app.js",
  "./js/filipino-data.js",
  "./js/filipino-randomize.js",
  "./js/filipino-app.js",
  "./js/filipino-quick-start.js",
  "./js/rules-page.js",
  "./riichi.html",
  "./nmjl.html",
  "./hk.html",
  "./filipino.html",
  "./tiles.html",
  "./riichi_rules.html",
  "./nmjl_rules.html",
  "./hk_rules.html",
  "./filipino_rules.html",
  "./filipino-quick-start.html",
  "./assets/favicon/favicon.ico",
  "./assets/favicon/favicon-16x16.png",
  "./assets/favicon/favicon-32x32.png",
  "./assets/favicon/apple-touch-icon.png",
  "./assets/favicon/android-chrome-192x192.png",
  "./assets/favicon/android-chrome-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations / HTML: network first, fall back to cache
  const accept = req.headers.get("accept") || "";
  if (req.mode === "navigate" || accept.includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Static assets: cache first, then network
  event.respondWith(cacheFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (_) {
    const cached = await cache.match(req);
    if (cached) return cached;
    return cache.match("./index.html");
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (_) {
    return cached;
  }
}
