import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { socket } from '@/services/socket'
import { useAuthStore } from '@/stores/auth'
import type { ChatMessage, Player, Point, ServerMessage, Stroke, User } from '@/types'

const MAX_MESSAGES = 200

export const useRoomStore = defineStore('room', () => {
    const auth = useAuthStore()

    const code = ref<string | null>(null)
    const hostId = ref<User['id'] | null>(null)
    const players = ref<Player[]>([])
    const strokes = ref<Stroke[]>([])
    const messages = ref<ChatMessage[]>([])
    const error = ref<{ code: string; message: string } | null>(null)

    const isHost = computed(() => auth.user != null && auth.user.id === hostId.value)

    function addMessage(message: ChatMessage) {
        messages.value.push(message)
        if (messages.value.length > MAX_MESSAGES) messages.value.shift()
    }

    function systemMessage(text: string) {
        addMessage({ from: null, text, at: Date.now() })
    }

    // Annonce les arrivées/départs en comparant l'ancienne et la nouvelle liste
    function updatePlayers(next: Player[]) {
        const before = new Set(players.value.map((p) => p.id))
        const after = new Set(next.map((p) => p.id))
        for (const p of next)
            if (!before.has(p.id)) systemMessage(`${p.username} a rejoint la salle`)
        for (const p of players.value)
            if (!after.has(p.id)) systemMessage(`${p.username} est parti`)
        players.value = next
    }

    function handleMessage(msg: ServerMessage) {
        switch (msg.type) {
            case 'room:state':
                error.value = null
                code.value = msg.code
                hostId.value = msg.hostId
                players.value = msg.players
                strokes.value = msg.strokes
                break
            case 'room:players':
                hostId.value = msg.hostId
                updatePlayers(msg.players)
                break
            case 'room:kicked':
                error.value = { code: 'KICKED', message: msg.reason }
                code.value = null
                break
            case 'chat':
                addMessage({ from: msg.from, text: msg.text, at: msg.at })
                break
            case 'draw:start':
                strokes.value.push(msg.stroke)
                break
            case 'draw:points': {
                const stroke = strokes.value.findLast((s) => s.id === msg.id)
                stroke?.points.push(...msg.points)
                break
            }
            case 'draw:remove':
                strokes.value = strokes.value.filter((s) => s.id !== msg.id)
                break
            case 'draw:clear':
                strokes.value = []
                break
            case 'error':
                error.value = { code: msg.code, message: msg.message }
                break
        }
    }

    let unsubscribe: (() => void)[] = []

    // code === null : on crée une nouvelle salle
    function enter(roomCode: string | null) {
        leave()
        error.value = null
        messages.value = []
        unsubscribe = [
            socket.onMessage(handleMessage),
            // À chaque reconnexion, on (re)rejoint la salle courante
            socket.onOpen(() => {
                if (code.value) socket.send({ type: 'room:join', code: code.value })
                else if (roomCode) socket.send({ type: 'room:join', code: roomCode })
                else socket.send({ type: 'room:create' })
            }),
        ]
        socket.connect()
    }

    function leave() {
        if (code.value) socket.send({ type: 'room:leave' })
        unsubscribe.forEach((fn) => fn())
        unsubscribe = []
        code.value = null
        hostId.value = null
        players.value = []
        strokes.value = []
    }

    function sendChat(text: string) {
        socket.send({ type: 'chat', text })
    }

    // --- Dessin : appliqué localement tout de suite, puis envoyé au serveur ---

    function startStroke(stroke: Stroke) {
        strokes.value.push(stroke)
        socket.send({
            type: 'draw:start',
            id: stroke.id,
            color: stroke.color,
            width: stroke.width,
            point: stroke.points[0],
        })
    }

    function sendPoints(id: string, points: Point[]) {
        socket.send({ type: 'draw:points', id, points })
    }

    function undo() {
        socket.send({ type: 'draw:undo' })
    }

    function clear() {
        socket.send({ type: 'draw:clear' })
    }

    return {
        code,
        hostId,
        players,
        strokes,
        messages,
        error,
        isHost,
        enter,
        leave,
        sendChat,
        startStroke,
        sendPoints,
        undo,
        clear,
    }
})
