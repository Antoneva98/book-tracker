/* Service worker for Трекер читання.
   Goal: a Home-Screen (PWA) install always picks up the latest deploy when
   online, while still working offline.

   - Navigations (the HTML document) → NETWORK-FIRST. So index.html is always
     fresh online; it references the latest content-hashed JS/CSS, so updates
     propagate on the next launch. Falls back to cache when offline.
   - Same-origin assets → STALE-WHILE-REVALIDATE (fast, self-healing). Asset
     filenames are content-hashed, so there's no staleness risk.
   - Cross-origin requests (Supabase API, Google Fonts) are left untouched. */

const CACHE = "svitlo-cache-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle our own origin; let Supabase / fonts go straight to network.
  if (url.origin !== self.location.origin) return;

  // HTML documents: network-first.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached || (await caches.match("./")) || Response.error();
        }
      })(),
    );
    return;
  }

  // Other same-origin GETs (hashed assets): stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })(),
  );
});
