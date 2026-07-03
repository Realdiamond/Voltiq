// ── OneSignal web push ───────────────────────────────────────────────────────
// Loads the OneSignal push SDK into this worker (active — OneSignal app is set up).
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// Voltiq service worker — makes the dashboard installable and resilient.
// Strategy:
//  - App shell / static assets: stale-while-revalidate (fast loads, offline shell).
//  - Firebase / API / live data: always network (never cache real-time readings).
const CACHE = "voltiq-v2";
// Don't pre-cache HTML routes (they change); just the offline essentials.
const SHELL = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {})
  );
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

// Focus (or open) the app when a notification is clicked.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(new URL("/alerts", self.location.origin).href);
      }
    })
  );
});

// Groundwork for true push notifications (delivered when the app is closed).
// Displaying works here; SENDING requires a push service such as Firebase Cloud
// Messaging plus a Cloud Function / backend that pushes on a threshold breach.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { /* ignore */ }
  event.waitUntil(
    self.registration.showNotification(data.title || "Voltiq alert", {
      body: data.body || "A new alert was raised on your energy system.",
      icon: "/logo.png",
      badge: "/logo.png",
      tag: data.tag || "voltiq-push",
    })
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never cache live data sources (Firebase realtime DB, websockets, auth).
  if (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase") ||
    req.headers.get("upgrade") === "websocket"
  ) {
    return; // let the browser handle it normally
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
