// TIWC admin app: lets the app open quickly and offline. Always tries the
// network first so the newest version is used whenever there is a connection.
var CACHE = "tiwc-admin-2026-11-20.1";
var FILES = ["./", "index.html", "manifest.webmanifest", "logo.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // GitHub API etc. go straight to the network
  // cache: "no-store" skips the browser cache so a new version is picked up straight away
  e.respondWith(fetch(e.request, { cache: "no-store" }).then(function (res) {
    var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return res;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); }); }));
});
