/* Thyword International Worship Centre: site script
 * Loads data/content.js and builds every page from it, so the site can be
 * updated from the Admin page without touching any HTML. */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function store(key, val) {
    try {
      if (val === undefined) return sessionStorage.getItem(key);
      sessionStorage.setItem(key, val);
    } catch (e) { return null; }
  }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var ICON = {
    phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    cal: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    play: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    tv: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="m17 2-5 5-5-5"/></svg>',
    image: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
    chat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    church: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M10 4h4M6 22V11l6-5 6 5v11M2 22h20M10 22v-5h4v5"/></svg>',
    fb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>',
    yt: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>',
    wa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.3A11.8 11.8 0 0 0 1.8 17.8L.1 24l6.3-1.7a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.5z"/></svg>'
  };
  function big(svg, size) { return svg.replace(/width="\d+" height="\d+"/, 'width="' + size + '" height="' + size + '"'); }

  /* ---------- content loading ---------- */
  function loadScript(src, done) {
    var s = document.createElement("script");
    // A timestamp stops browsers showing yesterday's copy after an update.
    s.src = src + "?v=" + Date.now();
    s.onload = s.onerror = done;
    document.head.appendChild(s);
  }
  function loadContent(cb) {
    // content.js = everything set in the admin; youtube.js = videos collected from the YouTube channel
    var left = 2, done = function () { if (--left === 0) cb(window.SITE_CONTENT || {}); };
    loadScript("data/content.js", done);
    loadScript("data/youtube.js", done);
  }

  var C, S;

  /* ---------- dates ---------- */
  function eventDate(ev) {
    var d = (ev.date || "").split("-").map(Number);
    if (d.length < 3 || !d[0]) return null;
    var h = 0, m = 0;
    var t = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i.exec(ev.time || "");
    if (t) {
      h = +t[1]; m = +(t[2] || 0);
      if (t[3]) { var pm = t[3].toLowerCase() === "pm"; if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
    }
    return new Date(d[0], d[1] - 1, d[2], h, m);
  }
  function upcomingEvents() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return (C.events || []).filter(function (e) {
      var d = eventDate(e); return d && d >= today;
    }).sort(function (a, b) { return eventDate(a) - eventDate(b); });
  }
  // Past events: newest first. They always stay at least 7 days. After that they stay until deleted,
  // unless "Remove past events after (days)" is set in Admin > Settings.
  var MIN_PAST_DAYS = 7;
  function pastEvents() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var keep = parseInt(S.pastEventDays, 10);
    var limit = keep > 0 ? Math.max(keep, MIN_PAST_DAYS) : 0;
    return (C.events || []).filter(function (e) {
      var d = eventDate(e);
      if (!d || d >= today) return false;
      return !limit || daysSince(e) <= limit;
    }).sort(function (a, b) { return eventDate(b) - eventDate(a); });
  }
  function daysSince(ev) {
    var d = eventDate(ev); if (!d) return 0;
    var day = new Date(d); day.setHours(0, 0, 0, 0);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((today - day) / 864e5);
  }
  function fmtDate(iso) {
    var d = (iso || "").split("-").map(Number);
    if (d.length < 3) return iso || "";
    return d[2] + " " + MONTHS[d[1] - 1] + " " + d[0];
  }

  /* ---------- links ---------- */
  function waLink(text) {
    var n = String((C.contact || {}).whatsapp || "").replace(/\D/g, "");
    return n ? "https://wa.me/" + n + (text ? "?text=" + encodeURIComponent(text) : "") : "";
  }
  function telLink(p) { return "tel:" + String(p).replace(/[^\d+]/g, ""); }
  function youtubeId(url) {
    var m = /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/.exec(url || "");
    return m ? m[1] : "";
  }

  /* ---------- header & footer ---------- */
  /* ---------- branches / lists helpers ---------- */
  function slugify(t) { return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "branch"; }
  function lines(v) { return (Array.isArray(v) ? v : String(v || "").split(/\n/)).map(function (x) { return String(x).trim(); }).filter(Boolean); }
  function digits(v) { return String(v || "").replace(/\D/g, ""); }
  function waTo(number, text) { var n = digits(number); if (n.charAt(0) === "0") n = "233" + n.slice(1); return n ? "https://wa.me/" + n + (text ? "?text=" + encodeURIComponent(text) : "") : ""; }
  // Headquarters first, then the rest in the order set in the admin
  function branchList() {
    var list = (C.branches || []).map(function (b) { var o = {}; for (var k in b) o[k] = b[k]; o.id = slugify(b.name); return o; });
    return list.filter(function (b) { return b.hq; }).concat(list.filter(function (b) { return !b.hq; }));
  }
  function hqBranch() { return branchList().filter(function (b) { return b.hq; })[0] || null; }
  function copyText(text, btn) {
    var done = function () { if (!btn) return; var t = btn.textContent; btn.textContent = "Copied!"; btn.classList.add("copied"); setTimeout(function () { btn.textContent = t; btn.classList.remove("copied"); }, 1600); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    else fallback();
    function fallback() { var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} ta.remove(); }
  }

  function navDrop(label, items, pages) {
    var cur = document.body.getAttribute("data-page"), on = pages.indexOf(cur) >= 0;
    return '<li class="has-drop"><button type="button" class="drop-btn' + (on ? " active" : "") + '" aria-expanded="false">' + label +
      ' <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>' +
      '<ul class="drop">' + items.map(function (i) { return '<li><a href="' + i[0] + '">' + i[1] + "</a></li>"; }).join("") + "</ul></li>";
  }
  function navLink(href, label, page) {
    var cur = document.body.getAttribute("data-page");
    return '<li><a href="' + href + '"' + (cur === page ? ' class="active"' : "") + ">" + label + "</a></li>";
  }

  function renderHeader() {
    var ct = C.contact || {};
    var phone = (ct.phones || [])[0];
    var top = '<div class="topbar"><div class="container"><div class="topbar-contact">' +
      (phone ? '<span>' + ICON.phone + '<a href="' + telLink(phone) + '">' + esc(phone) + "</a></span>" : "") +
      (ct.email ? '<span class="hide-sm">' + ICON.mail + '<a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a></span>" : "") +
      (ct.address ? '<span class="hide-sm">' + ICON.pin + esc(ct.address.split(",").slice(0, 2).join(",")) + "</span>" : "") +
      '</div><div class="topbar-social">' +
      (S.facebookPageUrl ? '<a href="' + esc(S.facebookPageUrl) + '" target="_blank" rel="noopener" aria-label="Facebook">' + ICON.fb + "</a>" : "") +
      (S.youtubeUrl ? '<a href="' + esc(S.youtubeUrl) + '" target="_blank" rel="noopener" aria-label="YouTube">' + ICON.yt + "</a>" : "") +
      (waLink() ? '<a href="' + waLink() + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICON.wa + "</a>" : "") +
      "</div></div></div>";

    var ann = C.announcement || {};
    var annHtml = "";
    if (ann.show && ann.text && store("tiwc-ann-closed") !== ann.text) {
      annHtml = '<div class="announce" id="announce">' + esc(ann.text) +
        (ann.link ? ' <a href="' + esc(ann.link) + '">Learn more</a>' : "") +
        '<button class="announce-close" aria-label="Close announcement">&times;</button></div>';
    }

    var header = top + annHtml + '<div class="live-bar hidden" id="liveBar"></div>' +
      '<header class="site-header"><div class="container">' +
      '<a class="brand" href="index.html" aria-label="Home"><img src="' + esc(S.logo || "assets/images/logo.png") + '" alt="' + esc(S.churchName) + ' logo">' +
      '<span class="brand-text"><span class="brand-name">' + esc(S.churchName) + '</span><span class="brand-tag">' + esc(S.tagline) + "</span></span></a>" +
      '<a class="btn btn-gold btn-sm mobile-sermons" href="sermons.html">' + big(ICON.play, 12) + ' Sermons</a>' +
      '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>' +
      '<nav class="main-nav" aria-label="Main"><ul>' +
      navLink("index.html", "Home", "home") +
      navDrop("About", [["index.html#about", "About Us"], ["branches.html", "Branches &amp; Pastors"], ["branches.html#trustees", "Board of Trustees"]], ["branches"]) +
      navLink("bibleschool.html", "Bible School", "bibleschool") +
      navLink("index.html#events", "Events", "") +
      navDrop("Media", [["sermons.html", "Watch Sermons"], ["pictures.html", "Pictures"], ["videos.html", "Videos"], ["live.html", "Watch Live"]], ["pictures", "videos", "sermons", "live"]) +
      navLink("give.html", "Give", "give") +
      navLink("contact.html", "Contact", "contact") +
      '<li class="nav-cta"><a class="btn btn-gold btn-sm' + (document.body.getAttribute("data-page") === "sermons" ? " is-current" : "") + '" href="sermons.html">' + big(ICON.play, 14) + ' Watch Sermons</a></li>' +
      '<li class="nav-live"><a class="btn btn-red btn-sm" href="live.html">' + big(ICON.tv, 16) + ' Watch Live</a><span class="live-badge">LIVE</span></li>' +
      "</ul></nav></div></header>";

    $("#site-header").innerHTML = header;

    var toggle = $(".nav-toggle"), nav = $(".main-nav");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    $$(".main-nav a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); $$(".has-drop.open").forEach(function (d) { d.classList.remove("open"); }); }); });
    // Drop-down menus: tap/click to open (hover also opens them on computers)
    $$(".drop-btn").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var li = b.parentNode, open = !li.classList.contains("open");
        $$(".has-drop.open").forEach(function (d) { if (d !== li) { d.classList.remove("open"); $(".drop-btn", d).setAttribute("aria-expanded", "false"); } });
        li.classList.toggle("open", open); b.setAttribute("aria-expanded", open);
      });
    });
    document.addEventListener("click", function () { $$(".has-drop.open").forEach(function (d) { d.classList.remove("open"); $(".drop-btn", d).setAttribute("aria-expanded", "false"); }); });
    var close = $(".announce-close");
    if (close) close.addEventListener("click", function () { $("#announce").remove(); store("tiwc-ann-closed", ann.text); });
  }

  function renderFooter() {
    var ct = C.contact || {};
    var branches = branchList().map(function (b) {
      return "<li>" + ICON.pin.replace(/16/g, "14") + '<a href="branches.html#' + b.id + '">' + esc(b.name) + (b.hq ? " (HQ)" : "") + "</a></li>";
    }).join("");
    var phones = (ct.phones || []).map(function (p) {
      return "<li>" + '<a href="' + telLink(p) + '">' + esc(p) + "</a></li>";
    }).join("");
    var year = new Date().getFullYear();
    $("#site-footer").innerHTML =
      '<footer class="site-footer"><div class="container"><div class="footer-grid">' +
      '<div class="footer-brand"><a href="index.html"><img src="' + esc(S.logo) + '" alt="Logo"></a><strong>' + esc(S.churchName) + "</strong><em>" + esc(S.tagline) + "</em>" +
      "<p>" + esc(S.motto) + ".</p>" +
      '<div class="footer-social">' +
      (S.facebookPageUrl ? '<a href="' + esc(S.facebookPageUrl) + '" target="_blank" rel="noopener" aria-label="Facebook">' + ICON.fb + "</a>" : "") +
      (S.youtubeUrl ? '<a href="' + esc(S.youtubeUrl) + '" target="_blank" rel="noopener" aria-label="YouTube">' + ICON.yt + "</a>" : "") +
      (waLink() ? '<a href="' + waLink() + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICON.wa + "</a>" : "") +
      "</div></div>" +
      "<div><h4>Our Branches</h4><ul class=\"footer-branches\">" + branches + "</ul></div>" +
      '<div><h4>Quick Links</h4><ul><li><a href="index.html">Home</a></li><li><a href="index.html#about">About Us</a></li><li><a href="branches.html">Branches &amp; Pastors</a></li><li><a href="bibleschool.html">Bible School</a></li><li><a href="give.html">Give / Donate</a></li><li><a href="index.html#events">Events</a></li><li><a href="pictures.html">Pictures</a></li><li><a href="sermons.html">Watch Sermons</a></li><li><a href="videos.html">Videos</a></li><li><a href="live.html">Watch Live</a></li><li><a href="contact.html">Contact Us</a></li></ul></div>' +
      "<div><h4>Contact</h4><ul>" + phones +
      (waLink() ? '<li><a href="' + waLink() + '" target="_blank" rel="noopener">Chat on WhatsApp</a></li>' : "") +
      (ct.email ? '<li><a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a></li>" : "") +
      (ct.address ? "<li>" + esc(ct.address) + "</li>" : "") +
      "</ul></div>" +
      '</div><div class="footer-bottom"><span><span id="copyMark">&copy;</span> ' + year + " " + esc(S.churchName) + " (" + esc(S.tagline) + '). All rights reserved.</span><span>' + esc(S.motto) + '</span></div></div></footer>' +
      (waLink() ? '<a class="whatsapp-float" href="' + waLink("Hello Thyword International Worship Centre,") + '" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">' + big(ICON.wa, 30) + "</a>" : "");
  }

  /* ---------- live status ---------- */
  var liveState = { youtube: false, facebook: false, ytVideoId: "", ytTitle: "" };

  function checkYouTubeLive(cb) {
    // Automatic detection needs a YouTube channel ID and a (free) YouTube Data API key in settings.
    // It reads the channel's latest uploads (2 quota units) instead of a search (100 units).
    if (!S.youtubeChannelId || !S.youtubeApiKey) return cb(null);
    var cached = store("tiwc-yt-live");
    if (cached) {
      try { var c = JSON.parse(cached); if (Date.now() - c.t < 3 * 60 * 1000) return cb(c.v); } catch (e) {}
    }
    var uploads = "UU" + S.youtubeChannelId.slice(2);
    var base = "https://www.googleapis.com/youtube/v3/";
    fetch(base + "playlistItems?part=contentDetails&maxResults=5&playlistId=" + uploads + "&key=" + S.youtubeApiKey)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var ids = (d.items || []).map(function (i) { return i.contentDetails.videoId; });
        if (!ids.length) throw 0;
        return fetch(base + "videos?part=snippet&id=" + ids.join(",") + "&key=" + S.youtubeApiKey).then(function (r) { return r.json(); });
      })
      .then(function (d) {
        var live = (d.items || []).filter(function (v) { return v.snippet.liveBroadcastContent === "live"; })[0];
        var v = live ? { id: live.id, title: live.snippet.title } : { id: "" };
        store("tiwc-yt-live", JSON.stringify({ t: Date.now(), v: v }));
        cb(v);
      })
      .catch(function () { cb(null); });
  }

  function updateLive() {
    var L = C.live || {};
    liveState.facebook = !!L.facebook;
    liveState.youtube = !!L.youtube;
    liveState.ytVideoId = youtubeId(L.youtubeLiveUrl);
    checkYouTubeLive(function (v) {
      if (v && v.id) { liveState.youtube = true; liveState.ytVideoId = v.id; liveState.ytTitle = v.title; }
      applyLive();
    });
    applyLive();
  }

  function applyLive() {
    var L = C.live || {};
    var any = liveState.youtube || liveState.facebook;
    document.body.classList.toggle("is-live", any);
    var bar = $("#liveBar");
    if (bar) {
      if (any) {
        var where = [liveState.youtube ? "YouTube" : "", liveState.facebook ? "Facebook" : ""].filter(Boolean).join(" & ");
        bar.innerHTML = '<span class="live-dot"></span><span>WE ARE LIVE NOW on ' + where + (L.title || liveState.ytTitle ? ": " + esc(liveState.ytTitle || L.title) : "") +
          '</span><a href="live.html">Join the service</a>';
        bar.classList.remove("hidden");
      } else bar.classList.add("hidden");
    }
    if (any && "Notification" in window && Notification.permission === "granted" && !store("tiwc-live-notified")) {
      store("tiwc-live-notified", "1");
      try { new Notification(S.churchName + " is LIVE", { body: (L.title || "Join the service now"), icon: "assets/images/favicon.png" }); } catch (e) {}
    }
    if (typeof onLiveChange === "function") onLiveChange();
  }
  var onLiveChange = null;

  /* ---------- shared building blocks ---------- */
  function eventCard(ev, past) {
    var d = eventDate(ev);
    var parts = (ev.date || "").split("-").map(Number);
    var id = "cd" + Math.random().toString(36).slice(2, 8);
    var isToday = d && new Date().toDateString() === d.toDateString();
    var ago = past ? daysSince(ev) : 0;
    var footer = past
      ? '<div class="past-foot"><span class="badge-past">Past event</span>' + (ago <= MIN_PAST_DAYS ? '<span class="past-ago">Happened ' + (ago === 1 ? "yesterday" : ago + " days ago") + "</span>" : "") + "</div>"
      : (isToday ? '<span class="badge-today">Happening today</span>' : '<div class="countdown" id="' + id + '" data-time="' + (d ? d.getTime() : "") + '"></div>');
    return '<article class="event-card reveal' + (past ? " is-past" : "") + '"><div class="event-img">' +
      (ev.image ? '<img src="' + esc(ev.image) + '" alt="' + esc(ev.title) + '" loading="lazy" data-zoom="' + esc(ev.image) + '" data-caption="' + esc(ev.title) + '">' : "") +
      (parts.length === 3 ? '<div class="event-date"><b>' + parts[2] + "</b><small>" + MONTHS[parts[1] - 1] + " " + parts[0] + "</small></div>" : "") +
      '</div><div class="event-body"><h3>' + esc(ev.title) + "</h3>" +
      (ev.subtitle ? '<div class="event-sub">' + esc(ev.subtitle) + "</div>" : "") +
      '<ul class="event-meta">' +
      "<li>" + ICON.cal + "<span>" + fmtDate(ev.date) + (ev.time ? " &middot; " + esc(ev.time) : "") + "</span></li>" +
      (ev.location ? "<li>" + ICON.pin + "<span>" + esc(ev.location) + "</span></li>" : "") +
      "</ul>" + (ev.description ? "<p>" + esc(ev.description) + "</p>" : "") +
      footer + "</div></article>";
  }
  function tickCountdowns() {
    $$(".countdown[data-time]").forEach(function (el) {
      var diff = +el.getAttribute("data-time") - Date.now();
      if (diff <= 0) { el.innerHTML = '<span class="badge-today">Happening now</span>'; el.removeAttribute("data-time"); return; }
      var dd = Math.floor(diff / 864e5), hh = Math.floor(diff / 36e5) % 24, mm = Math.floor(diff / 6e4) % 60, ss = Math.floor(diff / 1e3) % 60;
      el.innerHTML = "<div><b>" + dd + "</b><small>Days</small></div><div><b>" + hh + "</b><small>Hrs</small></div><div><b>" + mm + "</b><small>Min</small></div><div><b>" + ss + "</b><small>Sec</small></div>";
    });
  }

  /* ---------- sermons (YouTube) ---------- */
  function ytFeed() { return window.YOUTUBE_FEED || {}; }
  function ytWatch(id) { return "https://www.youtube.com/watch?v=" + id; }
  function channelId() { return S.youtubeChannelId || ytFeed().channelId || ""; }
  function channelUrl() { return S.youtubeUrl || ytFeed().channelUrl || ""; }
  // All sermons: videos collected from the YouTube channel, plus YouTube links added in the admin
  function sermonPool() {
    var list = [], seen = {};
    (ytFeed().videos || []).forEach(function (v) {
      if (seen[v.id]) return; seen[v.id] = 1;
      list.push({ title: v.title, type: "youtube", src: ytWatch(v.id), date: v.date, description: v.description, category: "Sermons" });
    });
    (C.videos || []).forEach(function (v) {
      var id = v.type === "youtube" ? youtubeId(v.src) : "";
      if (!id || seen[id]) return; seen[id] = 1;
      list.push(v);
    });
    return list;
  }
  // The featured sermon changes after every 2 page loads
  function featuredIndex(n) {
    if (!n) return 0;
    var loads = 1;
    try { loads = +localStorage.getItem("tiwc-page-loads") || 1; } catch (e) { loads = Math.floor(Math.random() * 2 * n) + 1; }
    return Math.floor((loads - 1) / 2) % n;
  }
  function countPageLoad() {
    try { localStorage.setItem("tiwc-page-loads", (+localStorage.getItem("tiwc-page-loads") || 0) + 1); } catch (e) {}
  }
  function featuredSermon() {
    var pool = sermonPool();
    if (pool.length) return { video: pool[featuredIndex(pool.length)], pool: pool };
    var local = (C.videos || []).filter(function (v) { return v.type === "file"; });
    if (local.length) return { video: local[featuredIndex(local.length)], pool: local };
    return { video: null, pool: [] };
  }
  // A player card: shows the thumbnail first and plays on the page when tapped
  function featuredPlayer(v) {
    var cid = channelId();
    if (!v && cid) {
      return '<div class="fs-frame"><iframe src="https://www.youtube.com/embed/videoseries?list=UU' + esc(cid.slice(2)) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Sermons"></iframe></div>';
    }
    if (!v) return '<div class="fs-frame fs-empty"><img src="' + esc(S.logo) + '" alt=""><p>Sermons coming soon on our YouTube channel.</p></div>';
    var thumb = videoThumb(v);
    return '<button class="fs-frame fs-thumb" type="button" data-play-featured aria-label="Play ' + esc(v.title) + '">' +
      (thumb ? '<img src="' + esc(thumb) + '" alt="">' : '<span class="noposter"><img src="' + esc(S.logo) + '" alt=""></span>') +
      '<span class="play">' + ICON.play + "</span></button>";
  }
  function featuredEmbed(v) {
    var id = v.type === "youtube" ? youtubeId(v.src) : "";
    if (id) return '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="' + esc(v.title) + '"></iframe>';
    if (v.type === "facebook") return '<iframe src="https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(v.src) + '&show_text=false&autoplay=true" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
    return '<video src="' + esc(v.src) + '" controls autoplay playsinline' + (v.poster ? ' poster="' + esc(v.poster) + '"' : "") + "></video>";
  }
  function bindFeatured(root, v) {
    var b = $("[data-play-featured]", root);
    if (!b || !v) return;
    b.addEventListener("click", function () {
      var d = document.createElement("div"); d.className = "fs-frame"; d.innerHTML = featuredEmbed(v);
      b.parentNode.replaceChild(d, b);
    });
  }
  function ytLinkFor(v) {
    var id = v && v.type === "youtube" ? youtubeId(v.src) : "";
    return id ? ytWatch(id) : channelUrl();
  }

  function videoThumb(v) {
    if (v.poster) return v.poster;
    var id = v.type === "youtube" ? youtubeId(v.src) : "";
    return id ? "https://img.youtube.com/vi/" + id + "/hqdefault.jpg" : "";
  }
  function videoCard(v, i) {
    var thumb = videoThumb(v);
    var tag = v.type === "youtube" ? "YouTube" : v.type === "facebook" ? "Facebook" : (v.category || "Video");
    return '<article class="video-card reveal"><button class="video-thumb" data-video="' + i + '" aria-label="Play ' + esc(v.title) + '">' +
      (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy">' : '<span class="noposter"><img src="' + esc(S.logo) + '" alt=""></span>') +
      '<span class="vtag">' + esc(tag) + '</span><span class="play">' + ICON.play + "</span></button>" +
      '<div class="video-body">' + (v.date ? "<small>" + fmtDate(v.date) + "</small>" : "") + "<h3>" + esc(v.title) + "</h3>" +
      (v.description ? "<p>" + esc(v.description) + "</p>" : "") +
      (v.type === "youtube" && youtubeId(v.src) ? '<a class="yt-link" href="' + esc(ytWatch(youtubeId(v.src))) + '" target="_blank" rel="noopener">' + ICON.yt + " Watch on YouTube</a>" : "") +
      "</div></article>";
  }

  function photoItem(p, i) {
    return '<button class="gallery-item reveal" data-photo="' + i + '"><img src="' + esc(p.src) + '" alt="' + esc(p.caption || "Church photo") + '" loading="lazy">' +
      (p.caption ? "<span>" + esc(p.caption) + "</span>" : "") + "</button>";
  }

  /* ---------- modal (lightbox + video player) ---------- */
  var modal, modalList = [], modalIndex = 0, modalKind = "photo";
  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = '<button class="modal-close" aria-label="Close">&times;</button><button class="modal-prev" aria-label="Previous">&#8249;</button><button class="modal-next" aria-label="Next">&#8250;</button><div class="modal-inner"></div>';
    document.body.appendChild(modal);
    $(".modal-close", modal).onclick = closeModal;
    $(".modal-prev", modal).onclick = function () { showModal(modalIndex - 1); };
    $(".modal-next", modal).onclick = function () { showModal(modalIndex + 1); };
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showModal(modalIndex - 1);
      if (e.key === "ArrowRight") showModal(modalIndex + 1);
    });
  }
  function openModal(list, i, kind) {
    ensureModal(); modalList = list; modalKind = kind;
    modal.classList.add("open"); document.body.style.overflow = "hidden";
    var multi = list.length > 1;
    $(".modal-prev", modal).style.display = multi ? "" : "none";
    $(".modal-next", modal).style.display = multi ? "" : "none";
    showModal(i);
  }
  function closeModal() { modal.classList.remove("open"); $(".modal-inner", modal).innerHTML = ""; document.body.style.overflow = ""; }
  function showModal(i) {
    modalIndex = (i + modalList.length) % modalList.length;
    var item = modalList[modalIndex], inner = $(".modal-inner", modal), html;
    if (modalKind === "photo") {
      html = '<img src="' + esc(item.src) + '" alt="' + esc(item.caption || "") + '">';
    } else {
      var vid = youtubeId(item.src), portrait = item.type === "file" && /short|clip/i.test(item.category || "");
      if (item.type === "youtube" && vid) html = '<div class="vframe"><iframe src="https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
      else if (item.type === "facebook") html = '<div class="vframe"><iframe src="https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(item.src) + '&show_text=false&autoplay=true" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
      else html = '<div class="vframe' + (portrait ? " portrait" : "") + '"><video src="' + esc(item.src) + '" controls autoplay playsinline' + (item.poster ? ' poster="' + esc(item.poster) + '"' : "") + "></video></div>";
    }
    inner.innerHTML = html + (item.caption || item.title ? '<div class="modal-caption">' + esc(item.caption || item.title) + "</div>" : "");
    // Fix portrait/landscape once the video knows its size
    var v = $("video", inner);
    if (v) v.addEventListener("loadedmetadata", function () { v.parentNode.classList.toggle("portrait", v.videoHeight > v.videoWidth); });
  }

  function bindPhotos(root, list) {
    $$("[data-photo]", root).forEach(function (b) {
      b.addEventListener("click", function () { openModal(list, +b.getAttribute("data-photo"), "photo"); });
    });
  }
  function bindVideos(root, list) {
    $$("[data-video]", root).forEach(function (b) {
      b.addEventListener("click", function () { openModal(list, +b.getAttribute("data-video"), "video"); });
    });
  }
  function bindZoom(root) {
    $$("[data-zoom]", root).forEach(function (img) {
      if (img.__zoom) return; img.__zoom = true;
      img.addEventListener("click", function () { openModal([{ src: img.getAttribute("data-zoom"), caption: img.getAttribute("data-caption") }], 0, "photo"); });
    });
  }

  function filters(container, items, key, onPick) {
    var cats = [];
    items.forEach(function (it) { if (it[key] && cats.indexOf(it[key]) < 0) cats.push(it[key]); });
    if (cats.length < 2) { container.innerHTML = ""; return; }
    container.innerHTML = '<button class="active" data-f="">All</button>' + cats.map(function (c) { return '<button data-f="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
    $$("button", container).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", container).forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active"); onPick(b.getAttribute("data-f"));
      });
    });
  }

  /* ---------- forms (subscribe / contact) ---------- */
  function sendForm(data) {
    // Sends the form to the church's inbox. Uses settings.formEndpoint (e.g. Formspree) if set,
    // otherwise FormSubmit.co with settings.adminEmail. No server needed, but the page must be
    // opened from the published website (https://...), not as a file on a computer or phone.
    var url = S.formEndpoint || (S.adminEmail ? "https://formsubmit.co/ajax/" + S.adminEmail.trim() : "");
    if (!url) return Promise.reject(new Error("not-configured"));
    if (location.protocol === "file:") return Promise.reject(new Error("not-hosted"));
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        // FormSubmit answers 200 with success "false" when the form still needs activation
        if (!r.ok || j.success === false || j.success === "false") {
          if (window.console) console.warn("Form service reply:", j.message || r.status);
          throw new Error(j.message || "failed");
        }
        return j;
      });
    });
  }
  // Backup: open the visitor's own email app with everything filled in, addressed to the church
  function mailtoChurch(subject, body) {
    var to = (C.contact || {}).email || S.adminEmail;
    if (!to) return "";
    var link = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    window.location.href = link;
    return link;
  }
  /* ---------- open the member's chosen email platform ---------- */
  var PLATFORMS = {
    gmail: { name: "Gmail",
      web: function (t, s, b) { return "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(t) + "&su=" + encodeURIComponent(s) + "&body=" + encodeURIComponent(b); },
      ios: function (t, s, b) { return "googlegmail://co?to=" + encodeURIComponent(t) + "&subject=" + encodeURIComponent(s) + "&body=" + encodeURIComponent(b); } },
    outlook: { name: "Outlook",
      web: function (t, s, b) { return "https://outlook.live.com/mail/0/deeplink/compose?to=" + encodeURIComponent(t) + "&subject=" + encodeURIComponent(s) + "&body=" + encodeURIComponent(b); },
      ios: function (t, s, b) { return "ms-outlook://compose?to=" + encodeURIComponent(t) + "&subject=" + encodeURIComponent(s) + "&body=" + encodeURIComponent(b); } },
    yahoo: { name: "Yahoo Mail",
      web: function (t, s, b) { return "https://compose.mail.yahoo.com/?to=" + encodeURIComponent(t) + "&subject=" + encodeURIComponent(s) + "&body=" + encodeURIComponent(b); },
      ios: function (t, s, b) { return "ymail://mail/compose?to=" + encodeURIComponent(t) + "&subject=" + encodeURIComponent(s) + "&body=" + encodeURIComponent(b); } },
    app: { name: "your email app",
      web: function (t, s, b) { return "mailto:" + t + "?subject=" + encodeURIComponent(s) + "&body=" + encodeURIComponent(b); } }
  };
  var IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var IS_MOBILE = IS_IOS || /Android|Mobi/i.test(navigator.userAgent);
  // Returns the link it opened (also shown to the member as a backup "tap here" link)
  function openCompose(via, to, subject, body) {
    var P = PLATFORMS[via] || PLATFORMS.app, web = P.web(to, subject, body);
    if (via === "app") { window.location.href = web; return web; }
    if (IS_IOS && P.ios) {
      // Try the installed app first; if it isn't installed, open the website version
      var left = false, onHide = function () { left = true; };
      document.addEventListener("visibilitychange", onHide, { once: true });
      window.location.href = P.ios(to, subject, body);
      setTimeout(function () { if (!left && document.visibilityState === "visible") window.location.href = web; }, 1600);
      return web;
    }
    if (IS_MOBILE) { window.location.href = web; return web; }
    // (no "noopener" flag here: with it, browsers report every new tab as blocked)
    var w = window.open(web, "_blank");
    if (w) { try { w.opener = null; } catch (e) {} } else window.location.href = web;
    return web;
  }

  /* ---------- "Send with" pop-up: after pressing Send/Subscribe the member picks an app ---------- */
  var CHOICES = [
    { id: "gmail", name: "Gmail", note: "Opens Gmail", color: "#ea4335", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-8 5-8-5V6l8 5 8-5z"/></svg>' },
    { id: "outlook", name: "Outlook / Hotmail", note: "Opens Outlook", color: "#0a64d8", icon: ICON.mail.replace(/16/g, "22") },
    { id: "yahoo", name: "Yahoo Mail", note: "Opens Yahoo Mail", color: "#6001d2", icon: ICON.mail.replace(/16/g, "22") },
    { id: "app", name: "Other email app", note: "iPhone Mail, Samsung Email\u2026", color: "#0e4c4b", icon: ICON.mail.replace(/16/g, "22") },
    { id: "website", name: "Send from this website", note: "No email app needed", color: "#b3111a", icon: big(ICON.church, 22) }
  ];
  var chooser;
  // opts: { title, subject, body, onWebsite(), onOpened(name, link) }
  function chooseSendApp(opts) {
    var to = (C.contact || {}).email || S.adminEmail;
    var last = "";
    try { last = localStorage.getItem("tiwc-send-via") || ""; } catch (e) {}
    if (!chooser) {
      chooser = document.createElement("div");
      chooser.className = "send-sheet";
      chooser.setAttribute("role", "dialog");
      chooser.setAttribute("aria-modal", "true");
      chooser.setAttribute("aria-labelledby", "sendSheetTitle");
      document.body.appendChild(chooser);
      chooser.addEventListener("click", function (e) { if (e.target === chooser) closeChooser(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && chooser.classList.contains("open")) closeChooser(); });
    }
    var list = CHOICES.filter(function (c) { return c.id === "website" ? !!(S.formEndpoint || S.adminEmail) : !!to; });
    chooser.innerHTML = '<div class="sheet-panel"><div class="sheet-grab"></div>' +
      '<div class="sheet-head"><div><h3 id="sendSheetTitle">' + esc(opts.title || "Send with") + '</h3><p>Choose how you would like to send it to the church' + (to ? " (" + esc(to) + ")" : "") + '.</p></div>' +
      '<button class="sheet-close" type="button" aria-label="Close">&times;</button></div>' +
      '<div class="sheet-list">' + list.map(function (c) {
        return '<button type="button" class="sheet-opt" data-via="' + c.id + '"><span class="sheet-ico" style="background:' + c.color + '">' + c.icon + '</span>' +
          '<span class="sheet-txt"><b>' + esc(c.name) + "</b><small>" + c.note + "</small></span>" + (c.id === last ? '<span class="sheet-last">Last used</span>' : "") + "</button>";
      }).join("") + "</div></div>";
    $(".sheet-close", chooser).onclick = closeChooser;
    $$(".sheet-opt", chooser).forEach(function (b) {
      b.addEventListener("click", function () {
        var via = b.getAttribute("data-via");
        try { localStorage.setItem("tiwc-send-via", via); } catch (e) {}
        closeChooser();
        if (via === "website") { opts.onWebsite(); return; }
        // Opened right inside the tap, so phones and browsers allow the new app/tab
        var link = openCompose(via, to, opts.subject, opts.body);
        if (opts.onOpened) opts.onOpened((PLATFORMS[via] || PLATFORMS.app).name, link);
      });
    });
    chooser.classList.add("open");
    document.body.classList.add("sheet-open");
    setTimeout(function () { var f = $(".sheet-opt", chooser); if (f) f.focus(); }, 50);
  }
  function closeChooser() { if (chooser) chooser.classList.remove("open"); document.body.classList.remove("sheet-open"); }

  function bindSubscribe() {
    $$(".js-subscribe").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = $(".note", form), btn = $("button", form);
        var email = form.email.value.trim(), name = form.name ? form.name.value.trim() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { note.textContent = "Please enter a valid email address."; return; }
        chooseSendApp({
          title: "Subscribe with",
          subject: "Please add me to event alerts",
          body: "Hello Thyword International Worship Centre,\n\nPlease add me to your list for upcoming events and live service alerts.\n\nName: " + (name || "-") + "\nEmail: " + email,
          onOpened: function (appName, link) {
            note.innerHTML = "Opening " + esc(appName) + "... Press <b>Send</b> there to finish subscribing. " +
              '<a href="' + esc(link) + '" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline">Tap here if it did not open</a>.';
          },
          onWebsite: function () {
            btn.disabled = true; note.textContent = "Sending...";
            sendForm({ _subject: "New subscriber for event alerts: " + email, _template: "table", _captcha: "false", _replyto: email, type: "Event & live alerts subscription", name: name, email: email, date: new Date().toString() })
              .then(function () { note.textContent = "Thank you! You've been added to receive our upcoming event and live alerts."; form.reset(); })
              .catch(function () { note.innerHTML = "Sorry, the website couldn't send it right now. Press <b>Subscribe</b> again and choose Gmail, Outlook, Yahoo or your email app."; })
              .then(function () { btn.disabled = false; });
          }
        });
      });
    });
  }
  function subscribeBlock() {
    return '<div class="subscribe reveal"><div><span class="eyebrow" style="color:var(--gold)">Stay Connected</span><h2>Get upcoming event &amp; live service alerts</h2><p>Enter your email and the church office will add you to our list. You will hear about programmes, special services and whenever we go live.</p></div>' +
      '<form class="sub-form js-subscribe" novalidate><div class="sub-row"><input name="name" type="text" placeholder="Your name" aria-label="Your name"></div>' +
      '<div class="sub-row"><input name="email" type="email" placeholder="Your email address" aria-label="Email address" required><button class="btn btn-gold" type="submit">Subscribe</button></div><div class="note" role="status"></div></form></div>';
  }

  function socialCards() {
    return '<div class="social-grid">' +
      (S.facebookPageUrl ? '<a class="social-card fb reveal" href="' + esc(S.facebookPageUrl) + '" target="_blank" rel="noopener">' + big(ICON.fb, 48) + "<div><h3>Follow us on Facebook</h3><p>Watch live services, see updates and join the conversation.</p></div></a>" : "") +
      (S.youtubeUrl ? '<a class="social-card yt reveal" href="' + esc(S.youtubeUrl) + '" target="_blank" rel="noopener">' + big(ICON.yt, 48) + "<div><h3>Subscribe on YouTube</h3><p>Turn on notifications to be alerted the moment we go live.</p></div></a>" : "") +
      "</div>";
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    var els = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ================= PAGES ================= */
  var pages = {};

  pages.home = function () {
    var H = C.hero || {}, A = C.about || {}, P = C.pastor || {};
    // Watch Sermons card (top right of the banner)
    var fs = featuredSermon(), hs = $("#heroSermon");
    if (hs) {
      var fv = fs.video;
      hs.innerHTML = '<div class="hs-head"><span class="hs-label">' + big(ICON.play, 14) + ' Watch Sermons</span><a href="sermons.html">All sermons &rarr;</a></div>' +
        featuredPlayer(fv) +
        '<div class="hs-body">' + (fv ? (fv.date ? "<small>" + fmtDate(fv.date) + "</small>" : "") + "<h3>" + esc(fv.title) + "</h3>" : "<h3>Sermons from " + esc(S.churchName) + "</h3>") +
        '<div class="hs-actions"><a class="btn btn-gold btn-sm" href="sermons.html">More Sermons</a>' +
        (ytLinkFor(fv) ? '<a class="btn btn-outline btn-sm" href="' + esc(ytLinkFor(fv)) + '" target="_blank" rel="noopener">' + ICON.yt + " YouTube</a>" : "") +
        "</div></div>";
      bindFeatured(hs, fv);
    }
    // hero media slideshow
    var media = H.media || [];
    $("#heroMedia").innerHTML = media.map(function (m, i) {
      return m.type === "video"
        ? '<video src="' + esc(m.src) + '" ' + (m.poster ? 'poster="' + esc(m.poster) + '" ' : "") + 'muted loop playsinline preload="metadata"' + (i === 0 ? ' class="active" autoplay' : "") + "></video>"
        : '<img src="' + esc(m.src) + '" alt=""' + (i === 0 ? ' class="active"' : "") + ">";
    }).join("");
    $("#heroTitle").textContent = H.heading || "";
    $("#heroText").textContent = H.subheading || "";
    if (media.length > 1) {
      var slides = $$("#heroMedia > *"), cur = 0;
      $("#heroDots").innerHTML = slides.map(function (_, i) { return '<button aria-label="Slide ' + (i + 1) + '"' + (i === 0 ? ' class="active"' : "") + "></button>"; }).join("");
      var dots = $$("#heroDots button");
      var go = function (n) {
        slides[cur].classList.remove("active"); dots[cur].classList.remove("active");
        if (slides[cur].tagName === "VIDEO") slides[cur].pause();
        cur = (n + slides.length) % slides.length;
        slides[cur].classList.add("active"); dots[cur].classList.add("active");
        if (slides[cur].tagName === "VIDEO") { slides[cur].currentTime = 0; slides[cur].play().catch(function () {}); }
      };
      var timer = setInterval(function () { go(cur + 1); }, 7000);
      dots.forEach(function (d, i) { d.onclick = function () { clearInterval(timer); go(i); timer = setInterval(function () { go(cur + 1); }, 7000); }; });
    }

    // about + pastor
    $("#aboutTitle").textContent = A.title || "";
    $("#aboutText").textContent = A.text || "";
    $("#aboutVerse").innerHTML = A.verse ? esc(A.verse) + "<cite>" + esc(A.verseRef) + "</cite>" : "";
    $("#pastorFigure").innerHTML = '<img src="' + esc(P.photo) + '" alt="' + esc(P.name) + '"><figcaption><strong>' + esc(P.name) + "</strong><span>" + esc(P.role) + "</span></figcaption>";
    $("#pastorBio").innerHTML = "<strong>" + esc(P.name) + ".</strong> " + esc(P.bio);

    // service times
    $("#serviceTimes").innerHTML = (C.serviceTimes || []).map(function (t) {
      return '<div class="time-card reveal"><div class="day">' + esc(t.day) + "</div><h3>" + esc(t.name) + '</h3><div class="time">' + esc(t.time) + "</div></div>";
    }).join("");

    // events
    var up = upcomingEvents(), past = pastEvents();
    var showEvents = function (tab) {
      $$("#eventTabs button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === tab); b.setAttribute("aria-selected", b.getAttribute("data-tab") === tab); });
      var list = tab === "past" ? past : up;
      $("#eventsGrid").innerHTML = list.length
        ? list.slice(0, 9).map(function (ev) { return eventCard(ev, tab === "past"); }).join("")
        : '<div class="empty">' + (tab === "past" ? "No past events to show." : "No upcoming events right now. Check back soon or follow us on Facebook for updates.") + "</div>";
      bindZoom($("#eventsGrid")); tickCountdowns(); reveal();
    };
    $("#eventTabs").innerHTML = '<button type="button" role="tab" data-tab="upcoming">Upcoming <span>' + up.length + '</span></button>' +
      '<button type="button" role="tab" data-tab="past">Past Events <span>' + past.length + "</span></button>";
    $$("#eventTabs button").forEach(function (b) { b.addEventListener("click", function () { showEvents(b.getAttribute("data-tab")); }); });
    showEvents(up.length || !past.length ? "upcoming" : "past");

    // words from the pastor
    var words = (C.words || []).slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    var wi = 0;
    $("#wordsSlider").innerHTML = words.map(function (w, i) {
      return '<div class="word' + (i === 0 ? " active" : "") + '"><div class="word-mark">&ldquo;</div><blockquote>' + esc(w.text) + "</blockquote><cite>&mdash; " + esc(w.author) + "</cite></div>";
    }).join("") + (words.length > 1 ? '<div class="word-nav"><button aria-label="Previous word">&#8249;</button><button aria-label="Next word">&#8250;</button></div>' : "");
    if (words.length > 1) {
      var ws = $$(".word"), wb = $$(".word-nav button");
      var show = function (n) { ws[wi].classList.remove("active"); wi = (n + ws.length) % ws.length; ws[wi].classList.add("active"); };
      wb[0].onclick = function () { show(wi - 1); }; wb[1].onclick = function () { show(wi + 1); };
      setInterval(function () { show(wi + 1); }, 10000);
    }

    // pictures & videos preview
    var photos = (C.photos || []).slice(0, 8);
    $("#homePhotos").innerHTML = photos.map(photoItem).join("") || '<div class="empty">Pictures coming soon.</div>';
    bindPhotos($("#homePhotos"), photos);
    var vids = (C.videos || []).slice(0, 3);
    $("#homeVideos").innerHTML = vids.map(videoCard).join("") || '<div class="empty">Videos coming soon.</div>';
    bindVideos($("#homeVideos"), vids);

    $("#socialCards").innerHTML = socialCards();
    $("#subscribeBox").innerHTML = subscribeBlock();
  };

  pages.pictures = function () {
    var all = C.photos || [];
    var grid = $("#photoGrid");
    var draw = function (album) {
      var list = all.filter(function (p) { return !album || p.album === album; });
      grid.innerHTML = list.map(photoItem).join("") || '<div class="empty">No pictures yet.</div>';
      bindPhotos(grid, list); reveal();
    };
    filters($("#photoFilters"), all, "album", draw);
    draw("");
    $("#subscribeBox").innerHTML = subscribeBlock();
  };

  pages.videos = function () {
    var all = C.videos || [];
    var grid = $("#videoGrid");
    var draw = function (cat) {
      var list = all.filter(function (v) { return !cat || v.category === cat; });
      grid.innerHTML = list.map(videoCard).join("") || '<div class="empty">No videos yet.</div>';
      bindVideos(grid, list); reveal();
    };
    filters($("#videoFilters"), all, "category", draw);
    draw("");

    // Latest uploads straight from YouTube (only when an API key + channel ID are set)
    if (S.youtubeChannelId && S.youtubeApiKey) {
      fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=9&playlistId=UU" + S.youtubeChannelId.slice(2) + "&key=" + S.youtubeApiKey)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var list = (d.items || []).map(function (it) {
            var sn = it.snippet;
            return { title: sn.title, type: "youtube", src: "https://youtu.be/" + sn.resourceId.videoId, poster: ((sn.thumbnails || {}).high || {}).url, date: (sn.publishedAt || "").slice(0, 10) };
          });
          if (!list.length) return;
          $("#ytLatest").classList.remove("hidden");
          $("#ytGrid").innerHTML = list.map(videoCard).join("");
          bindVideos($("#ytGrid"), list); reveal();
        }).catch(function () {});
    }
    $("#socialCards").innerHTML = socialCards();
  };

  pages.sermons = function () {
    var fs = featuredSermon(), fv = fs.video, pool = sermonPool();
    var box = $("#featuredSermon");
    box.innerHTML = '<div class="fs-player">' + featuredPlayer(fv) + "</div>" +
      '<div class="fs-info"><span class="eyebrow">Featured Sermon</span>' +
      (fv ? "<h2>" + esc(fv.title) + "</h2>" + (fv.date ? '<p class="fs-date">' + fmtDate(fv.date) + "</p>" : "") + (fv.description ? "<p>" + esc(fv.description) + "</p>" : "")
          : "<h2>Watch our sermons</h2><p>Messages from " + esc((C.pastor || {}).name || S.churchName) + " and the ministers of " + esc(S.churchName) + ".</p>") +
      '<p class="fs-note">A new featured sermon appears every couple of visits. Browse them all below.</p>' +
      '<div class="hero-actions" style="margin-top:1rem">' +
      (ytLinkFor(fv) ? '<a class="btn btn-red" href="' + esc(ytLinkFor(fv)) + '" target="_blank" rel="noopener">' + ICON.yt + (fv && fv.type === "youtube" ? " Watch on YouTube" : " Visit our YouTube channel") + "</a>" : "") +
      (channelUrl() ? '<a class="btn btn-outline-dark" href="' + esc(channelUrl()) + '?sub_confirmation=1" target="_blank" rel="noopener">Subscribe</a>' : "") +
      "</div></div>";
    bindFeatured(box, fv);

    var grid = $("#sermonGrid");
    if (pool.length) {
      grid.innerHTML = pool.map(videoCard).join("");
      bindVideos(grid, pool);
      $("#sermonCount").textContent = pool.length + " sermon" + (pool.length === 1 ? "" : "s");
    } else {
      grid.innerHTML = '<div class="empty">Our latest sermons from YouTube will appear here automatically. In the meantime, <a href="' + esc(channelUrl()) + '" target="_blank" rel="noopener">visit our YouTube channel</a>.</div>';
    }
    // Admin-added clips and other videos
    var others = (C.videos || []).filter(function (v) { return v.type !== "youtube"; });
    if (others.length) {
      $("#otherVideos").classList.remove("hidden");
      $("#otherGrid").innerHTML = others.map(videoCard).join("");
      bindVideos($("#otherGrid"), others);
    }
    $("#socialCards").innerHTML = socialCards();
    $("#subscribeBox").innerHTML = subscribeBlock();
  };


  /* ---------- Branches & Pastors + Board of Trustees ---------- */
  pages.branches = function () {
    var list = branchList(), today = new Date(); today.setHours(0, 0, 0, 0);
    $("#branchJump").innerHTML = list.map(function (b) { return '<a href="#' + b.id + '"' + (b.hq ? ' class="hq"' : "") + ">" + esc(b.name) + "</a>"; }).join("");
    $("#branchCards").innerHTML = list.map(function (b) {
      var P = C.pastor || {}, ct = C.contact || {};
      // Headquarters falls back to the Head Pastor and the main church contacts
      var pName = b.pastorName || (b.hq ? P.name : ""), pPhoto = b.pastorPhoto || (b.hq ? P.photo : ""), pBio = b.pastorBio || (b.hq ? P.bio : "");
      var pTitle = b.pastorTitle || (b.hq ? (P.role || "Head Pastor") : "Branch Pastor");
      var phone = b.phone || (b.hq ? (ct.phones || [])[0] : ""), wa = b.whatsapp || (b.hq ? ct.whatsapp : ""), email = b.email || (b.hq ? ct.email : "");
      var progs = (b.programs || []).filter(function (x) { if (!x.title) return false; var d = eventDate(x); return !d || d >= today; })
        .sort(function (a, c) { return (a.date || "9999").localeCompare(c.date || "9999"); });
      var map = b.mapQuery || (b.location ? b.location + ", Ghana" : "");
      return '<article class="branch-full reveal' + (b.hq ? " is-hq" : "") + '" id="' + b.id + '">' +
        '<header class="bf-head"' + (b.image ? ' style="background-image:linear-gradient(100deg,rgba(7,46,45,.92),rgba(7,46,45,.6)),url(\'' + esc(b.image) + '\')"' : "") + '>' +
          '<span class="bf-tag">' + (b.hq ? "Headquarters" : "Branch") + "</span><h2>" + esc(b.name) + "</h2>" +
          (b.location ? '<p class="bf-loc">' + ICON.pin + " " + esc(b.location) + "</p>" : "") + "</header>" +
        '<div class="bf-grid">' +
          '<div class="bf-pastor">' +
            '<div class="bf-pphoto">' + (pPhoto ? '<img src="' + esc(pPhoto) + '" alt="' + esc(pName) + '" loading="lazy">' : '<img class="ph" src="' + esc(S.logo) + '" alt="">') + "</div>" +
            "<small>" + esc(pTitle) + "</small><h3>" + (pName ? esc(pName) : "Pastor details coming soon") + "</h3>" +
            (pBio ? "<p>" + esc(pBio) + "</p>" : "") + "</div>" +
          '<div class="bf-info">' +
            (b.about ? '<p class="bf-about">' + esc(b.about) + "</p>" : "") +
            (lines(b.serviceTimes).length ? '<h4>Service times</h4><ul class="bf-list">' + lines(b.serviceTimes).map(function (x) { return "<li>" + ICON.clock + " " + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
            (lines(b.activities).length ? '<h4>Activities</h4><div class="bf-chips">' + lines(b.activities).map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>" : "") +
            "<h4>Upcoming programmes</h4>" +
            (progs.length ? '<ul class="bf-progs">' + progs.map(function (x) {
              var d = (x.date || "").split("-").map(Number);
              return "<li>" + (d.length === 3 ? '<span class="pd"><b>' + d[2] + "</b><small>" + MONTHS[d[1] - 1] + "</small></span>" : '<span class="pd"><b>&bull;</b></span>') +
                "<div><strong>" + esc(x.title) + "</strong>" + (x.time || x.details ? "<small>" + esc([x.time, x.details].filter(Boolean).join(" · ")) + "</small>" : "") + "</div></li>";
            }).join("") + "</ul>" : '<p class="muted">No upcoming programmes listed yet.</p>') +
            '<div class="bf-contact">' +
              (phone ? '<a class="btn btn-green btn-sm" href="' + telLink(phone) + '">' + ICON.phone + " Call</a>" : "") +
              (wa ? '<a class="btn btn-sm bf-wa" href="' + waTo(wa, "Hello " + b.name + ",") + '" target="_blank" rel="noopener">' + ICON.wa + " WhatsApp</a>" : "") +
              (email ? '<a class="btn btn-outline-dark btn-sm" href="mailto:' + esc(email) + '">' + ICON.mail + " Email</a>" : "") +
              (map ? '<a class="btn btn-outline-dark btn-sm" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(map) + '" target="_blank" rel="noopener">' + ICON.pin + " Directions</a>" : "") +
              '<a class="btn btn-gold btn-sm" href="give.html?to=' + (b.hq ? "hq" : b.id) + '">Give to ' + (b.hq ? "Headquarters" : "this branch") + "</a>" +
            "</div>" + (phone || wa || email ? '<p class="bf-contact-line">' + [phone, email].filter(Boolean).map(esc).join(" &middot; ") + "</p>" : "") +
          "</div></div></article>";
    }).join("");

    var T = C.trustees || [];
    $("#trusteeGrid").innerHTML = T.length ? T.map(function (t) {
      return '<div class="trustee reveal"><div class="tr-photo">' + (t.photo ? '<img src="' + esc(t.photo) + '" alt="' + esc(t.name) + '" loading="lazy">' : '<img class="ph" src="' + esc(S.logo) + '" alt="">') + "</div>" +
        "<h3>" + esc(t.name) + '</h3><p class="tr-pos">' + esc(t.position) + "</p>" + (t.bio ? '<p class="tr-bio">' + esc(t.bio) + "</p>" : "") + "</div>";
    }).join("") : '<div class="empty">Board of Trustees profiles are coming soon.</div>';
    $("#subscribeBox").innerHTML = subscribeBlock();
  };

  /* ---------- Bible School ---------- */
  pages.bibleschool = function () {
    var B = C.bibleSchool || {}, ct = C.contact || {};
    var phone = B.contactPhone || (ct.phones || [])[0], wa = B.contactWhatsapp || ct.whatsapp;
    $("#bsAbout").innerHTML = '<div class="bs-text reveal"><span class="eyebrow">About the School</span><h2>' + esc(B.title || "Bible School") + "</h2>" +
      (B.intro ? "<p>" + esc(B.intro) + "</p>" : "") +
      (lines(B.details).length ? '<ul class="bs-details">' + lines(B.details).map(function (x) {
        var i = x.indexOf(":"); return "<li>" + (i > 0 ? "<b>" + esc(x.slice(0, i)) + ":</b>" + esc(x.slice(i + 1)) : esc(x)) + "</li>"; }).join("") + "</ul>" : "") +
      '<div class="hero-actions"><a class="btn btn-red" href="#enroll">How to Enroll</a>' + ((B.forms || []).length ? '<a class="btn btn-outline-dark" href="#forms">Download Forms</a>' : "") + "</div></div>" +
      '<div class="bs-image reveal">' + (B.image || ((B.photos || [])[0] || {}).src ? '<img src="' + esc(B.image || B.photos[0].src) + '" alt="Bible School">' : '<div class="bs-ph"><img src="' + esc(S.logo) + '" alt=""><p>' + esc(B.title || "Bible School") + "</p></div>") + "</div>";

    var steps = lines(B.howToEnroll);
    $("#bsSteps").innerHTML = steps.map(function (x, i) { return '<li class="reveal"><span>' + (i + 1) + "</span><p>" + esc(x) + "</p></li>"; }).join("");
    var subject = "Bible School enrollment";
    var msg = "Hello, I would like to enroll in the " + (B.title || "Bible School") + ". Please send me the details.";
    $("#bsEnroll").innerHTML =
      (B.enrollLink ? '<a class="btn btn-red" href="' + esc(B.enrollLink) + '" target="_blank" rel="noopener">Enroll Online</a>' : "") +
      (wa ? '<a class="btn bf-wa" href="' + waTo(wa, msg) + '" target="_blank" rel="noopener">' + ICON.wa + " Enroll on WhatsApp</a>" : "") +
      (phone ? '<a class="btn btn-green" href="' + telLink(phone) + '">' + ICON.phone + " Call " + esc(phone) + "</a>" : "") +
      '<button class="btn btn-outline-dark" type="button" id="bsEmail">' + ICON.mail + " Enroll by Email</button>";
    $("#bsEmail").addEventListener("click", function () {
      var st = $("#bsStatus");
      chooseSendApp({ title: "Enroll by email", subject: subject, body: msg + "\n\nName:\nPhone:\n",
        onOpened: function (n, link) { st.innerHTML = "Opening " + esc(n) + "... add your name and phone, then press <b>Send</b>. " + '<a href="' + esc(link) + '" target="_blank" rel="noopener">Tap here if it did not open</a>.'; },
        onWebsite: function () { window.location.href = "contact.html"; } });
    });

    var forms = B.forms || [];
    $("#formsSection").classList.toggle("hidden", !forms.length);
    $("#bsForms").innerHTML = forms.map(function (f) {
      var ext = (String(f.file || "").split("?")[0].split(".").pop() || "").toUpperCase();
      return '<a class="form-card reveal" href="' + esc(f.file) + '" download target="_blank" rel="noopener"><span class="fc-ico">' + (ext && ext.length <= 4 ? esc(ext) : "FILE") + "</span>" +
        "<span><b>" + esc(f.title || "Enrollment form") + "</b>" + (f.description ? "<small>" + esc(f.description) + "</small>" : "<small>Tap to download</small>") + "</span>" +
        '<span class="fc-dl"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-5-5m5 5 5-5M5 21h14"/></svg></span></a>';
    }).join("");

    var photos = B.photos || [];
    $("#bsPhotos").innerHTML = photos.length ? photos.map(photoItem).join("") : '<div class="empty">Pictures from recent Bible School classes are coming soon.</div>';
    bindPhotos($("#bsPhotos"), photos);
    $("#subscribeBox").innerHTML = subscribeBlock();
  };

  /* ---------- Give: tithes, offerings & donations ---------- */
  // Banks members can choose from (the church's main banks first)
  var BANKS = {
    "Main banks": ["GCB Bank (Ghana Commercial Bank)", "Consolidated Bank Ghana (CBG)", "Ecobank Ghana", "Fidelity Bank Ghana", "Stanbic Bank Ghana", "OmniBSIC Bank"],
    "Other banks": ["Absa Bank Ghana", "Access Bank Ghana", "Agricultural Development Bank (ADB)", "CalBank", "First Atlantic Bank", "First National Bank Ghana", "GTBank Ghana", "National Investment Bank (NIB)", "Prudential Bank", "Republic Bank Ghana", "Societe Generale Ghana", "Standard Chartered Ghana", "United Bank for Africa (UBA)", "Universal Merchant Bank (UMB)", "Zenith Bank Ghana", "Rural / community bank", "Savings & loans / other"]
  };
  function sameBank(a, b) {
    var k = function (x) { return String(x || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/bank|ghana|limited|ltd|plc|[^a-z]/g, ""); };
    return k(a) && k(a) === k(b);
  }
  function loadPaystack(cb) {
    if (window.PaystackPop) return cb();
    var sc = document.createElement("script");
    sc.src = "https://js.paystack.co/v1/inline.js";
    sc.onload = function () { cb(); }; sc.onerror = function () { cb(new Error("load")); };
    document.head.appendChild(sc);
  }
  pages.give = function () {
    var G = C.giving || {}, ct = C.contact || {};
    var IS_ANDROID = /Android/i.test(navigator.userAgent);
    var hqName = (hqBranch() || {}).location ? "Headquarters (" + hqBranch().location.split(",")[0] + ")" : "Headquarters";
    var hqBanks = (G.bankAccounts || []).filter(function (x) { return x.accountNumber; });
    var hqAcct = { momoNumber: G.momoNumber, momoName: G.momoName, telecelNumber: G.telecelNumber, telecelName: G.telecelName, banks: hqBanks };
    var recips = [{ id: "hq", name: hqName, short: "HQ", offerings: (G.offerings || []).filter(function (o) { return o.name; }), acct: hqAcct, own: true, subaccount: "" }];
    branchList().filter(function (x) { return !x.hq; }).forEach(function (x) {
      var banks = x.bankAccountNumber ? [{ bank: x.bankName, accountName: x.bankAccountName, accountNumber: x.bankAccountNumber, branch: "" }] : [];
      var own = !!(x.momoNumber || x.telecelNumber || banks.length);
      recips.push({ id: x.id, name: x.name, short: x.name, offerings: lines(G.branchOfferings).map(function (n) { return { name: n }; }), own: own, subaccount: x.paystackSubaccount || "",
        acct: own ? { momoNumber: x.momoNumber, momoName: x.momoName, telecelNumber: x.telecelNumber, telecelName: x.telecelName, banks: banks.length ? banks : hqBanks } : hqAcct });
    });
    if (G.intro) $("#giveIntro").textContent = G.intro;
    $("#giveVerse").innerHTML = G.verse ? esc(G.verse) + "<cite>" + esc(G.verseRef || "") + "</cite>" : "";
    var want = (location.search.match(/[?&]to=([\w-]+)/) || [])[1] || "hq";
    var cur = recips.filter(function (r) { return r.id === want; })[0] || recips[0], offering = "";
    var online = !!G.paystackPublicKey, method = "momo", memberBank = "";
    var payer = { name: "", phone: "", email: "" };   // kept while switching tabs or changing the amount
    try { memberBank = localStorage.getItem("tiwc-my-bank") || ""; } catch (e) {}

    var sel = $("#giveTo");
    sel.innerHTML = recips.map(function (r) { return '<option value="' + r.id + '"' + (r === cur ? " selected" : "") + ">" + esc(r.name) + "</option>"; }).join("");
    if (!online) $('#payTabs [data-m="card"]').remove();
    var amountInput = $("#giveAmount");
    function amount() { var v = parseFloat(String(amountInput.value).replace(/[^\d.]/g, "")); return isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : 0; }
    function money(v) { return "GHS " + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

    function drawOfferings() {
      var list = cur.offerings.length ? cur.offerings : [{ name: "Offering" }];
      if (!list.some(function (o) { return o.name === offering; })) offering = list[0].name;
      $("#giveOfferings").innerHTML = list.map(function (o) {
        return '<button type="button" class="offer' + (o.name === offering ? " on" : "") + '" data-o="' + esc(o.name) + '"><b>' + esc(o.name) + "</b>" + (o.description ? "<small>" + esc(o.description) + "</small>" : "") + "</button>";
      }).join("");
      $$("#giveOfferings .offer").forEach(function (x) { x.onclick = function () { offering = x.getAttribute("data-o"); drawOfferings(); drawMethod(); }; });
    }
    function row(label, value, copy) {
      if (!value) return "";
      return '<div class="pay-row"><span>' + label + "</span><b>" + esc(value) + "</b>" + (copy ? '<button type="button" class="copy-btn" data-copy="' + esc(String(value).replace(/\s/g, "")) + '">Copy</button>' : "") + "</div>";
    }
    function bankSelect() {
      var o = '<option value="">Select your bank…</option>';
      for (var g in BANKS) o += '<optgroup label="' + g + '">' + BANKS[g].map(function (n) { return "<option" + (n === memberBank ? " selected" : "") + ">" + esc(n) + "</option>"; }).join("") + "</optgroup>";
      return '<label class="pay-label" for="myBank">Which bank are you sending from?</label><select id="myBank">' + o + "</select>";
    }
    function drawMethod() {
      $$("#payTabs button").forEach(function (x) { x.classList.toggle("active", x.getAttribute("data-m") === method); });
      var a = cur.acct, amt = amount(), ref = offering + " - " + cur.short, html = "";
      var amtTxt = amt ? "<b>" + money(amt) + "</b>" : "the amount";
      var missing = '<div class="pay-missing">These details are being updated. Please contact the church office' +
        (ct.whatsapp ? ' on <a href="' + waTo(ct.whatsapp, "Hello, I would like to give (" + offering + " - " + cur.name + "). Please send me the payment details.") + '" target="_blank" rel="noopener">WhatsApp</a>' : "") +
        ((ct.phones || [])[0] ? ' or call <a href="' + telLink(ct.phones[0]) + '">' + esc(ct.phones[0]) + "</a>" : "") + ".</div>";
      var PROV = {
        momo: { name: "MTN MoMo", short: "MoMo", ussd: "*170#", tel: "*170%23", num: a.momoNumber, acct: a.momoName, menu: "<b>Transfer Money</b>, then <b>MoMo User</b>" },
        telecel: { name: "Telecel Cash", short: "Telecel Cash", ussd: "*110#", tel: "*110%23", num: a.telecelNumber, acct: a.telecelName, menu: "<b>Send Money</b>" }
      };
      var lock = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
      function payerFields(phoneLabel, phoneRequired) {
        return '<div class="pay-fields"><div><label class="pay-label" for="payName">Your name</label><input id="payName" autocomplete="name" value="' + esc(payer.name) + '"></div>' +
          '<div><label class="pay-label" for="payPhone">' + phoneLabel + (phoneRequired ? "" : " (optional)") + '</label><input id="payPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 024 123 4567" value="' + esc(payer.phone) + '"></div>' +
          '<div><label class="pay-label" for="payEmail">Email for receipt (optional)</label><input id="payEmail" type="email" autocomplete="email" value="' + esc(payer.email) + '"></div></div>';
      }
      if (method === "momo" || method === "telecel") {
        var pv = PROV[method], toNum = pv.num || (method === "telecel" ? a.momoNumber : ""), toName = pv.num ? pv.acct : a.momoName;
        var manual = toNum ? row(pv.num ? pv.name + " number" : "MTN MoMo number", toNum, true) + row("Account name", toName) + '<div class="pay-row js-amt-row"' + (amt ? "" : ' style="display:none"') + '><span>Amount</span><b class="js-amt">' + (amt ? money(amt) : "") + "</b></div>" + row("Reference", ref, true) +
          '<ol class="pay-steps"><li>Dial <b>' + pv.ussd + "</b>" + (IS_ANDROID ? ' (<a href="tel:' + pv.tel + '">tap to dial</a>)' : "") + " or open the " + pv.name + " app.</li><li>Choose " + pv.menu + (pv.num ? "" : ", then <b>Other Networks</b>") + ".</li><li>Enter <b>" + esc(toNum) + "</b> and check the name shows <b>" + esc(toName || "the church") + "</b>.</li><li>Enter <span class=\"js-amt-txt\">" + amtTxt + "</span>, use the reference above, and <b>approve with your PIN</b>.</li><li>Then tell us below so we can record your gift.</li></ol>" : missing;
        html = '<div class="momo-pay">' +
          '<div class="secure-head">' + lock + "<div><b>Pay with " + pv.name + "</b><small>" +
            (online ? "Tap Pay, choose <b>" + pv.name + "</b> and confirm your number. A prompt then appears on your phone: <b>enter your " + pv.short + " PIN to approve</b>. Payments are processed securely by Paystack; the church never sees your PIN."
                    : "Tap Pay to open your phone's " + pv.name + " menu, then follow the steps to send and <b>approve with your PIN</b>.") + "</small></div></div>" +
          (online ? payerFields("Your " + pv.name + " number", true) : "") +
          '<button class="btn btn-red pay-now js-pay" type="button" id="payNow" data-label="with ' + esc(pv.name) + '">' + (amt ? "Pay " + money(amt) + " with " + pv.name : "Enter an amount above to pay") + "</button>" +
          '<p class="pay-msg" id="payMsg" role="status"></p></div>' +
          (online ? '<details class="manual-pay"><summary>Or send it yourself to the church ' + (pv.num ? pv.name : "MoMo") + " number</summary>" + manual + "</details>"
                  : '<div class="manual-pay open" id="manualSteps">' + manual + "</div>");
      } else if (method === "card") {
        html = '<div class="momo-pay"><div class="secure-head">' + lock + "<div><b>Pay with a bank card</b><small>Visa or Mastercard, processed securely by Paystack. The church never sees your card details.</small></div></div>" +
          payerFields("Phone", false) +
          '<button class="btn btn-red pay-now js-pay" type="button" id="payNow" data-label="by card">' + (amt ? "Pay " + money(amt) + " by card" : "Enter an amount above to pay") + "</button>" +
          '<p class="pay-msg" id="payMsg" role="status"></p></div>';
      } else {
        if (!a.banks || !a.banks.length) html = missing;
        else {
          var match = a.banks.filter(function (x) { return sameBank(x.bank, memberBank); })[0], acct = match || a.banks[0];
          html = bankSelect() + '<div class="bank-card">' + row("Bank", acct.bank) + row("Account name", acct.accountName) + row("Account number", acct.accountNumber, true) + row("Branch", acct.branch) + row("Amount", amt ? money(amt) : "") + row("Reference", ref, true) + "</div>" +
            (!memberBank ? '<p class="pay-note">Choose your bank above for step-by-step help.</p>' :
              match ? '<ol class="pay-steps"><li>Open your <b>' + esc(memberBank) + "</b> app or internet banking (or visit a branch).</li><li>Choose <b>Transfer within " + esc(acct.bank) + "</b> (same bank).</li><li>Enter the account number above and check the account name.</li><li>Enter " + amtTxt + " and the reference, then confirm.</li><li>Then tell us below.</li></ol>"
                : '<ol class="pay-steps"><li>Open your <b>' + esc(memberBank) + '</b> app or internet banking (or visit a branch).</li><li>Choose <b>Transfer to another bank</b> (GhIPSS Instant Pay / interbank).</li><li>Select <b>' + esc(acct.bank) + "</b> and enter the account number above.</li><li>Enter " + amtTxt + " and the reference, then confirm.</li><li>Then tell us below.</li></ol>") +
            (a.banks.length > 1 ? '<p class="pay-note">Other church accounts: ' + a.banks.filter(function (x) { return x !== acct; }).map(function (x) { return esc(x.bank) + " " + esc(x.accountNumber); }).join(" &middot; ") + "</p>" : "");
        }
      }
      if (!cur.own && method !== "card") html = '<p class="pay-note">' + esc(cur.name) + " receives gifts through the Headquarters accounts. Please keep <b>" + esc(cur.short) + "</b> in your reference so it reaches the branch.</p>" + html;
      $("#payPanel").innerHTML = html;
      $$("#payPanel .copy-btn").forEach(function (x) { x.onclick = function () { copyText(x.getAttribute("data-copy"), x); }; });
      var mb = $("#myBank"); if (mb) mb.onchange = function () { memberBank = mb.value; try { localStorage.setItem("tiwc-my-bank", memberBank); } catch (e) {} drawMethod(); };
      var pn = $("#payNow"); if (pn) pn.onclick = function () { payNow(method); };
      ["Name", "Phone", "Email"].forEach(function (k) { var el = $("#pay" + k); if (el) el.oninput = function () { payer[k.toLowerCase()] = el.value; }; });
      $("#giveSummary").textContent = (amt ? money(amt) + " · " : "") + offering + " → " + cur.name;
      if (amt && $("#gc-amount") && !$("#gc-amount").dataset.touched) $("#gc-amount").value = amt;
    }

    // ----- Pay button -----
    function payNow(m) {
      var amt = amount(), msg = $("#payMsg");
      if (!amt) { msg.className = "pay-msg err"; msg.textContent = "Please enter the amount you want to give (step 3)."; amountInput.focus(); return; }
      if (amt < 1) { msg.className = "pay-msg err"; msg.textContent = "The smallest amount is GHS 1."; return; }
      if (!online) {
        // No payment gateway yet: open the phone's MoMo / Telecel menu and show the steps
        var box = $("#manualSteps");
        if (box) { box.classList.add("flash"); box.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(function () { box.classList.remove("flash"); }, 1600); }
        if (IS_ANDROID) { window.location.href = "tel:" + (m === "telecel" ? "*110%23" : "*170%23"); msg.className = "pay-msg"; msg.textContent = "Opening your phone's menu… follow the steps below and approve with your PIN."; }
        else { msg.className = "pay-msg"; msg.innerHTML = "Open your <b>Phone</b> app and dial <b>" + (m === "telecel" ? "*110#" : "*170#") + "</b> (or open the " + (m === "telecel" ? "Telecel Cash" : "MoMo") + " app), then follow the steps below and approve with your PIN."; }
        return;
      }
      var name = payer.name.trim(), phone = payer.phone.trim(), email = payer.email.trim();
      if (!name) { msg.className = "pay-msg err"; msg.textContent = "Please enter your name."; $("#payName").focus(); return; }
      var digitsOnly = phone.replace(/\D/g, "");
      if (m !== "card" && !/^(0\d{9}|233\d{9})$/.test(digitsOnly)) { msg.className = "pay-msg err"; msg.textContent = "Please enter your " + (m === "telecel" ? "Telecel Cash" : "MTN MoMo") + " number, e.g. 024 123 4567."; $("#payPhone").focus(); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.className = "pay-msg err"; msg.textContent = "That email address doesn't look right."; return; }
      msg.className = "pay-msg"; msg.textContent = "Opening the secure payment window…";
      loadPaystack(function (err) {
        if (err || !window.PaystackPop) { msg.className = "pay-msg err"; msg.textContent = "The secure payment window could not load. Check your internet connection, or send directly using the details below."; return; }
        var ref = "TIWC-" + cur.id.toUpperCase().slice(0, 12) + "-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
        var provider = m === "telecel" ? "Telecel Cash" : m === "momo" ? "MTN MoMo" : "Card";
        var opts = {
          // Paystack needs an email; without one the receipt goes to the church
          key: G.paystackPublicKey, email: email || (C.contact || {}).email || S.adminEmail, amount: Math.round(amt * 100), currency: "GHS", ref: ref,
          channels: [m === "card" ? "card" : "mobile_money"],
          firstname: name.split(" ")[0], lastname: name.split(" ").slice(1).join(" "), phone: digitsOnly,
          metadata: { given_to: cur.name, branch_id: cur.id, offering: offering, giver_name: name, giver_phone: digitsOnly, provider: provider,
            custom_fields: [{ display_name: "Given to", variable_name: "given_to", value: cur.name }, { display_name: "Offering", variable_name: "offering", value: offering },
              { display_name: "Name", variable_name: "giver_name", value: name }, { display_name: "Phone", variable_name: "giver_phone", value: digitsOnly || "-" }, { display_name: "Paid with", variable_name: "provider", value: provider }] },
          callback: function (resp) { showReceipt(resp && resp.reference ? resp.reference : ref, amt, name, provider, !!email); },
          onClose: function () { if (!$("#giveReceipt").classList.contains("show")) { msg.className = "pay-msg"; msg.textContent = "Payment window closed. If you did not approve with your PIN, no money was taken."; } }
        };
        if (cur.subaccount) opts.subaccount = cur.subaccount;
        try { window.PaystackPop.setup(opts).openIframe(); msg.textContent = m === "card" ? "" : "Check your phone: approve the payment with your PIN when the prompt appears."; }
        catch (e) { msg.className = "pay-msg err"; msg.textContent = "Online giving is not set up correctly yet. Please send directly using the details below, or contact the church office."; }
      });
    }
    function showReceipt(reference, amt, name, provider, emailed) {
      var r = $("#giveReceipt");
      r.innerHTML = '<div class="receipt-card"><div class="rc-tick"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
        "<h2>Thank you, " + esc(name.split(" ")[0]) + "!</h2><p>Your gift was received successfully. God bless you.</p>" +
        row("Amount", money(amt)) + row("Given to", cur.name) + row("Offering", offering) + row("Paid with", provider) + row("Reference", reference, true) + row("Date", new Date().toLocaleString()) +
        '<p class="pay-note">' + (emailed ? "A receipt has also been sent to your email. " : "") + "Keep the reference above for your records (take a screenshot or print this page).</p>" +
        '<div class="hero-actions"><button class="btn btn-green" type="button" onclick="window.print()">Print / save receipt</button><a class="btn btn-outline-dark" href="index.html">Back to home</a></div></div>';
      r.classList.add("show");
      $$("#payPanel .copy-btn, #giveReceipt .copy-btn").forEach(function (x) { x.onclick = function () { copyText(x.getAttribute("data-copy"), x); }; });
      r.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    sel.addEventListener("change", function () { cur = recips.filter(function (r) { return r.id === sel.value; })[0]; drawOfferings(); drawMethod(); });
    $$("#payTabs button").forEach(function (x) { x.onclick = function () { method = x.getAttribute("data-m"); drawMethod(); }; });
    amountInput.addEventListener("input", function () {
      var pn = $("#payNow"), amt = amount();
      if (method === "bank") { drawMethod(); return; }
      if (pn) pn.textContent = amt ? "Pay " + money(amt) + " " + pn.getAttribute("data-label") : "Enter an amount above to pay";
      $$(".js-amt").forEach(function (x) { x.textContent = amt ? money(amt) : ""; });
      $$(".js-amt-row").forEach(function (x) { x.style.display = amt ? "" : "none"; });
      $$(".js-amt-txt").forEach(function (x) { x.innerHTML = amt ? "<b>" + money(amt) + "</b>" : "the amount"; });
      if (amt && $("#gc-amount") && !$("#gc-amount").dataset.touched) $("#gc-amount").value = amt;
      $("#giveSummary").textContent = (amt ? money(amt) + " · " : "") + offering + " → " + cur.name;
    });
    $$(".amt-chip").forEach(function (x) { x.onclick = function () { amountInput.value = x.getAttribute("data-a"); amountInput.dispatchEvent(new Event("input")); }; });
    if (G.onlineLink && !online) { $("#giveOnline").innerHTML = '<a class="btn btn-red" href="' + esc(G.onlineLink) + '" target="_blank" rel="noopener">Pay Online (card / mobile money)</a>'; }
    drawOfferings(); drawMethod();

    // After a MoMo / bank transfer: let the church know
    var form = $("#giveConfirm");
    $("#gc-amount").addEventListener("input", function () { this.dataset.touched = "1"; });
    function confirmText() {
      var methods = { card: "Card (Paystack)", momo: "MTN Mobile Money", telecel: "Telecel Cash", bank: "Bank transfer" + (memberBank ? " from " + memberBank : "") };
      return "Hello, I have given to Thyword International Worship Centre.\n\nGiven to: " + cur.name + "\nOffering: " + offering +
        "\nAmount: GHS " + (form.amount.value.trim() || "-") + "\nMethod: " + methods[method] + "\nTransaction ID: " + (form.txn.value.trim() || "-") +
        "\nName: " + form.name.value.trim() + (form.phone.value.trim() ? "\nPhone: " + form.phone.value.trim() : "");
    }
    function check() {
      var st = $(".form-status", form);
      if (!form.name.value.trim() || !form.amount.value.trim()) { st.className = "form-status err"; st.textContent = "Please add your name and the amount you gave."; return false; }
      st.className = "form-status"; st.textContent = ""; return true;
    }
    $("#confirmWa").addEventListener("click", function () {
      if (!check()) return;
      var link = waTo(G.confirmWhatsapp || ct.whatsapp, confirmText());
      if (link) window.open(link, "_blank");
    });
    $("#confirmEmail").addEventListener("click", function () {
      if (!check()) return;
      var st = $(".form-status", form);
      chooseSendApp({ title: "Send with", subject: "Giving confirmation: " + offering + " - " + cur.name + " - " + form.name.value.trim(), body: confirmText(),
        onOpened: function (n, link) { st.className = "form-status ok"; st.innerHTML = "Opening " + esc(n) + "... press <b>Send</b> there. " + '<a href="' + esc(link) + '" target="_blank" rel="noopener">Tap here if it did not open</a>.'; },
        onWebsite: function () {
          st.className = "form-status"; st.textContent = "Sending...";
          sendForm({ _subject: "Giving confirmation: " + offering + " - " + cur.name, _template: "table", _captcha: "false", message: confirmText() })
            .then(function () { st.className = "form-status ok"; st.textContent = "Thank you! The church has been notified. God bless you."; form.reset(); })
            .catch(function () { st.className = "form-status err"; st.textContent = "Sorry, that didn't send. Please use WhatsApp or choose an email app."; });
        } });
    });
    if (!(G.confirmWhatsapp || ct.whatsapp)) $("#confirmWa").classList.add("hidden");
  };

  pages.live = function () {
    var L = C.live || {};
    var tab = "youtube";
    var player = $("#livePlayer");
    function emptyState(platform) {
      var url = platform === "facebook" ? S.facebookPageUrl : S.youtubeUrl;
      return '<div class="player-empty"><img src="' + esc(S.logo) + '" alt=""><h3>We are not live on ' + (platform === "facebook" ? "Facebook" : "YouTube") + " right now</h3>" +
        "<p>Check our service times below, or visit our " + (platform === "facebook" ? "Facebook page" : "YouTube channel") + " to watch past services.</p>" +
        '<a class="btn btn-gold btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener">Open ' + (platform === "facebook" ? "Facebook" : "YouTube") + "</a></div>";
    }
    function drawPlayer() {
      $$(".platform-tabs button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === tab); });
      if (tab === "youtube") {
        if (liveState.ytVideoId) player.innerHTML = '<iframe src="https://www.youtube.com/embed/' + liveState.ytVideoId + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="YouTube live"></iframe>';
        else if (liveState.youtube && S.youtubeChannelId) player.innerHTML = '<iframe src="https://www.youtube.com/embed/live_stream?channel=' + esc(S.youtubeChannelId) + '&autoplay=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="YouTube live"></iframe>';
        else player.innerHTML = emptyState("youtube");
      } else {
        if (liveState.facebook && L.facebookLiveUrl) player.innerHTML = '<iframe src="https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(L.facebookLiveUrl) + '&show_text=false&autoplay=true" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Facebook live"></iframe>';
        else if (liveState.facebook) player.innerHTML = '<div class="player-empty"><img src="' + esc(S.logo) + '" alt=""><h3>We are LIVE on Facebook</h3><p>Tap below to join the live service on our Facebook page.</p><a class="btn btn-gold btn-sm" href="' + esc(S.facebookPageUrl) + '" target="_blank" rel="noopener">Watch on Facebook</a></div>';
        else player.innerHTML = emptyState("facebook");
      }
    }
    function drawStatus() {
      var row = function (name, icon, on, url) {
        return '<div class="status-row"><span class="plat">' + icon + " " + name + '</span><span><span class="pill' + (on ? " on" : "") + '">' + (on ? "Live now" : "Offline") + "</span></span></div>";
      };
      $("#liveStatus").innerHTML = row("YouTube", '<span style="color:#e01e1e">' + ICON.yt + "</span>", liveState.youtube) +
        row("Facebook", '<span style="color:#1877f2">' + ICON.fb + "</span>", liveState.facebook);
      $("#liveTitle").textContent = (liveState.youtube || liveState.facebook) ? ("Live now: " + (liveState.ytTitle || L.title || "Church Service")) : "Watch our services live";
    }
    onLiveChange = function () {
      // Jump to whichever platform is live
      if (!liveState.youtube && liveState.facebook) tab = "facebook";
      drawStatus(); drawPlayer();
    };
    $$(".platform-tabs button").forEach(function (b) { b.addEventListener("click", function () { tab = b.getAttribute("data-tab"); drawPlayer(); }); });

    // Facebook page timeline (shows live videos + posts)
    if (S.facebookPageUrl) {
      $("#fbEmbed").innerHTML = '<iframe src="https://www.facebook.com/plugins/page.php?href=' + encodeURIComponent(S.facebookPageUrl) +
        '&tabs=timeline&width=500&height=640&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true" height="640" scrolling="no" allow="encrypted-media" title="Facebook page"></iframe>';
    }

    // Browser notifications while the site is open
    var nb = $("#notifyBtn");
    if (!("Notification" in window)) nb.classList.add("hidden");
    else {
      var setLabel = function () { nb.textContent = Notification.permission === "granted" ? "Live alerts on for this browser" : "Alert me in this browser"; nb.disabled = Notification.permission !== "default"; };
      setLabel();
      nb.addEventListener("click", function () { Notification.requestPermission().then(setLabel); });
    }

    $("#serviceTimes").innerHTML = (C.serviceTimes || []).map(function (t) {
      return '<div class="status-row"><span class="plat">' + ICON.clock + " " + esc(t.name) + '</span><span class="pill">' + esc(t.day) + " " + esc(t.time) + "</span></div>";
    }).join("");
    $("#socialCards").innerHTML = socialCards();
    $("#subscribeBox").innerHTML = subscribeBlock();

    // Re-check live status every 3 minutes while the page is open
    setInterval(function () { store("tiwc-yt-live", ""); updateLive(); }, 3 * 60 * 1000);
  };

  pages.contact = function () {
    var ct = C.contact || {};
    var cards = [];
    cards.push('<div class="contact-card reveal"><span class="ci">' + big(ICON.phone, 22) + "</span><h3>Call Us</h3>" +
      (ct.phones || []).map(function (p) { return '<a href="' + telLink(p) + '">' + esc(p) + "</a>"; }).join("") + "</div>");
    if (waLink()) cards.push('<div class="contact-card reveal"><span class="ci" style="color:#25d366">' + big(ICON.wa, 22) + '</span><h3>WhatsApp</h3><a href="' + waLink("Hello Thyword International Worship Centre,") + '" target="_blank" rel="noopener">Chat with us on WhatsApp</a><p>+' + esc(ct.whatsapp) + "</p></div>");
    cards.push('<div class="contact-card reveal"><span class="ci">' + big(ICON.mail, 22) + "</span><h3>Email</h3>" +
      (ct.email ? '<a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a>" : "<p>Use the message form below</p>") +
      (ct.officeHours ? "<p>" + esc(ct.officeHours) + "</p>" : "") + "</div>");
    cards.push('<div class="contact-card reveal"><span class="ci">' + big(ICON.pin, 22) + "</span><h3>Visit Us</h3><p>" + esc(ct.address) + "</p>" +
      '<a href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ct.mapQuery || ct.address || "") + '" target="_blank" rel="noopener">Get directions</a></div>');
    $("#contactCards").innerHTML = cards.join("");

    $("#socialLinks").innerHTML =
      (S.facebookPageUrl ? '<a class="btn btn-sm" style="background:#1877f2;color:#fff" href="' + esc(S.facebookPageUrl) + '" target="_blank" rel="noopener">' + ICON.fb + " Facebook</a>" : "") +
      (S.youtubeUrl ? '<a class="btn btn-sm" style="background:#e01e1e;color:#fff" href="' + esc(S.youtubeUrl) + '" target="_blank" rel="noopener">' + ICON.yt + " YouTube</a>" : "") +
      (waLink() ? '<a class="btn btn-sm" style="background:#25d366;color:#fff" href="' + waLink() + '" target="_blank" rel="noopener">' + ICON.wa + " WhatsApp</a>" : "");

    if (ct.mapQuery || ct.address) {
      $("#map").innerHTML = '<iframe loading="lazy" title="Map" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + encodeURIComponent(ct.mapQuery || ct.address) + '&z=15&output=embed"></iframe>';
    }

    $("#branchList").innerHTML = branchList().map(function (b) {
      return '<a class="branch-card reveal' + (b.hq ? " is-hq" : "") + '" href="branches.html#' + b.id + '">' + big(ICON.church, 22) + "<div><h4>" + esc(b.name) + (b.hq ? ' <span class="hq-badge">HQ</span>' : "") + "</h4><p>" + esc(b.location) + "</p>" +
        (b.phone ? "<p>" + esc(b.phone) + "</p>" : "") + '<p class="branch-more">Pastor, programmes &amp; contact &rarr;</p></div></a>';
    }).join("");

    $("#serviceTimes").innerHTML = (C.serviceTimes || []).map(function (t) {
      return '<div class="status-row"><span class="plat">' + ICON.clock + " " + esc(t.name) + '</span><span class="pill">' + esc(t.day) + " " + esc(t.time) + "</span></div>";
    }).join("");

    if ($("#churchEmail")) $("#churchEmail").textContent = ct.email || "";
    var form = $("#contactForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var st = $(".form-status", form), btn = $("button[type=submit]", form);
      var data = { name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(), topic: form.topic.value, message: form.message.value.trim() };
      if (!data.name || !data.phone || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { st.className = "form-status err"; st.textContent = "Please fill in your name, a valid email address, your phone number and your request."; return; }
      var subject = "Website request (" + data.topic + ") from " + data.name;
      var body = "Name: " + data.name + "\nEmail: " + data.email + "\nPhone: " + data.phone + "\nSubject: " + data.topic + "\n\n" + data.message;
      st.className = "form-status"; st.textContent = "";
      chooseSendApp({
        title: "Send with",
        subject: subject,
        body: body,
        onOpened: function (appName, link) {
          st.className = "form-status ok";
          st.innerHTML = "Opening " + esc(appName) + " with your request ready. Please press <b>Send</b> there to deliver it to the church. " +
            '<a href="' + esc(link) + '" target="_blank" rel="noopener">Tap here if it did not open</a>.';
        },
        onWebsite: function () {
          btn.disabled = true; st.className = "form-status"; st.textContent = "Sending...";
          sendForm({ _subject: subject, _template: "table", _captcha: "false", _replyto: data.email, name: data.name, email: data.email, phone: data.phone, topic: data.topic, message: data.message })
            .then(function () { st.className = "form-status ok"; st.textContent = "Thank you! Your request has been sent to the church's email. We will get back to you soon."; form.reset(); })
            .catch(function () {
              st.className = "form-status err";
              st.innerHTML = "Sorry, the website couldn't send it right now. Press <b>Send to Church</b> again and choose Gmail, Outlook, Yahoo or your email app. Your message is still filled in.";
            })
            .then(function () { btn.disabled = false; });
        }
      });
    });
    $("#subscribeBox").innerHTML = subscribeBlock();
  };

  /* ---------- header: hides after 5 seconds without scrolling, comes back on scroll ---------- */
  function autoHideHeader() {
    var header = $(".site-header");
    if (!header) return;
    var timer;
    var stuck = function () { return header.getBoundingClientRect().top <= 0 && window.scrollY > 0; };
    // Only hold the header open while the phone menu is open or someone is using the keyboard in it.
    // (A mouse pointer simply resting on the header no longer keeps it showing; that is what
    // stopped it hiding on laptops, where the pointer often sits at the top after clicking a link.)
    var busy = function () {
      var nav = $(".main-nav");
      if (nav && nav.classList.contains("open")) return true;
      var f = document.activeElement;
      return !!(f && header.contains(f) && f.matches && f.matches(":focus-visible"));
    };
    var show = function () { header.classList.remove("header-hidden"); };
    var schedule = function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (busy()) return schedule();
        if (stuck()) header.classList.add("header-hidden");   // at the very top the header stays in place
      }, 5000);
    };
    var wake = function () { show(); schedule(); };
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("touchmove", wake, { passive: true });
    window.addEventListener("wheel", wake, { passive: true });
    document.addEventListener("keydown", function (e) { if (/^(Arrow|Page|Home|End| )/.test(e.key)) wake(); });
    header.addEventListener("focusin", function () { if (busy()) show(); });
    document.addEventListener("mousemove", function (e) {
      // Pointer at the very top edge brings it back; moving the pointer over the visible header
      // (e.g. heading for a menu link) gives a fresh 5 seconds so it doesn't vanish under the cursor
      if (e.clientY < 12) return wake();
      if (!header.classList.contains("header-hidden") && e.clientY < header.getBoundingClientRect().bottom) schedule();
    });
    schedule();
  }

  /* ---------- boot ---------- */
  loadContent(function (content) {
    C = content; S = C.settings || {};
    countPageLoad();
    renderHeader();
    renderFooter();
    var page = document.body.getAttribute("data-page");
    if (pages[page]) pages[page]();
    bindZoom();
    bindSubscribe();
    autoHideHeader();
    tickCountdowns(); setInterval(tickCountdowns, 1000);
    updateLive();
    reveal();
  });
})();
