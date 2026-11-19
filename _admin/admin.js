/* Thyword website admin (standalone)
 * This admin tool is a single file kept OFF the public website. Open it from your
 * own computer or phone. It loads data/content.js from the GitHub repository,
 * lets you edit it, uploads pictures/videos and publishes everything back to
 * GitHub with an access token that is kept only on this device. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  var CONTENT_PATH = "data/content.js";
  var data = clone(window.SITE_CONTENT || {});
  var loaded = !!window.SITE_CONTENT;
  var fileSha = null;
  var dirty = false;

  /* ---------- connection settings (kept in this browser only) ---------- */
  var conn = {};
  try { conn = JSON.parse(localStorage.getItem("tiwc-admin-conn") || "{}"); } catch (e) {}
  function saveConn() { try { localStorage.setItem("tiwc-admin-conn", JSON.stringify(conn)); } catch (e) {} }
  function connected() { return !!(conn.owner && conn.repo && conn.token); }
  // Guess owner/repo when hosted on GitHub Pages (owner.github.io/repo)
  conn.owner = conn.owner || "christosdaniel";
  conn.repo = conn.repo || "Thyword-Church";
  if (!conn.owner && /\.github\.io$/.test(location.hostname)) {
    conn.owner = location.hostname.split(".")[0];
    conn.repo = location.pathname.split("/").filter(Boolean)[0] || (conn.owner + ".github.io");
  }
  conn.branch = conn.branch || "";

  /* ---------- UI helpers ---------- */
  var toastTimer;
  function toast(msg, err) {
    var t = $("#toast"); t.textContent = msg; t.className = "toast show" + (err ? " err" : "");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.className = "toast"; }, err ? 7000 : 4000);
  }
  function markDirty() { dirty = true; $("#unsaved").classList.remove("hidden"); }
  window.addEventListener("beforeunload", function (e) { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
  function setConnState() {
    var s = $("#connState");
    s.textContent = connected() ? "Connected: " + conn.owner + "/" + conn.repo : "Not connected";
    s.className = "conn" + (connected() ? " ok" : "");
  }

  /* ---------- GitHub API ---------- */
  function gh(path, opts) {
    opts = opts || {};
    return fetch("https://api.github.com/repos/" + conn.owner + "/" + conn.repo + path, {
      method: opts.method || "GET",
      headers: { Authorization: "Bearer " + conn.token, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store"
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.message || ("GitHub error " + r.status)); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  function b64Text(str) { var bytes = new TextEncoder().encode(str), bin = ""; for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(bin); }
  function textFromB64(b64) { var bin = atob(b64.replace(/\s/g, "")), bytes = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return new TextDecoder().decode(bytes); }
  // Picture previews: relative paths are shown from the repository on GitHub
  function mediaUrl(p) {
    if (!p || /^(https?:|data:|blob:)/.test(p)) return p || "";
    if (!conn.owner || !conn.repo || !conn.branch) return p;
    return "https://raw.githubusercontent.com/" + conn.owner + "/" + conn.repo + "/" + encodeURIComponent(conn.branch) + "/" + p.replace(/^\.?\//, "");
  }
  function enc(p) { return p.split("/").map(encodeURIComponent).join("/"); }

  function parseContentFile(text) {
    var start = text.indexOf("{", text.indexOf("SITE_CONTENT")), end = text.lastIndexOf("}");
    return JSON.parse(text.slice(start, end + 1));
  }
  function buildContentFile() {
    return "/*\n * THYWORD INTERNATIONAL WORSHIP CENTRE — WEBSITE CONTENT\n * -------------------------------------------------------\n" +
      " * Everything shown on the website comes from this one file.\n * The easiest way to update it is the admin tool (_admin/Thyword-Admin.html), which edits\n" +
      " * and saves this file for you. You can also edit it by hand. Keep the\n * structure, and put text inside \"quotes\" followed by a comma.\n" +
      " * Last updated: " + new Date().toString() + "\n */\nwindow.SITE_CONTENT = " + JSON.stringify(data, null, 2) + ";\n";
  }

  function detectBranch() {
    if (conn.branch) return Promise.resolve();
    return gh("").then(function (r) { conn.branch = r.default_branch || "main"; saveConn(); });
  }
  function loadFromGitHub() {
    return detectBranch().then(function () { return gh("/contents/" + CONTENT_PATH + "?ref=" + encodeURIComponent(conn.branch)).then(function (f) {
      fileSha = f.sha;
      data = parseContentFile(textFromB64(f.content));
      loaded = true;
      rememberHash();
      dirty = false; $("#unsaved").classList.add("hidden");
      render();
    }); });
  }

  function putFile(path, base64, message) {
    return gh("/contents/" + enc(path) + "?ref=" + encodeURIComponent(conn.branch)).then(function (f) { return f.sha; }, function () { return undefined; })
      .then(function (sha) {
        return gh("/contents/" + enc(path), { method: "PUT", body: { message: message, content: base64, branch: conn.branch, sha: sha } });
      });
  }

  function publish() {
    if (!connected()) { toast("Connect to GitHub first (Settings tab), or use 'Download file'.", true); showTab("connect"); return; }
    if (!loaded) { toast("Load the website content first: Settings tab, Connect & load content.", true); showTab("connect"); return; }
    var btn = $("#publishBtn"); btn.disabled = true; btn.textContent = "Publishing...";
    var doPut = function () {
      return gh("/contents/" + CONTENT_PATH, { method: "PUT", body: { message: "Update website content (" + today() + ")", content: b64Text(buildContentFile()), branch: conn.branch, sha: fileSha || undefined } });
    };
    var before = fileSha ? Promise.resolve() : gh("/contents/" + CONTENT_PATH + "?ref=" + encodeURIComponent(conn.branch)).then(function (f) { fileSha = f.sha; }, function () {});
    before.then(doPut).then(function (r) {
      fileSha = r.content.sha; dirty = false; $("#unsaved").classList.add("hidden");
      toast("Published! Changes appear on the website within 1–2 minutes.");
    }).catch(function (e) {
      if (e.status === 409) toast("Someone else saved changes. Reload from GitHub (Settings tab), then try again.", true);
      else toast("Could not publish: " + e.message, true);
    }).then(function () { btn.disabled = false; btn.innerHTML = "Save &amp; Publish"; });
  }

  function download() {
    if (!loaded) { toast("Load the website content first (Settings tab).", true); return; }
    var blob = new Blob([buildContentFile()], { type: "text/javascript" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "content.js"; a.click();
    toast("Downloaded content.js. Replace data/content.js in the website folder with it.");
  }

  /* ---------- media upload ---------- */
  function slug(name) { return name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "file"; }
  function readDataUrl(blob) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(blob); }); }
  function shrinkImage(file, maxW) {
    // Resizes large photos so the website stays fast (and the repository small)
    return new Promise(function (res) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return res(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, maxW / w);
        if (s === 1 && file.size < 600 * 1024) return res(file);
        var c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(h * s);
        var ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { res(b || file); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { res(file); };
      img.src = URL.createObjectURL(file);
    });
  }
  function videoPoster(file) {
    // Grabs a frame from the video to use as its thumbnail
    return new Promise(function (res) {
      var v = document.createElement("video"); v.muted = true; v.preload = "auto"; v.playsInline = true;
      var done = false, finish = function (b) { if (!done) { done = true; res(b); } };
      v.onloadeddata = function () { v.currentTime = Math.min(2, (v.duration || 4) / 3); };
      v.onseeked = function () {
        var s = Math.min(1, 1280 / v.videoWidth), c = document.createElement("canvas");
        c.width = Math.round(v.videoWidth * s); c.height = Math.round(v.videoHeight * s);
        c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
        c.toBlob(function (b) { finish(b); }, "image/jpeg", 0.82);
      };
      v.onerror = function () { finish(null); };
      setTimeout(function () { finish(null); }, 15000);
      v.src = URL.createObjectURL(file);
    });
  }
  function uploadBlob(blob, folder, name, ext) {
    if (!connected()) return Promise.reject(new Error("Connect to GitHub first (Settings tab) to upload files."));
    var path = "assets/uploads/" + folder + "/" + today() + "-" + slug(name) + "-" + Math.random().toString(36).slice(2, 6) + "." + ext;
    return readDataUrl(blob).then(function (url) {
      return putFile(path, url.split(",")[1], "Upload " + folder.replace(/s$/, "") + ": " + name);
    }).then(function () { return path; });
  }
  function uploadImage(file, folder) {
    return shrinkImage(file, 1600).then(function (b) {
      var ext = b.type === "image/png" ? "png" : b.type === "image/webp" ? "webp" : b.type === "image/gif" ? "gif" : "jpg";
      return uploadBlob(b, folder, file.name, ext);
    });
  }
  var MAX_VIDEO_MB = 50;
  function uploadVideo(file) {
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) return Promise.reject(new Error("This video is larger than " + MAX_VIDEO_MB + " MB. Upload long sermons to YouTube or Facebook and add the link instead."));
    var ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    return Promise.all([uploadBlob(file, "videos", file.name, ext), videoPoster(file).then(function (p) { return p ? uploadBlob(p, "videos", file.name + "-poster", "jpg") : ""; })])
      .then(function (r) { return { src: r[0], poster: r[1] }; });
  }

  /* ---------- form building ---------- */
  // Field definition: [key, label, type, options]
  // types: text, textarea, date, bool, image, video, select, list (comma separated)
  function fieldHtml(obj, f, idPrefix) {
    var key = f[0], label = f[1], type = f[2] || "text", opt = f[3] || {}, val = obj[key], id = idPrefix + "-" + key;
    var cls = opt.full || type === "textarea" || type === "image" || type === "video" ? "full" : "";
    var help = opt.help ? '<div class="help">' + opt.help + "</div>" : "";
    var html;
    if (type === "textarea") html = '<textarea id="' + id + '" data-key="' + key + '" rows="' + (opt.rows || 4) + '">' + esc(val) + "</textarea>";
    else if (type === "bool") return '<div class="' + (opt.full ? "full" : "") + '"><label class="switch' + (val ? " on" : "") + '"><input type="checkbox" data-key="' + key + '" data-type="bool"' + (val ? " checked" : "") + "> " + label + "</label>" + help + "</div>";
    else if (type === "select") html = '<select id="' + id + '" data-key="' + key + '">' + opt.choices.map(function (c) { return "<option" + (c === val ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("") + "</select>";
    else if (type === "image" || type === "video") {
      var isImg = type === "image";
      html = '<div class="media-field">' + (isImg ? '<img class="thumb" src="' + esc(mediaUrl(val)) + '" alt="" onerror="this.style.visibility=\'hidden\'" onload="this.style.visibility=\'visible\'">' : "") +
        '<input type="text" id="' + id + '" data-key="' + key + '" value="' + esc(val) + '" placeholder="' + (isImg ? "assets/uploads/... or https://..." : "Video file path, or YouTube/Facebook link") + '">' +
        '<label class="btn btn-green btn-sm" style="margin:0;color:#fff">Upload<input type="file" hidden accept="' + (isImg ? "image/*" : "video/*") + '" data-upload="' + key + '" data-kind="' + type + '"></label></div>';
    } else if (type === "list") html = '<input type="text" id="' + id + '" data-key="' + key + '" data-type="list" value="' + esc((val || []).join(", ")) + '">';
    else html = '<input type="' + (type === "date" ? "date" : "text") + '" id="' + id + '" data-key="' + key + '" value="' + esc(val) + '">';
    return '<div class="' + cls + '"><label for="' + id + '">' + label + "</label>" + html + help + "</div>";
  }

  function bindFields(root, obj, onChange) {
    $$("[data-key]", root).forEach(function (el) {
      var key = el.getAttribute("data-key"), t = el.getAttribute("data-type");
      el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input", function () {
        if (t === "bool") { obj[key] = el.checked; el.closest(".switch").classList.toggle("on", el.checked); }
        else if (t === "list") obj[key] = el.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        else obj[key] = el.value;
        var th = el.parentNode.querySelector(".thumb"); if (th) th.src = mediaUrl(el.value);
        markDirty(); if (onChange) onChange(key);
      });
    });
    $$("[data-upload]", root).forEach(function (inp) {
      inp.addEventListener("change", function () {
        var file = inp.files[0]; if (!file) return;
        var key = inp.getAttribute("data-upload"), kind = inp.getAttribute("data-kind");
        var label = inp.parentNode; label.firstChild.textContent = "Uploading...";
        var p = kind === "video" ? uploadVideo(file).then(function (r) { obj[key] = r.src; if (r.poster && "poster" in obj) obj.poster = r.poster; if ("type" in obj) obj.type = "file"; return r.src; })
          : uploadImage(file, "images").then(function (path) { obj[key] = path; return path; });
        p.then(function () { markDirty(); render(); toast("Uploaded. Remember to click Save & Publish."); })
          .catch(function (e) { toast(e.message, true); label.firstChild.textContent = "Upload"; });
      });
    });
  }

  function objectPanel(title, help, obj, fields, extra) {
    var div = document.createElement("div"); div.className = "panel";
    div.innerHTML = "<h2>" + title + "</h2>" + (help ? '<p class="help">' + help + "</p>" : "") +
      '<div class="fields">' + fields.map(function (f) { return fieldHtml(obj, f, title.replace(/\W/g, "")); }).join("") + "</div>" + (extra || "");
    bindFields(div, obj);
    return div;
  }

  function listPanel(title, help, arr, fields, opts) {
    opts = opts || {};
    var div = document.createElement("div"); div.className = "panel";
    var head = "<h2>" + title + "</h2>" + (help ? '<p class="help">' + help + "</p>" : "") + (opts.top || "") +
      '<button class="btn btn-red btn-sm add-btn" type="button" style="margin-bottom:1rem">+ Add ' + (opts.noun || "item") + "</button>";
    div.innerHTML = head + '<div class="items"></div>';
    var box = $(".items", div);
    function draw() {
      box.innerHTML = arr.length ? "" : '<p class="help">Nothing here yet. Click "Add ' + (opts.noun || "item") + '".</p>';
      arr.forEach(function (it, i) {
        var el = document.createElement("div"); el.className = "item";
        el.innerHTML = '<div class="item-head"><strong>' + esc(it[opts.titleKey || fields[0][0]] || "(untitled)") + '</strong><span class="item-tools">' +
          '<button class="icon-btn" data-act="up" title="Move up" type="button">&uarr;</button><button class="icon-btn" data-act="down" title="Move down" type="button">&darr;</button>' +
          '<button class="icon-btn del" data-act="del" title="Delete" type="button">&times;</button></span></div>' +
          '<div class="fields">' + fields.map(function (f) { return fieldHtml(it, f, "i" + i + title.replace(/\W/g, "")); }).join("") + "</div>";
        bindFields(el, it, function (k) { if (k === (opts.titleKey || fields[0][0])) $("strong", el).textContent = it[k] || "(untitled)"; });
        $$("[data-act]", el).forEach(function (b) {
          b.onclick = function () {
            var act = b.getAttribute("data-act");
            if (act === "del") { if (!confirm("Delete this " + (opts.noun || "item") + "?")) return; arr.splice(i, 1); }
            if (act === "up" && i > 0) arr.splice(i - 1, 0, arr.splice(i, 1)[0]);
            if (act === "down" && i < arr.length - 1) arr.splice(i + 1, 0, arr.splice(i, 1)[0]);
            markDirty(); draw();
          };
        });
        box.appendChild(el);
      });
    }
    $(".add-btn", div).onclick = function () {
      var n = opts.blank ? opts.blank() : {}; fields.forEach(function (f) { if (!(f[0] in n)) n[f[0]] = f[2] === "bool" ? false : ""; });
      arr.unshift(n); markDirty(); draw(); box.querySelector("input,textarea").focus();
    };
    draw();
    div.redraw = draw;
    return div;
  }

  function ensure() {
    ["settings", "live", "announcement", "hero", "about", "pastor", "contact"].forEach(function (k) { data[k] = data[k] || {}; });
    ["serviceTimes", "events", "words", "photos", "videos", "branches"].forEach(function (k) { data[k] = data[k] || []; });
    data.hero.media = data.hero.media || [];
    data.contact.phones = data.contact.phones || [];
  }

  /* ---------- tabs ---------- */
  var TABS = [
    ["today", "Live & Notice"], ["events", "Events"], ["words", "Pastor's Words"], ["photos", "Pictures"], ["videos", "Videos"],
    ["home", "Home & About"], ["times", "Service Times"], ["contact", "Contact & Branches"], ["connect", "Settings"]
  ];
  var current = "today";
  function showTab(t) { current = t; render(); window.scrollTo(0, 0); }

  function render() {
    ensure();
    $("#tabs").innerHTML = TABS.map(function (t) { return '<button type="button" data-tab="' + t[0] + '"' + (t[0] === current ? ' class="active"' : "") + ">" + t[1] + "</button>"; }).join("");
    $$("#tabs button").forEach(function (b) { b.onclick = function () { showTab(b.getAttribute("data-tab")); }; });
    var P = $("#panels"); P.innerHTML = "";
    setConnState();

    if (!connected() && current !== "connect") {
      var w = document.createElement("div"); w.className = "panel"; w.style.borderLeft = "5px solid var(--gold)";
      w.innerHTML = '<strong>Not connected to GitHub.</strong> <span class="help">Open the <a href="#" id="goConnect">Settings tab</a> and connect with your GitHub token to load the website content, publish changes and upload pictures/videos.</span>';
      P.appendChild(w); $("#goConnect").onclick = function (e) { e.preventDefault(); showTab("connect"); };
    }

    if (current === "today") {
      P.appendChild(objectPanel("Live Stream Status", "Switch these ON when a service is streaming, then click <b>Save &amp; Publish</b>. A red \"We are LIVE\" banner appears on every page and the Watch Live page plays the stream. Switch OFF when the service ends. (YouTube can also be detected automatically if you add an API key in Settings.)", data.live, [
        ["youtube", "We are LIVE on YouTube now", "bool"], ["facebook", "We are LIVE on Facebook now", "bool"],
        ["title", "Name of the live service", "text", { full: true }],
        ["youtubeLiveUrl", "YouTube live video link (optional)", "text", { full: true, help: "Paste the link of today's YouTube live video so it plays on the website." }],
        ["facebookLiveUrl", "Facebook live video link (optional)", "text", { full: true, help: "Paste the link of the Facebook live video so it plays on the website." }]
      ]));
      P.appendChild(objectPanel("Announcement Bar", "A gold strip at the top of every page for short notices.", data.announcement, [
        ["show", "Show the announcement", "bool", { full: true }], ["text", "Announcement text", "textarea", { rows: 2 }], ["link", "Link (optional)", "text", { full: true, help: "e.g. index.html#events or contact.html" }]
      ]));
    }
    if (current === "events") {
      P.appendChild(listPanel("Upcoming Events", "Events show on the home page with a countdown, sorted by date. Past events hide automatically.", data.events, [
        ["title", "Event title"], ["subtitle", "Subtitle / theme"], ["date", "Date", "date"], ["time", "Time", "text", { help: "e.g. 9:00 PM" }],
        ["location", "Venue", "text", { full: true }], ["image", "Flyer / picture", "image"], ["description", "Description", "textarea", { rows: 3 }]
      ], { noun: "event" }));
    }
    if (current === "words") {
      P.appendChild(listPanel("Words from the Pastor", "Short messages and quotes. The newest (by date) shows first on the home page.", data.words, [
        ["text", "Word / quote", "textarea", { rows: 3 }], ["author", "By"], ["date", "Date", "date"], ["image", "Quote graphic (optional)", "image"]
      ], { noun: "word", titleKey: "text", blank: function () { return { author: (data.pastor || {}).name || "", date: today() }; } }));
    }
    if (current === "photos") {
      var albums = []; data.photos.forEach(function (p) { if (p.album && albums.indexOf(p.album) < 0) albums.push(p.album); });
      var top = '<div class="dropzone"><strong>Add many pictures at once</strong><p class="help" style="margin:.3rem 0 .8rem">Choose an album name, then select pictures from your phone or computer. Large photos are resized automatically.</p>' +
        '<div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center"><input type="text" id="bulkAlbum" list="albumList" placeholder="Album, e.g. Sunday Service" style="max-width:260px"><datalist id="albumList">' + albums.map(function (a) { return "<option>" + esc(a) + "</option>"; }).join("") + "</datalist>" +
        '<label class="btn btn-red btn-sm" style="margin:0;color:#fff">Select pictures<input type="file" id="bulkPhotos" multiple accept="image/*" hidden></label></div><div class="progress" id="bulkProgress"></div></div>';
      var lp = listPanel("Pictures", "Pictures appear on the Pictures page (and the first 8 on the home page). Use albums to group them.", data.photos, [
        ["src", "Picture", "image"], ["caption", "Caption"], ["album", "Album"]
      ], { noun: "picture", titleKey: "caption", top: top });
      P.appendChild(lp);
      $("#bulkPhotos").onchange = function () {
        var files = Array.prototype.slice.call(this.files), album = $("#bulkAlbum").value.trim() || "Gallery", prog = $("#bulkProgress"), done = 0, added = [];
        if (!connected()) { toast("Connect to GitHub first (Settings tab) to upload.", true); return; }
        var next = function () {
          if (!files.length) {
            prog.textContent = "Uploaded " + done + " picture(s). Click Save & Publish to show them on the website.";
            Array.prototype.unshift.apply(data.photos, added); markDirty(); lp.redraw(); return;
          }
          var f = files.shift(); prog.textContent = "Uploading " + f.name + " (" + (done + 1) + ")...";
          uploadImage(f, "images").then(function (path) { added.push({ src: path, caption: "", album: album }); done++; next(); })
            .catch(function (e) { toast(f.name + ": " + e.message, true); next(); });
        };
        next();
      };
    }
    if (current === "videos") {
      var top2 = '<div class="dropzone"><strong>Upload a video or short clip</strong><p class="help" style="margin:.3rem 0 .8rem">Short clips up to ' + MAX_VIDEO_MB + ' MB can be uploaded here (MP4 works best). For full sermons, upload to YouTube or Facebook and add the link with "Add video".</p>' +
        '<label class="btn btn-red btn-sm" style="margin:0;color:#fff">Select video<input type="file" id="bulkVideo" accept="video/*" hidden></label><div class="progress" id="vidProgress"></div></div>';
      var vp = listPanel("Videos", "Type: <b>file</b> = uploaded video, <b>youtube</b> = YouTube link, <b>facebook</b> = Facebook video link.", data.videos, [
        ["title", "Title"], ["type", "Type", "select", { choices: ["file", "youtube", "facebook"] }], ["src", "Video (upload, or paste a link)", "video"],
        ["poster", "Thumbnail picture (optional for YouTube)", "image"], ["category", "Category", "text", { help: "e.g. Sermons, Short Clips, Worship" }], ["date", "Date", "date"],
        ["description", "Description", "textarea", { rows: 2 }]
      ], { noun: "video", blank: function () { return { type: "youtube", category: "Sermons", date: today() }; } , top: top2 });
      P.appendChild(vp);
      $("#bulkVideo").onchange = function () {
        var f = this.files[0], prog = $("#vidProgress"); if (!f) return;
        prog.textContent = "Uploading " + f.name + "... please keep this page open.";
        uploadVideo(f).then(function (r) {
          data.videos.unshift({ title: f.name.replace(/\.[^.]+$/, ""), type: "file", src: r.src, poster: r.poster, category: "Short Clips", date: today(), description: "" });
          markDirty(); vp.redraw(); prog.textContent = "Uploaded! Edit the title below, then click Save & Publish.";
        }).catch(function (e) { prog.textContent = ""; toast(e.message, true); });
      };
    }
    if (current === "home") {
      P.appendChild(objectPanel("Home Page Banner", "The big welcome section at the top of the home page.", data.hero, [["heading", "Heading", "text", { full: true }], ["subheading", "Text", "textarea", { rows: 3 }]]));
      P.appendChild(listPanel("Banner Slideshow", "Pictures or short videos that fade behind the welcome text.", data.hero.media, [
        ["type", "Type", "select", { choices: ["image", "video"] }], ["src", "Picture or video file", "image", { help: "For videos, upload the video under the Videos tab and paste its path here." }], ["poster", "Video thumbnail (videos only)", "image"]
      ], { noun: "slide", titleKey: "src", blank: function () { return { type: "image" }; } }));
      P.appendChild(objectPanel("About the Church", "", data.about, [["title", "Heading", "text", { full: true }], ["text", "About text", "textarea", { rows: 5 }], ["verse", "Bible verse", "textarea", { rows: 2 }], ["verseRef", "Verse reference"]]));
      P.appendChild(objectPanel("Head Pastor", "", data.pastor, [["name", "Name"], ["role", "Title / role"], ["photo", "Photo", "image"], ["bio", "Short biography", "textarea", { rows: 4 }]]));
    }
    if (current === "times") {
      P.appendChild(listPanel("Service Times", "Weekly services shown on the home, live and contact pages.", data.serviceTimes, [["name", "Service name"], ["day", "Day"], ["time", "Time"]], { noun: "service" }));
    }
    if (current === "contact") {
      P.appendChild(objectPanel("Contact Details", "", data.contact, [
        ["phones", "Phone numbers (separate with commas)", "list", { full: true }], ["whatsapp", "WhatsApp number (country code, digits only)", "text", { help: "e.g. 233244783760" }],
        ["email", "Church email"], ["officeHours", "Office hours"], ["address", "Address", "text", { full: true }], ["mapQuery", "Map search (what to show on Google Maps)", "text", { full: true }]
      ]));
      P.appendChild(listPanel("Branches", "Branches show in the footer of every page and on the Contact page.", data.branches, [["name", "Branch name"], ["location", "Location / address"], ["phone", "Phone (optional)"]], { noun: "branch" }));
    }
    if (current === "connect") {
      var c = document.createElement("div"); c.className = "panel";
      c.innerHTML = "<h2>Connect to GitHub</h2><p class=\"help\">The website lives in a GitHub repository. Connecting lets this page publish your changes and upload pictures and videos. Your token is saved only in this browser. Never share it.</p>" +
        '<ol class="steps"><li>Sign in to GitHub and open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Fine-grained token</a>.</li><li>Give it a name (e.g. "Church website"), choose an expiry, and under <b>Repository access</b> select only the website repository.</li><li>Under <b>Permissions → Repository permissions</b>, set <b>Contents</b> to <b>Read and write</b>.</li><li>Click <b>Generate token</b>, copy it, and paste it below.</li></ol>' +
        '<div class="fields"><div><label>GitHub username / organisation</label><input id="c-owner" value="' + esc(conn.owner) + '" placeholder="e.g. christosdaniel"></div>' +
        '<div><label>Repository name</label><input id="c-repo" value="' + esc(conn.repo) + '" placeholder="e.g. Thyword-Church"></div>' +
        '<div><label>Branch the website is published from</label><input id="c-branch" value="' + esc(conn.branch) + '" placeholder="Leave empty to detect automatically"></div>' +
        '<div><label>Access token</label><input id="c-token" type="password" value="' + esc(conn.token) + '" placeholder="github_pat_..."></div></div>' +
        '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem"><button class="btn btn-green btn-sm" id="c-save" type="button">Connect &amp; load content</button><button class="btn btn-outline-dark btn-sm" id="c-out" type="button">Disconnect this browser</button></div>';
      P.appendChild(c);
      $("#c-save").onclick = function () {
        conn = { owner: $("#c-owner").value.trim(), repo: $("#c-repo").value.trim(), branch: $("#c-branch").value.trim(), token: $("#c-token").value.trim() };
        if (!connected()) { toast("Please fill in all the fields.", true); return; }
        if (dirty && !confirm("Loading from GitHub will replace your unsaved changes on this page. Continue?")) return;
        saveConn();
        loadFromGitHub().then(function () { toast("Connected. Latest content loaded."); }).catch(function (e) { toast(e.status === 401 ? "GitHub did not accept the token. Check it was copied fully and has not expired." : e.status === 404 ? "Repository or file not found. Check the username, repository name and branch, and that the token has access to this repository." : "Could not connect: " + e.message, true); setConnState(); });
      };
      $("#c-out").onclick = function () { conn = { branch: "main" }; saveConn(); fileSha = null; toast("Disconnected. The token was removed from this browser."); render(); };

      var pw = document.createElement("div"); pw.className = "panel";
      pw.innerHTML = '<h2>Admin Password</h2><p class="help">Change the password used to open this admin page. After changing it, click <b>Save &amp; Publish</b>. The new password works on all devices a few minutes later.</p>' +
        '<div class="fields"><div><label>New password</label><input type="password" id="pw1" autocomplete="new-password"></div><div><label>Repeat new password</label><input type="password" id="pw2" autocomplete="new-password"></div></div>' +
        '<button class="btn btn-green btn-sm" id="pwSave" type="button" style="margin-top:1rem">Change password</button>';
      P.appendChild(pw);
      $("#pwSave").onclick = function () {
        var a = $("#pw1").value, b = $("#pw2").value;
        if (a.length < 8) { toast("Use at least 8 characters.", true); return; }
        if (a !== b) { toast("The two passwords do not match.", true); return; }
        window.__setAdminPassword(a).then(function () {
          try {
            sessionStorage.setItem("tiwc-admin-ok", data.settings.adminPasswordHash);
            if (localStorage.getItem("tiwc-admin-remember")) localStorage.setItem("tiwc-admin-remember", data.settings.adminPasswordHash);
          } catch (e) {}
          $("#pw1").value = $("#pw2").value = ""; toast("Password changed. Now click Save & Publish.");
        });
      };

      P.appendChild(objectPanel("Website Settings", "", data.settings, [
        ["churchName", "Church name"], ["tagline", "Tagline"], ["motto", "Motto"], ["logo", "Logo", "image"],
        ["adminEmail", "Admin email (receives subscriptions & messages)", "text", { full: true, help: "Subscribe and contact forms are delivered to this address by the free FormSubmit.co service. The first time someone submits, FormSubmit sends a one-time activation email to this address. Click the link in it." }],
        ["formEndpoint", "Custom form endpoint (optional)", "text", { full: true, help: "Leave empty to use the admin email above. If you use Formspree, paste your form URL here (e.g. https://formspree.io/f/xxxx)." }],
        ["facebookPageUrl", "Facebook page link", "text", { full: true }], ["youtubeUrl", "YouTube channel link", "text", { full: true }],
        ["youtubeChannelId", "YouTube channel ID (starts with UC)", "text", { help: "YouTube → your channel → About/Share → Copy channel ID." }],
        ["youtubeApiKey", "YouTube Data API key (optional)", "text", { help: "Enables automatic \"LIVE\" detection and shows your latest YouTube uploads. Create a free key at console.cloud.google.com (YouTube Data API v3) and restrict it to your website address." }]
      ]));
    }
  }

  $("#publishBtn").onclick = publish;
  $("#downloadBtn").onclick = download;

  /* ---------- admin login ----------
   * The admin page is hidden from the public website and protected by a password.
   * Only a SHA-256 fingerprint of the password is stored in content.js. Publishing
   * also needs the GitHub token, which only administrators have. */
  // Pure-JavaScript SHA-256, so the login works anywhere, even when the file is opened from a phone or computer.
  function sha256hex(str) {
    var K = [], H = [], i, j, isP = function (n) { for (var f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; }, frac = function (x) { return ((x - Math.floor(x)) * 4294967296) | 0; };
    for (var n = 2, c = 0; c < 64; n++) if (isP(n)) { if (c < 8) H[c] = frac(Math.pow(n, 1 / 2)); K[c++] = frac(Math.pow(n, 1 / 3)); }
    var bytes = Array.prototype.slice.call(new TextEncoder().encode(str)), bitLen = bytes.length * 8;
    bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (bitLen >>> (i * 8)) & 255);
    var rotr = function (x, r) { return (x >>> r) | (x << (32 - r)); };
    for (i = 0; i < bytes.length; i += 64) {
      var W = [], a = H[0], b = H[1], c2 = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (j = 0; j < 64; j++) {
        if (j < 16) W[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16) | (bytes[i + j * 4 + 2] << 8) | bytes[i + j * 4 + 3];
        else { var s0 = rotr(W[j - 15], 7) ^ rotr(W[j - 15], 18) ^ (W[j - 15] >>> 3), s1 = rotr(W[j - 2], 17) ^ rotr(W[j - 2], 19) ^ (W[j - 2] >>> 10); W[j] = (W[j - 16] + s0 + W[j - 7] + s1) | 0; }
        var t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[j] + W[j]) | 0;
        var t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c2) ^ (b & c2))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c2; c2 = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c2) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (x) { return ("00000000" + (x >>> 0).toString(16)).slice(-8); }).join("");
  }
  function sha256(text) { return Promise.resolve(sha256hex(text)); }
  // Starting password: Thyword@2026 (change it in Settings > Admin Password).
  var DEFAULT_HASH = "0ee99b61774bb1a7df638ca707ce5ac95518978bd7fcadc903b8baba90cab0ed";
  function rememberHash() { var h = (data.settings || {}).adminPasswordHash; if (h) try { localStorage.setItem("tiwc-admin-hash", h); } catch (e) {} }

  function expectedHash() {
    var h = (data.settings || {}).adminPasswordHash;
    if (!h) try { h = localStorage.getItem("tiwc-admin-hash"); } catch (e) {}
    return h || DEFAULT_HASH;
  }
  // "Keep me logged in" stores the login on this device (used by the iPhone app)
  function unlocked() {
    var h = expectedHash();
    try { return sessionStorage.getItem("tiwc-admin-ok") === h || localStorage.getItem("tiwc-admin-remember") === h; } catch (e) { return false; }
  }
  function start() {
    $("#gate").remove();
    if (!connected()) current = "connect";
    render();
    if (connected()) loadFromGitHub().catch(function (e) { toast("Could not load from GitHub: " + e.message, true); });
  }
  $("#logoutBtn").onclick = function () {
    if (dirty && !confirm("You have unsaved changes. Log out anyway?")) return;
    dirty = false;
    try { sessionStorage.removeItem("tiwc-admin-ok"); localStorage.removeItem("tiwc-admin-remember"); } catch (e) {}
    location.reload();
  };
  window.__setAdminPassword = function (pw) { return sha256(pw).then(function (h) { data.settings.adminPasswordHash = h; rememberHash(); markDirty(); }); };
  if (unlocked()) start();
  else {
    $("#gateForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var pw = $("#gatePass").value.trim();
      sha256(pw).then(function (h) {
        if (h === expectedHash() || (!loaded && h === DEFAULT_HASH)) {
          try {
            sessionStorage.setItem("tiwc-admin-ok", expectedHash());
            if ($("#gateRemember").checked) localStorage.setItem("tiwc-admin-remember", expectedHash());
          } catch (er) {}
          start();
        }
        else { $("#gateMsg").textContent = "Incorrect password. Check capital letters (the first letter T is a capital)."; $("#gatePass").select(); }
      });
    });
    $("#gateShow").addEventListener("click", function () { var i = $("#gatePass"); i.type = i.type === "password" ? "text" : "password"; });
  }
})();
