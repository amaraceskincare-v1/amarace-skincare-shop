const CACHE_CONFIG_URL = '/cache.json';
let config = null;

// Fetch configuration
async function fetchConfig() {
  try {
    const response = await fetch(CACHE_CONFIG_URL);
    config = await response.json();
    return config;
  } catch (error) {
    console.error('Failed to fetch cache configuration:', error);
    return null;
  }
}

// Helper to check if a URL matches patterns
function matchesPattern(url, patterns) {
  if (!patterns) return false;
  const urlObj = new URL(url, self.location.origin);
  const path = urlObj.pathname;

  return patterns.some(pattern => {
    // Check if it's a full URL (CDN resources)
    if (pattern.startsWith('http')) {
      return url.startsWith(pattern.replace(/\*\*/g, ''));
    }

    // Basic glob-like matching for internal paths
    const regexSource = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/\\\*\\\*/g, '.*')           // ** -> .*
      .replace(/\\\*/g, '[^/]*');           // *  -> [^/]*

    try {
      const regex = new RegExp('^' + regexSource + '$');
      return regex.test(path) || path === pattern;
    } catch (e) {
      return path.includes(pattern.replace(/\*/g, ''));
    }
  });
}

// Lifecycle: Install
self.addEventListener('install', event => {
  console.log('[SW] Install event started');
  event.waitUntil(
    (async () => {
      const config = await fetchConfig();
      if (config && config.precache) {
        console.log('[SW] Precaching files:', config.precache);
        const cache = await caches.open('precache-v1');
        // Cache files one by one to avoid one failure breaking everything
        for (const url of config.precache) {
          try {
            await cache.add(url);
          } catch (e) {
            console.warn(`[SW] Failed to cache ${url}:`, e);
          }
        }
      }
      if (config && config.skipWaiting) {
        self.skipWaiting();
      }
    })()
  );
});

// Lifecycle: Activate
self.addEventListener('activate', event => {
  console.log('[SW] Activate event started');
  event.waitUntil(
    (async () => {
      const config = await fetchConfig() || config;
      if (config && config.cleanupOnActivate) {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter(key => key !== 'precache-v1').map(key => caches.delete(key))
        );
      }
      if (config && config.clientsClaim) {
        await self.clients.claim();
      }
    })()
  );
});

// Fetch event handler
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  // Skip browser extensions and other non-http(s) requests
  if (!url.startsWith('http')) return;

  if (!config) {
    event.respondWith(
      (async () => {
        await fetchConfig();
        return handleRequest(request);
      })()
    );
  } else {
    event.respondWith(handleRequest(request));
  }
});

async function handleRequest(request) {
  if (!config) return fetch(request);

  const url = request.url;

  // Find strategy
  let strategy = null;
  let cacheName = 'default-cache';

  // Check runtime caching first
  if (config.runtimeCaching) {
    for (const [key, settings] of Object.entries(config.runtimeCaching)) {
      if (matchesPattern(url, settings.patterns)) {
        strategy = settings.strategy;
        cacheName = settings.cacheName;
        break;
      }
    }
  }

  // Check defined strategies
  if (!strategy && config.cacheStrategies) {
    for (const [key, settings] of Object.entries(config.cacheStrategies)) {
      if (matchesPattern(url, settings.patterns)) {
        strategy = settings.strategy;
        cacheName = settings.cacheName;
        break;
      }
    }
  }

  if (strategy === 'CacheFirst') {
    return cacheFirst(request, cacheName);
  } else if (strategy === 'NetworkFirst') {
    return networkFirst(request, cacheName);
  }

  // Check precache as fallback
  const precache = await caches.open('precache-v1');
  const precachedResponse = await precache.match(request);
  if (precachedResponse) return precachedResponse;

  return fetch(request);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (request.destination === 'image' && config.offlineFallback?.image) {
      return caches.match(config.offlineFallback.image);
    }
    throw error;
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    if (request.mode === 'navigate' && config.offlineFallback?.page) {
      const fallback = await caches.match(config.offlineFallback.page);
      if (fallback) return fallback;
    }
    throw error;
  }
}
