const SW_VERSION = '__APP_VERSION__';
const STATIC_CACHE = `ponto-static-${SW_VERSION}`;
const PAGES_CACHE = `ponto-pages-${SW_VERSION}`;
const APP_SHELL_URLS = [
    '/manifest.webmanifest',
    '/favicon.ico',
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/icon-192.png',
    '/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => ![STATIC_CACHE, PAGES_CACHE].includes(key))
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    const isStaticAsset =
        url.pathname.startsWith('/build/') ||
        APP_SHELL_URLS.includes(url.pathname) ||
        /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(url.pathname);

    if (isStaticAsset) {
        event.respondWith(
            caches.open(STATIC_CACHE).then(async (cache) => {
                const cached = await cache.match(request);
                const network = fetch(request)
                    .then((response) => {
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }

                        return response;
                    })
                    .catch(() => cached);

                return cached || network;
            }),
        );
        return;
    }

    // For HTML pages, always prefer fresh content.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then(async (response) => {
                if (response.ok) {
                    const cache = await caches.open(PAGES_CACHE);
                    cache.put(request, response.clone());
                }

                return response;
            }).catch(async () => {
                const pagesCache = await caches.open(PAGES_CACHE);
                const cachedPage = await pagesCache.match(request);
                if (cachedPage) {
                    return cachedPage;
                }

                const rootFallback = await pagesCache.match('/');
                if (rootFallback) {
                    return rootFallback;
                }

                return new Response('Offline', {
                    status: 503,
                    statusText: 'Offline',
                });
            }),
        );
        return;
    }

    // For other GET requests, use network-first fallback.
    event.respondWith(
        fetch(request).catch(async () => {
            const staticCache = await caches.open(STATIC_CACHE);
            return staticCache.match(request);
        }),
    );
});
