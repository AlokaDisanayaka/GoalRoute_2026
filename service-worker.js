// Cache name
var cacheName = "goalroute-cache-v7";

// Files saved for offline use
var filesToCache = [
    "/",
    "/index.html",
    "/manifest.json",
    "/css/style.css",
    "/js/script.js",
    "/js/api.js",
    "/js/map.js",
    "/json/data.json",
    "/images/ball.png",
    "/images/maskable-icon.png",
    "/images/footballer.png",
    "/images/hero.jpg",
    "/images/pwa-wide.jpg",
    "/images/pwa-mobile.jpg",
    "/images/stadiumIC.png",
    "/images/restaurantIC.png",
    "/images/hotelIC.png",
    "/images/tourist_attractionIC.png"
];

// Install service worker and cache app files
self.addEventListener("install", function(event) {

    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        })
    );
});

// Delete old caches
self.addEventListener("activate", function(event) {

    event.waitUntil(
        caches.keys().then(function(cacheNames) {

            return Promise.all(
                cacheNames.map(function(name) {

                    if (name !== cacheName) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

// Try network first so the newest code is used.
// If offline, use the cached version.
self.addEventListener("fetch", function(event) {

    event.respondWith(
        fetch(event.request)
            .then(function(networkResponse) {

                return networkResponse;
            })
            .catch(function() {

                return caches.match(event.request);
            })
    );
});
