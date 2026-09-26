// PrayR service worker: app-shell caching and offline fallback.
// Bump VERSION to drop every cache from a previous release.
const VERSION = "v1";
const PAGES_CACHE = `prayr-pages-${VERSION}`;
const STATIC_CACHE = `prayr-static-${VERSION}`;
const ASSETS_CACHE = `prayr-assets-${VERSION}`;
const CURRENT_CACHES = [PAGES_CACHE, STATIC_CACHE, ASSETS_CACHE];

const OFFLINE_URL = "/fallback";
const PRECACHE_PAGES = ["/", OFFLINE_URL];
const PRECACHE_ASSETS = [
  "/manifest.webmanifest",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/apple-touch-icon.png",
];

// How long a launch waits on the network before falling back to the cached page.
const NAVIGATION_TIMEOUT_MS = 3000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const assets = await caches.open(ASSETS_CACHE);

      // Cache entries one by one so a single failure doesn't abort the install.
      await Promise.all([
        ...PRECACHE_PAGES.map((url) => precachePage(url).catch(() => undefined)),
        ...PRECACHE_ASSETS.map((url) => assets.add(url).catch(() => undefined)),
      ]);

      await self.skipWaiting();
    })(),
  );
});

// Caches a page together with the JS/CSS/font chunks it references, so it can
// hydrate offline even if it was never visited.
async function precachePage(url) {
  const [pages, statics] = await Promise.all([
    caches.open(PAGES_CACHE),
    caches.open(STATIC_CACHE),
  ]);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    return;
  }

  await pages.put(url, response.clone());

  const html = await response.text();
  const chunkUrls = new Set(html.match(/\/_next\/static\/[^"'\s\\)]+/g) ?? []);

  await Promise.all(
    [...chunkUrls].map(async (chunkUrl) => {
      if (!(await statics.match(chunkUrl))) {
        await statics.add(chunkUrl).catch(() => undefined);
      }
    }),
  );
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => !CURRENT_CACHES.includes(key))
          .map((key) => caches.delete(key)),
      );

      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // RSC payloads, API data and analytics always go to the network. Next.js
  // retries RSC requests itself when offline (experimental.useOffline).
  if (
    request.headers.get("RSC") === "1" ||
    url.searchParams.has("_rsc") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/phrp/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (
    ["image", "font", "style", "script", "manifest"].includes(
      request.destination,
    )
  ) {
    event.respondWith(staleWhileRevalidate(event, ASSETS_CACHE));
  }
});

async function handleNavigation(event) {
  const { request } = event;
  const url = new URL(request.url);
  const cache = await caches.open(PAGES_CACHE);
  const network = (async () => {
    const response = (await event.preloadResponse) || (await fetch(request));

    if (response.ok && !response.redirected) {
      await cache.put(request, response.clone());
    }

    return response;
  })();

  // Keep updating the cache even when the cached page wins the race.
  event.waitUntil(network.catch(() => undefined));

  try {
    return await Promise.race([network, rejectAfter(NAVIGATION_TIMEOUT_MS)]);
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });

    if (cached) {
      return cached;
    }

    // Redirect rather than serving the fallback HTML under this URL: Next.js
    // fails to hydrate a page whose URL doesn't match its route.
    if (url.pathname !== OFFLINE_URL && (await cache.match(OFFLINE_URL))) {
      return Response.redirect(new URL(OFFLINE_URL, self.location.origin), 302);
    }

    // Nothing cached yet: keep waiting on the network.
    return network;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

async function staleWhileRevalidate(event, cacheName) {
  const { request } = event;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then(async (response) => {
    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  });

  if (cached) {
    event.waitUntil(network.catch(() => undefined));
    return cached;
  }

  return network;
}

function rejectAfter(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), ms);
  });
}
