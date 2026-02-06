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
  return patterns.some(pattern => {
    // Basic glob-like matching
    const regex = new RegExp('^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$');
    const path = new URL(url, self.location.origin).pathname;
    return regex.test(path) || url.includes(pattern);
  });
}

// Lifecycle: Install
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const config = await fetchConfig();
      if (config && config.precache) {
        const cache = await caches.open('precache-v1');
        await cache.addAll(config.precache);
      }
      if (config && config.skipWaiting) {
        self.skipWaiting();
      }
    })()
  );
});

// Lifecycle: Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
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
  for (const [key, settings] of Object.entries(config.runtimeCaching || {})) {
    if (matchesPattern(url, settings.patterns)) {
      strategy = settings.strategy;
      cacheName = settings.cacheName;
      break;
    }
  }

  // Check defined strategies
  if (!strategy) {
    for (const [key, settings] of Object.entries(config.cacheStrategies || {})) {
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

  return fetch(request);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If image fails, return offline placeholder if configured
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
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    // If page fails, return offline fallback page if configured
    if (request.mode === 'navigate' && config.offlineFallback?.page) {
      return caches.match(config.offlineFallback.page);
    }
    throw error;
  }
}
