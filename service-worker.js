
// cache name
const cacheStaticName = 'static-cache';
const cacheStaticNameV1 = 'static-cache-v1';
// cache some route assets so that during "install" phrase, we only cache some main static assets
// because "fetch" phrase won't be invoke when first painting! so that should offer a way of dynamic cache.
const dynamicCache = 'dynamic-cache-v1';
// assets to cache
const assets = [
    '/',
    'icons/favicon.ico',
    'icons/icon-48x48.png',
    'icons/icon-96x96.png',
    'icons/icon-144x144.png',
    'icons/icon-192x192.png',
    '/manifest.json',
    'fallback.html'
]
// install event listener
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheStaticName).then(cache => {
            cache.addAll(assets);
        })
    );
    self.skipWaiting();
});

// during the activate phrase, check if there is some old version assets existing
// keys means cache name here
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                    keys
                    .filter(key => key !== cacheStaticName && key !== dynamicCache)
                    .map(key => caches.delete(key))
                );
        })
    )
    console.log('serviceworker has been activated');
});

// define fetch event listener to decide if return cache or request server, that's to say,
// if request meet some assets in cache then return cache, otherwise request again to the server
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(res => {
            return res || fetch(event.request).then(fetchRes => {
                caches.open(dynamicCache).then(cache => {
                    cache.put(event.request.url, fetchRes.clone());
                    return fetchRes;
                })
            }).catch(err => {
                return caches.match('./fallback.html');
            });
        })
    );
});