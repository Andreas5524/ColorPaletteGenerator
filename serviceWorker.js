const cacheName = "47812ea5e8af65e3c2513f9560750ec0";
const filesToCache = [
    "./",
    "index.html",
    "print.css",
    "scrollbar.css",
    "styles.css",
    "tooltips.css",
    "javaScript.js",
    "tooltips.js",
    "icon192.png",
    "icon512.png",
    "iconMaskable192.png",
    "iconMaskable512.png",
    "manifest.webmanifest"
];

self.oninstall = function (event) {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(filesToCache))
    );
}

self.onactivate = function (event) {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cache => {
                if (cache !== cacheName)
                    return caches.delete(cache);
            }))
        })
    );
}

self.onfetch = function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
}