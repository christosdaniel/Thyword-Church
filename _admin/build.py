"""Builds the admin tool in two forms. Run from the repository root:

    python3 _admin/build.py

1. _admin/Thyword-Admin.html: a single file kept on a computer. It is NOT
   published (GitHub Pages skips folders whose names start with an underscore).
2. tiwc-admin-9k2x/: the same admin as an installable phone app (web app).
   It is published at an unlisted address so it can be added to an iPhone or
   Android Home Screen. Nothing on the website links to it, search engines are
   told not to index it, and it needs the admin password. Changing the website
   also needs the GitHub token, which only the administrator has.
"""
import base64, io, json, os
from PIL import Image

APP_DIR = "tiwc-admin-9k2x"
VERSION = "2026-11-19.3"   # bump to make installed apps fetch the new version

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
here = os.path.join(root, "_admin")
app = os.path.join(root, APP_DIR)
os.makedirs(app, exist_ok=True)

logo = Image.open(os.path.join(root, "assets/images/logo.png")).convert("RGBA")

def logo_uri(size):
    im = logo.copy(); im.thumbnail((size, size))
    buf = io.BytesIO(); im.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

def icon(size, path):
    # Logo on a white square, so iPhone doesn't show a black background
    bg = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    im = logo.copy(); pad = int(size * 0.1); im.thumbnail((size - 2 * pad, size - 2 * pad), Image.LANCZOS)
    bg.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    bg.convert("RGB").save(path, "PNG", optimize=True)

template = open(os.path.join(here, "admin.template.html"), encoding="utf-8").read()
css = open(os.path.join(root, "assets/css/style.css"), encoding="utf-8").read()
js = open(os.path.join(here, "admin.js"), encoding="utf-8").read()

def build(app_head, app_script, logo_src):
    return (template.replace("{{SITE_CSS}}", css).replace("{{ADMIN_JS}}", js)
            .replace("{{APP_HEAD}}", app_head).replace("{{APP_SCRIPT}}", app_script)
            .replace("{{LOGO}}", logo_src))

# 1. Single-file version
out = os.path.join(here, "Thyword-Admin.html")
open(out, "w", encoding="utf-8").write(build("", "", logo_uri(120)))
print("Wrote", out)

# 2. Phone app version
icon(180, os.path.join(app, "apple-touch-icon.png"))
icon(192, os.path.join(app, "icon-192.png"))
icon(512, os.path.join(app, "icon-512.png"))
im = logo.copy(); im.thumbnail((120, 120)); im.save(os.path.join(app, "logo.png"), optimize=True)

manifest = {
    "name": "TIWC Website Admin",
    "short_name": "TIWC Admin",
    "description": "Update the Thyword International Worship Centre website.",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "background_color": "#072e2d",
    "theme_color": "#072e2d",
    "icons": [
        {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
    ],
}
json.dump(manifest, open(os.path.join(app, "manifest.webmanifest"), "w"), indent=2)

head = """<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#072e2d">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="TIWC Admin">
<link rel="apple-touch-icon" href="apple-touch-icon.png">"""
script = """<script>
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
</script>"""
open(os.path.join(app, "index.html"), "w", encoding="utf-8").write(build(head, script, "logo.png"))

sw = """// TIWC admin app: lets the app open quickly and offline. Always tries the
// network first so the newest version is used whenever there is a connection.
var CACHE = "tiwc-admin-%s";
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
  e.respondWith(fetch(e.request).then(function (res) {
    var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return res;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); }); }));
});
""" % VERSION
open(os.path.join(app, "sw.js"), "w", encoding="utf-8").write(sw)
print("Wrote", app)
