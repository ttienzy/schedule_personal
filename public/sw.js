const CACHE_NAME = 'schedule-app-v1';
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/src/main.tsx',
    '/src/App.tsx',
    '/src/index.css',
];

// Install — cache shell app
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(SHELL_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — xóa cache cũ
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-http(s) requests (chrome-extension, etc.)
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip Supabase requests — luôn dùng network
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response để cache
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                // Network fail → dùng cache
                return caches.match(event.request).then((response) => {
                    return response || new Response('Offline', { status: 503 });
                });
            })
    );
});
