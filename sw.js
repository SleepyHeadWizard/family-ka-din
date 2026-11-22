// Family Ka Din service worker: works offline-safe and shows reminders and family notifications.
const SHELL = "fkd-shell-v1";
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

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Family Ka Din", {
    body: d.body || "Aaj ka pal daala?",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || "family-nudge",   // one per kind: a new photo doesn't hide a comment
    renotify: true,
    data: { url: d.url || "./" }
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
    for (const w of wins) if ("focus" in w) return w.focus();
    return self.clients.openWindow(e.notification.data.url || "./");
  }));
});
