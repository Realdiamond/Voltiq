// ─── OneSignal web-push SDK (must be first line — initial evaluation) ─────────
// This file is the service worker OneSignal looks for by default. It also
// carries Voltiq's PWA caching, so the app has ONE combined worker (push + PWA).
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// ─── Voltiq PWA caching (installable + offline shell) ─────────────────────────
const CACHE = "voltiq-v3";
const SHELL = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// NOTE: push + notificationclick are handled by the OneSignal SDK imported above,
// so we intentionally don't add our own — that avoids duplicate notifications.

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never cache live data or third-party SDKs.
  if (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("onesignal.com") ||
    req.headers.get("upgrade") === "websocket"
  ) {
    return;
  }

  // Same-origin: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
