/* Service worker minimalista: app shell offline (network-first con fallback).
   La API del servidor NUNCA se cachea (otro origen + datos vivos).
   v2: caches versionados -> al cambiar la version se borran los viejos
   y la app se actualiza sola sin quedar con JS obsoleto.
   v3: + notificaciones (message -> showNotification, click -> abrir la PWA).
   v4: nueva version de estilos y chat (copiar codigo, ir al final). */
const CACHE = "ocmovil-v4";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) =>
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.startsWith("ocmovil-") && k !== CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  )
);

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API externa: sin caché

  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch (err) {
        const cached = await cache.match(req, { ignoreSearch: true });
        if (cached) return cached;
        if (req.mode === "navigate") {
          const shell = await cache.match("./");
          if (shell) return shell;
        }
        return Response.error();
      }
    })()
  );
});

/* ---- notificaciones locales (sin servidor push) ----
   La pagina pide al SW que muestre la notificacion: es la via que funciona en
   Android y la unica disponible si la pestana no esta en primer plano. */
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type !== "notify") return;
  self.registration.showNotification(d.title || "OpenCode Móvil", {
    body: d.body || "",
    tag: d.tag || "ocmovil",
    renotify: true,
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: { url: d.url || "./#/permissions" },
  });
});

/* Al pulsar la notificacion: enfocar una ventana abierta o abrir la PWA. */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const destino = e.notification.data?.url || "./#/permissions";
  e.waitUntil(
    (async () => {
      const clientes = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of clientes) {
        if ("focus" in c) {
          await c.focus();
          if ("navigate" in c) await c.navigate(destino).catch(() => {});
          return;
        }
      }
      await self.clients.openWindow(destino);
    })()
  );
});
