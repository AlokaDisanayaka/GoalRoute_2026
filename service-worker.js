// Cache name
var cacheName = "goalroute-cache-v2";

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

// Load from cache first, then try network
self.addEventListener("fetch", function(event) {

    event.respondWith(
        caches.match(event.request).then(function(response) {

            if (response) {
                return response;
            }

            return fetch(event.request);
        })
    );
});
