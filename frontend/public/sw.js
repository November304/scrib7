// Service worker de Scrib7 : met en cache la coquille de l'application pour qu'elle
// s'ouvre instantanément (et même hors ligne). Le jeu lui-même passe par /api et le
// WebSocket, qui ne sont jamais mis en cache : ils ont besoin du serveur.

// Changer la version vide les anciens caches à l'activation du nouveau service worker
const VERSION = 'v1'
const CACHE = `scrib7-${VERSION}`

// Coquille minimale téléchargée dès l'installation
const SHELL = ['/', '/logo.svg', '/favicon.ico', '/icon-192.png', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)))
    // Pas besoin d'attendre la fermeture des onglets ouverts pour prendre le relais
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
            )
            .then(() => self.clients.claim()),
    )
})

self.addEventListener('fetch', (event) => {
    const { request } = event
    if (request.method !== 'GET') return
    const url = new URL(request.url)

    // L'API dépend de la session (cookie) : toujours le réseau, jamais le cache
    if (url.origin === location.origin && url.pathname.startsWith('/api')) return

    // Pages (/, /login, /room/ABCDE…) : le réseau d'abord pour avoir la dernière version,
    // sinon l'index.html en cache (c'est une SPA : Vue Router s'occupe ensuite de l'URL)
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request, '/'))
        return
    }

    // Fichiers du build Vite : leur nom contient un hash, ils ne changent jamais
    if (url.origin === location.origin && /\/assets\/.+-[\w-]{8,}\.\w+$/.test(url.pathname)) {
        event.respondWith(cacheFirst(request))
        return
    }

    // Le reste (images, textures, avatars, polices Google) : réponse immédiate depuis le
    // cache, et mise à jour en arrière-plan pour la prochaine fois
    if (
        url.origin === location.origin ||
        url.hostname.endsWith('fonts.gstatic.com') ||
        url.hostname.endsWith('fonts.googleapis.com')
    ) {
        event.respondWith(staleWhileRevalidate(event))
    }
})

async function networkFirst(request, fallbackUrl) {
    const cache = await caches.open(CACHE)
    try {
        const response = await fetch(request)
        if (response.ok) cache.put(fallbackUrl, response.clone())
        return response
    } catch {
        return (await cache.match(fallbackUrl)) ?? Response.error()
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
}

async function staleWhileRevalidate(event) {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(event.request)
    const update = fetch(event.request)
        .then((response) => {
            // ok ou opaque (requête cross-origin sans CORS, typiquement une police)
            if (response.ok || response.type === 'opaque') {
                cache.put(event.request, response.clone())
            }
            return response
        })
        .catch(() => cached ?? Response.error())
    // On garde le service worker en vie jusqu'à la fin de la mise à jour du cache
    event.waitUntil(update)
    return cached ?? update
}
