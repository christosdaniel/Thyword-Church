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
  function loadContent(cb) {
    var s = document.createElement("script");
    // A timestamp stops browsers showing yesterday's copy after an update.
    s.src = "data/content.js?v=" + Date.now();
    s.onload = function () { cb(window.SITE_CONTENT || {}); };
    s.onerror = function () { cb(window.SITE_CONTENT || {}); };
    document.head.appendChild(s);
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
      '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>' +
      '<nav class="main-nav" aria-label="Main"><ul>' +
      navLink("index.html", "Home", "home") +
      navLink("index.html#about", "About", "") +
      navLink("index.html#events", "Events", "") +
      navLink("pictures.html", "Pictures", "pictures") +
      navLink("videos.html", "Videos", "videos") +
      navLink("contact.html", "Contact", "contact") +
      '<li class="nav-live"><a class="btn btn-red btn-sm" href="live.html">' + big(ICON.tv, 16) + ' Watch Live</a><span class="live-badge">LIVE</span></li>' +
      "</ul></nav></div></header>";

    $("#site-header").innerHTML = header;

    var toggle = $(".nav-toggle"), nav = $(".main-nav");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    $$(".main-nav a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); }); });
    var close = $(".announce-close");
    if (close) close.addEventListener("click", function () { $("#announce").remove(); store("tiwc-ann-closed", ann.text); });
  }

  function renderFooter() {
    var ct = C.contact || {};
    var branches = (C.branches || []).map(function (b) {
      return "<li>" + ICON.pin.replace(/16/g, "14") + "<span>" + esc(b.name) + "</span></li>";
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
      '<div><h4>Quick Links</h4><ul><li><a href="index.html">Home</a></li><li><a href="index.html#about">About Us</a></li><li><a href="index.html#events">Upcoming Events</a></li><li><a href="pictures.html">Pictures</a></li><li><a href="videos.html">Videos</a></li><li><a href="live.html">Watch Live</a></li><li><a href="contact.html">Contact Us</a></li></ul></div>' +
      "<div><h4>Contact</h4><ul>" + phones +
      (waLink() ? '<li><a href="' + waLink() + '" target="_blank" rel="noopener">Chat on WhatsApp</a></li>' : "") +
      (ct.email ? '<li><a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a></li>" : "") +
      (ct.address ? "<li>" + esc(ct.address) + "</li>" : "") +
      "</ul></div>" +
      '</div><div class="footer-bottom"><span>&copy; ' + year + " " + esc(S.churchName) + " (" + esc(S.tagline) + '). All rights reserved.</span><a href="admin.html" rel="nofollow">Admin</a></div></div></footer>' +
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
  function eventCard(ev) {
    var d = eventDate(ev);
    var parts = (ev.date || "").split("-").map(Number);
    var id = "cd" + Math.random().toString(36).slice(2, 8);
    var isToday = d && new Date().toDateString() === d.toDateString();
    return '<article class="event-card reveal"><div class="event-img">' +
      (ev.image ? '<img src="' + esc(ev.image) + '" alt="' + esc(ev.title) + '" loading="lazy" data-zoom="' + esc(ev.image) + '" data-caption="' + esc(ev.title) + '">' : "") +
      (parts.length === 3 ? '<div class="event-date"><b>' + parts[2] + "</b><small>" + MONTHS[parts[1] - 1] + " " + parts[0] + "</small></div>" : "") +
      '</div><div class="event-body"><h3>' + esc(ev.title) + "</h3>" +
      (ev.subtitle ? '<div class="event-sub">' + esc(ev.subtitle) + "</div>" : "") +
      '<ul class="event-meta">' +
      "<li>" + ICON.cal + "<span>" + fmtDate(ev.date) + (ev.time ? " &middot; " + esc(ev.time) : "") + "</span></li>" +
      (ev.location ? "<li>" + ICON.pin + "<span>" + esc(ev.location) + "</span></li>" : "") +
      "</ul>" + (ev.description ? "<p>" + esc(ev.description) + "</p>" : "") +
      (isToday ? '<span class="badge-today">Happening today</span>' :
        '<div class="countdown" id="' + id + '" data-time="' + (d ? d.getTime() : "") + '"></div>') +
      "</div></article>";
  }
  function tickCountdowns() {
    $$(".countdown[data-time]").forEach(function (el) {
      var diff = +el.getAttribute("data-time") - Date.now();
      if (diff <= 0) { el.innerHTML = '<span class="badge-today">Happening now</span>'; el.removeAttribute("data-time"); return; }
      var dd = Math.floor(diff / 864e5), hh = Math.floor(diff / 36e5) % 24, mm = Math.floor(diff / 6e4) % 60, ss = Math.floor(diff / 1e3) % 60;
      el.innerHTML = "<div><b>" + dd + "</b><small>Days</small></div><div><b>" + hh + "</b><small>Hrs</small></div><div><b>" + mm + "</b><small>Min</small></div><div><b>" + ss + "</b><small>Sec</small></div>";
    });
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
      (v.description ? "<p>" + esc(v.description) + "</p>" : "") + "</div></article>";
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
  function bindZoom() {
    $$("[data-zoom]").forEach(function (img) {
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
    // Sends the form to the admin's inbox. Uses settings.formEndpoint (e.g. Formspree) if set,
    // otherwise FormSubmit.co with settings.adminEmail. No server needed.
    var url = S.formEndpoint || (S.adminEmail ? "https://formsubmit.co/ajax/" + encodeURIComponent(S.adminEmail) : "");
    if (!url) return Promise.reject(new Error("not-configured"));
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { if (!r.ok) throw new Error("failed"); return r.json().catch(function () { return {}; }); });
  }
  function bindSubscribe() {
    $$(".js-subscribe").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = $(".note", form), btn = $("button", form);
        var email = form.email.value.trim(), name = form.name ? form.name.value.trim() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { note.textContent = "Please enter a valid email address."; return; }
        btn.disabled = true; note.textContent = "Sending...";
        sendForm({ _subject: "New subscriber for event alerts: " + email, _template: "table", _captcha: "false", type: "Newsletter / alerts subscription", name: name, email: email, date: new Date().toString() })
          .then(function () { note.textContent = "Thank you! You've been added to receive our upcoming event and live alerts."; form.reset(); })
          .catch(function (err) {
            if (err.message === "not-configured" && (C.contact || {}).email) {
              window.location.href = "mailto:" + C.contact.email + "?subject=" + encodeURIComponent("Please add me to event alerts") + "&body=" + encodeURIComponent("Name: " + name + "\nEmail: " + email);
              note.textContent = "Opening your email app to complete your subscription...";
            } else note.textContent = "Sorry, we couldn't send that right now. Please reach us on WhatsApp instead.";
          })
          .then(function () { btn.disabled = false; });
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
    var up = upcomingEvents();
    $("#eventsGrid").innerHTML = up.length ? up.slice(0, 6).map(eventCard).join("")
      : '<div class="empty">No upcoming events right now. Check back soon or follow us on Facebook for updates.</div>';

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

    $("#branchList").innerHTML = (C.branches || []).map(function (b) {
      return '<div class="branch-card reveal">' + big(ICON.church, 22) + "<div><h4>" + esc(b.name) + "</h4><p>" + esc(b.location) + "</p>" +
        (b.phone ? '<p><a href="' + telLink(b.phone) + '">' + esc(b.phone) + "</a></p>" : "") + "</div></div>";
    }).join("");

    $("#serviceTimes").innerHTML = (C.serviceTimes || []).map(function (t) {
      return '<div class="status-row"><span class="plat">' + ICON.clock + " " + esc(t.name) + '</span><span class="pill">' + esc(t.day) + " " + esc(t.time) + "</span></div>";
    }).join("");

    var form = $("#contactForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var st = $(".form-status", form), btn = $("button[type=submit]", form);
      var data = { name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(), topic: form.topic.value, message: form.message.value.trim() };
      if (!data.name || !data.message || (!data.email && !data.phone)) { st.className = "form-status err"; st.textContent = "Please add your name, a message, and an email or phone number."; return; }
      btn.disabled = true; st.className = "form-status"; st.textContent = "Sending...";
      sendForm({ _subject: "Website message (" + data.topic + ") from " + data.name, _template: "table", _captcha: "false", name: data.name, email: data.email, phone: data.phone, topic: data.topic, message: data.message })
        .then(function () { st.className = "form-status ok"; st.textContent = "Thank you! Your message has been sent. We will get back to you soon."; form.reset(); })
        .catch(function () {
          // Fall back to WhatsApp so the message is never lost
          var text = "Hello, my name is " + data.name + ".\n" + data.topic + ": " + data.message + (data.phone ? "\nPhone: " + data.phone : "") + (data.email ? "\nEmail: " + data.email : "");
          if (waLink()) { st.className = "form-status ok"; st.innerHTML = 'Opening WhatsApp to send your message... <a href="' + waLink(text) + '" target="_blank" rel="noopener">tap here if it did not open</a>.'; window.open(waLink(text), "_blank"); }
          else { st.className = "form-status err"; st.textContent = "Sorry, we couldn't send that right now. Please call us instead."; }
        })
        .then(function () { btn.disabled = false; });
    });
    $("#subscribeBox").innerHTML = subscribeBlock();
  };

  /* ---------- boot ---------- */
  loadContent(function (content) {
    C = content; S = C.settings || {};
    renderHeader();
    renderFooter();
    var page = document.body.getAttribute("data-page");
    if (pages[page]) pages[page]();
    bindZoom();
    bindSubscribe();
    tickCountdowns(); setInterval(tickCountdowns, 1000);
    updateLive();
    reveal();
  });
})();
