import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { socket } from '@/services/socket'
import { useAuthStore } from '@/stores/auth'
import type {
    ChatMessage,
    GameMode,
    GameState,
    Player,
    Point,
    ServerMessage,
    Stroke,
    User,
} from '@/types'

const MAX_MESSAGES = 200

export const useRoomStore = defineStore('room', () => {
    const auth = useAuthStore()

    const code = ref<string | null>(null)
    const hostId = ref<User['id'] | null>(null)
    const players = ref<Player[]>([])
    const strokes = ref<Stroke[]>([])
    const messages = ref<ChatMessage[]>([])
    const error = ref<{ code: string; message: string } | null>(null)
    const game = ref<GameState | null>(null)
    // Fin de la phase en heure locale : on convertit la durée restante envoyée par le serveur
    // (pas d'heure absolue, pour ne pas dépendre de l'horloge du client)
    const deadline = ref(0)

    const isHost = computed(() => auth.user != null && auth.user.id === hostId.value)
    const isPlaying = computed(
        () => game.value != null && !['lobby', 'gameEnd'].includes(game.value.phase),
    )
    const isDrawer = computed(
        () =>
            auth.user != null &&
            game.value?.mode === 'classic' &&
            game.value.drawerId === auth.user.id,
    )
    const hasFinished = computed(
        () =>
            auth.user != null &&
            game.value?.mode === 'impostor' &&
            game.value.finished.includes(auth.user.id),
    )
    // Mêmes règles que le serveur (qui vérifie de toute façon)
    const canDraw = computed(() => {
        if (!isPlaying.value) return true
        if (game.value!.phase !== 'drawing') return false
        // Imposteur : tout le monde dessine en même temps, jusqu'à ce qu'il valide son dessin
        if (game.value!.mode === 'impostor') return !hasFinished.value
        return isDrawer.value
    })
    const canClear = computed(() => (isPlaying.value ? canDraw.value : isHost.value))

    function setGame(state: GameState) {
        game.value = state
        deadline.value = Date.now() + state.remaining
    }

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
                setGame(msg.game)
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
                addMessage({ from: msg.from, text: msg.text, at: msg.at, variant: msg.variant })
                break
            case 'game:state': {
                const { type: _, ...state } = msg
                setGame(state)
                break
            }
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
            case 'draw:all':
                strokes.value = msg.strokes
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
        game.value = null
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

    // --- Partie ---

    function startGame(settings: { mode: GameMode; rounds: number; drawTime: number }) {
        socket.send({ type: 'game:start', ...settings })
    }

    function chooseWord(index: number) {
        socket.send({ type: 'game:choose', index })
    }

    function finishDrawing(done: boolean) {
        socket.send({ type: 'game:finish', done })
    }

    function vote(targetId: User['id']) {
        socket.send({ type: 'game:vote', targetId })
    }

    return {
        code,
        hostId,
        players,
        strokes,
        messages,
        error,
        game,
        deadline,
        isHost,
        isPlaying,
        isDrawer,
        hasFinished,
        canDraw,
        canClear,
        enter,
        leave,
        sendChat,
        startStroke,
        sendPoints,
        undo,
        clear,
        startGame,
        chooseWord,
        finishDrawing,
        vote,
    }
})
