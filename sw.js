const CACHE_NAME = "bluelock-coach-v1";

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

// Red primero (para tener siempre la última versión mientras haya
// conexión), y si falla (sin conexión), sirve de la caché lo que ya se
// haya visitado antes — así la app queda utilizable offline poco a
// poco, sin necesitar una lista fija de archivos a precachear.
//
// cache:"no-store" es imprescindible aquí: GitHub Pages manda
// Cache-Control: max-age=600 en los estáticos, y un fetch() normal
// respeta esa caché HTTP del propio navegador — así que sin esto,
// "red primero" en realidad devolvía sin más una respuesta de hasta
// 10 minutos de antigüedad servida desde la caché HTTP, no una
// petición de red de verdad. Esto explica que varios cambios de esta
// sesión no se vieran de inmediato aunque el deploy ya estuviera listo.
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request, { cache: "no-store" })
            .then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
