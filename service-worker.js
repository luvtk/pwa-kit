
// cache name
const cacheStaticName = 'static-cache';
const cacheStaticNameV1 = 'static-cache-v1';
// cache some route assets so that during "install" phrase, we only cache some main static assets
// because "fetch" phrase won't be invoke when first painting! so that should offer a way of dynamic cache.
const dynamicCache = 'dynamic-cache-v2';
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
        }) && self.clients.claim()
    );
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
self.addEventListener('notificationclick', function (e) {
    var action = e.action;
    console.log(`action tag: ${e.notification.tag}`, `action: ${action}`);
    e.waitUntil(
        // 获取所有clients
        self.clients.matchAll().then(function (clients) {
            if (!clients || clients.length === 0) {
                self.clients.openWindow && self.clients.openWindow('https://9bcbd0256801.ngrok.io')
                return;
            }
            clients[0].focus;
            clients.forEach(function (client) {
                // 使用postMessage进行通信
                client.postMessage(action);
            });
        })
    );
    e.notification.close();
});

self.addEventListener('push', function (e) {
    var data = e.data;
    if (e.data) {
        var title = 'PWA即学即用';
        var options = {
            body: data.text(),
            icon: 'icons/icon-48x48.png',
            actions: [{
                action: 'show-book',
                title: '去看看'
            }, {
                action: 'contact-me',
                title: '联系我'
            }],
            tag: 'pwa-starter',
            renotify: true
        };
        self.registration.showNotification(title, options);        
    } 
    else {
        console.log('push没有任何数据');
    }
});