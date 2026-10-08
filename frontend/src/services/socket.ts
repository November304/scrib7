import { ref } from 'vue'
import type { ServerMessage } from '@/types'

type Listener = (msg: ServerMessage) => void
export type SocketStatus = 'idle' | 'connecting' | 'open' | 'closed'

const MAX_RETRY_DELAY = 10_000

// Une seule connexion WebSocket pour toute l'application, avec reconnexion automatique
class Socket {
    status = ref<SocketStatus>('idle')
    private ws: WebSocket | null = null
    private listeners = new Set<Listener>()
    private openListeners = new Set<() => void>()
    private retries = 0
    private retryTimer: ReturnType<typeof setTimeout> | undefined
    private wanted = false

    connect() {
        this.wanted = true
        if (this.ws && this.ws.readyState <= WebSocket.OPEN) return
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
        this.status.value = 'connecting'
        this.ws = new WebSocket(`${protocol}://${location.host}/ws`)

        this.ws.onopen = () => {
            this.retries = 0
            this.status.value = 'open'
            this.openListeners.forEach((fn) => fn())
        }
        this.ws.onmessage = (event) => {
            const msg = JSON.parse(event.data) as ServerMessage
            this.listeners.forEach((fn) => fn(msg))
        }
        this.ws.onclose = () => {
            this.ws = null
            this.status.value = 'closed'
            if (!this.wanted) return
            // Backoff exponentiel : 0.5s, 1s, 2s, 4s... plafonné à 10s
            const delay = Math.min(500 * 2 ** this.retries++, MAX_RETRY_DELAY)
            this.retryTimer = setTimeout(() => this.connect(), delay)
        }
    }

    disconnect() {
        this.wanted = false
        clearTimeout(this.retryTimer)
        this.ws?.close()
        this.status.value = 'idle'
    }

    send(msg: { type: string; [key: string]: unknown }) {
        if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg))
    }

    onMessage(fn: Listener) {
        this.listeners.add(fn)
        return () => this.listeners.delete(fn)
    }

    // Appelé à chaque (re)connexion : permet de rejoindre à nouveau la salle
    onOpen(fn: () => void) {
        this.openListeners.add(fn)
        if (this.status.value === 'open') fn()
        return () => this.openListeners.delete(fn)
    }
}

export const socket = new Socket()
