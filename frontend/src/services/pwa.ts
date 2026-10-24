import { ref } from 'vue'

// Événement propre à Chrome/Edge (pas encore dans les types du DOM)
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Le navigateur propose l'installation : on garde l'événement pour l'afficher sur un bouton
let installEvent: BeforeInstallPromptEvent | null = null
export const canInstall = ref(false)
export const online = ref(navigator.onLine)

export function setupPwa() {
    // Pas de service worker en dev : son cache gênerait le rechargement à chaud de Vite.
    // Il n'est disponible qu'en HTTPS (ou sur localhost)
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch((err) => {
                console.warn('Service worker non enregistré :', err)
            })
        })
    }

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault()
        installEvent = event as BeforeInstallPromptEvent
        canInstall.value = true
    })
    window.addEventListener('appinstalled', () => {
        installEvent = null
        canInstall.value = false
    })

    window.addEventListener('online', () => (online.value = true))
    window.addEventListener('offline', () => (online.value = false))
}

export async function install() {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    // L'événement ne sert qu'une fois, accepté ou non
    installEvent = null
    canInstall.value = false
}
