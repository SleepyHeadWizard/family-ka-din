// Family Ka Din service worker: works offline-safe and shows reminder notifications.
const SHELL = "fkd-shell-v2";
const FILES = ["./", "./index.html", "./config.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Pages: try the network first (so updates show up at once), fall back to the
// saved copy when offline. The app then shows its own "Net nahi mil raha" screen.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(SHELL).then((c) => c.put("./index.html", copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html").then((r) => r || caches.match("./"))));
    return;
  }
  e.respondWith(fetch(req).catch(() => caches.match(req, { ignoreSearch: true })));
});

// Each kind of activity gets its own tag (so a new photo doesn't replace a comment alert)
// and its own vibration rhythm. Web pages can't pick the notification sound itself:
// the phone plays its normal notification sound.
const VIBE = { photo:[60,40,60], dil:[90,110,90], stamp:[80], react:[30], comment:[40,60,40], doodle:[20,30,20,30,20], join:[100,60,100], nudge:[50] };
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  const kind = VIBE[d.kind] ? d.kind : "nudge";
  e.waitUntil(self.registration.showNotification(d.title || "Family Ka Din", {
    body: d.body || "Aaj ka pal daala?",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: kind === "nudge" ? "family-nudge" : "fkd-" + kind,
    renotify: kind !== "nudge",
    vibrate: VIBE[kind],
    data: { url: d.url || "./", go: d.go || null }
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
    for (const w of wins) if ("focus" in w) {
      if (data.go) w.postMessage({ fkd: "go", go: data.go });
      return w.focus();
    }
    return self.clients.openWindow(data.url || "./");
  }));
});
