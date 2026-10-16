import { WebSocketServer } from 'ws'
import { parseCookie } from 'cookie'
import { tokenFromCookies, verifyToken } from './auth.js'
import { createRoom, getRoom, send, CANVAS_WIDTH, CANVAS_HEIGHT } from './rooms.js'

const HEARTBEAT_INTERVAL = 30 * 1000
const MAX_MESSAGE_SIZE = 64 * 1024
const MAX_CHAT_LENGTH = 200
const MAX_POINTS_PER_MESSAGE = 200
const MAX_FILL_IMAGE = 60 * 1000 // caractères (data URL du pot de peinture)

// --- Validation des messages reçus (on ne fait jamais confiance au client) ---

const isColor = (c) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)
const isWidth = (w) => Number.isFinite(w) && w >= 1 && w <= 60
// Pot de peinture : uniquement une image PNG en base64 (affichée dans un <image> SVG)
const isFillImage = (img) =>
    typeof img === 'string' &&
    img.length <= MAX_FILL_IMAGE &&
    /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(img)
const isStrokeId = (id) => typeof id === 'string' && /^[\w-]{1,40}$/.test(id)
const isPoint = (p) =>
    Array.isArray(p) &&
    p.length === 2 &&
    Number.isFinite(p[0]) &&
    Number.isFinite(p[1]) &&
    p[0] >= 0 &&
    p[0] <= CANVAS_WIDTH &&
    p[1] >= 0 &&
    p[1] <= CANVAS_HEIGHT
// Un dixième de pixel suffit : ça allège les messages
const roundPoint = ([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]

// --- Handlers : un par type de message ---

function leaveCurrentRoom(ws) {
    const room = ws.room
    if (!room) return
    ws.room = null
    room.removePlayer(ws.user.id)
    room.broadcast({ type: 'room:players', players: room.playersList(), hostId: room.hostId })
}

function joinRoom(ws, room) {
    if (ws.room !== room) leaveCurrentRoom(ws)
    room.addPlayer(ws.user, ws)
    send(ws, { type: 'room:state', ...room.state(ws.user.id) })
    room.broadcast({ type: 'room:players', players: room.playersList(), hostId: room.hostId }, ws)
}

const handlers = {
    'room:create'(ws) {
        joinRoom(ws, createRoom(ws.user))
    },

    'room:join'(ws, { code }) {
        const room = getRoom(code)
        if (!room)
            return send(ws, { type: 'error', code: 'ROOM_NOT_FOUND', message: 'Salle introuvable' })
        if (room.isFull && !room.players.has(ws.user.id)) {
            return send(ws, { type: 'error', code: 'ROOM_FULL', message: 'La salle est pleine' })
        }
        joinRoom(ws, room)
    },

    'room:leave'(ws) {
        leaveCurrentRoom(ws)
    },

    chat(ws, { text }, room) {
        if (typeof text !== 'string') return
        text = text.trim().slice(0, MAX_CHAT_LENGTH)
        if (!text) return
        // Pendant le dessin, le jeu vérifie si c'est la bonne réponse
        if (room.game.handleChat(ws.user, text)) return
        room.broadcast({
            type: 'chat',
            from: { id: ws.user.id, username: ws.user.username },
            text,
            at: Date.now(),
        })
    },

    'draw:start'(ws, { id, color, width, point }, room) {
        if (!room.canDraw(ws.user.id)) return
        if (!isStrokeId(id) || !isColor(color) || !isWidth(width) || !isPoint(point)) return
        const stroke = room.startStroke(ws.user.id, { id, color, width, point: roundPoint(point) })
        if (stroke) room.sendDrawing(ws, { type: 'draw:start', stroke })
    },

    'draw:points'(ws, { id, points }, room) {
        if (!room.canDraw(ws.user.id) || !isStrokeId(id)) return
        if (
            !Array.isArray(points) ||
            points.length > MAX_POINTS_PER_MESSAGE ||
            !points.every(isPoint)
        )
            return
        points = points.map(roundPoint)
        if (room.addPoints(ws.user.id, id, points)) {
            room.sendDrawing(ws, { type: 'draw:points', userId: ws.user.id, id, points })
        }
    },

    // Pot de peinture : la zone remplie est calculée par le client et envoyée en image
    'draw:fill'(ws, { id, color, image }, room) {
        if (!room.canDraw(ws.user.id)) return
        if (!isStrokeId(id) || !isColor(color) || !isFillImage(image)) return
        const stroke = room.addFill(ws.user.id, { id, color, image })
        if (stroke) room.sendDrawing(ws, { type: 'draw:start', stroke })
    },

    'draw:undo'(ws, _msg, room) {
        if (!room.canDraw(ws.user.id)) return
        const id = room.undo(ws.user.id)
        if (id) room.sendDrawing(ws, { type: 'draw:remove', id }, { includeSelf: true })
    },

    'draw:clear'(ws, _msg, room) {
        if (!room.canClear(ws.user.id)) return
        room.clearDrawing(ws.user.id)
        room.sendDrawing(ws, { type: 'draw:clear' }, { includeSelf: true })
    },

    'game:start'(ws, { mode, rounds, drawTime }, room) {
        room.startGame(ws.user.id, { mode, rounds, drawTime })
    },

    // Mode classique : le dessinateur choisit son mot
    'game:choose'(ws, { index }, room) {
        if (room.game.mode === 'classic') room.game.choose(ws.user.id, index)
    },

    // Mode Imposteur : valide son dessin (done = false pour revenir dessus)
    'game:finish'(ws, { done }, room) {
        if (room.game.mode === 'impostor') room.game.finish(ws.user.id, done === true)
    },

    // Mode Imposteur : vote contre un joueur
    'game:vote'(ws, { targetId }, room) {
        if (room.game.mode === 'impostor') room.game.vote(ws.user.id, targetId)
    },
}

// Messages qui n'ont de sens qu'une fois dans une salle
const NEEDS_ROOM = new Set([
    'chat',
    'draw:start',
    'draw:points',
    'draw:fill',
    'draw:undo',
    'draw:clear',
    'game:start',
    'game:choose',
    'game:finish',
    'game:vote',
])

export function attachWebSocket(server) {
    const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE_SIZE })

    // Authentification au moment du handshake : le cookie httpOnly est envoyé
    // automatiquement par le navigateur avec la requête d'upgrade
    server.on('upgrade', (req, socket, head) => {
        const { pathname } = new URL(req.url, 'http://localhost')
        const user = verifyToken(tokenFromCookies(parseCookie(req.headers.cookie ?? '')))
        if (pathname !== '/ws' || !user) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
            socket.destroy()
            return
        }
        wss.handleUpgrade(req, socket, head, (ws) => {
            ws.user = user
            wss.emit('connection', ws, req)
        })
    })

    wss.on('connection', (ws) => {
        ws.room = null
        ws.isAlive = true
        ws.on('pong', () => (ws.isAlive = true))

        ws.on('message', (data) => {
            let msg
            try {
                msg = JSON.parse(data)
            } catch {
                return
            }
            const handler = Object.hasOwn(handlers, msg?.type) && handlers[msg.type]
            if (!handler) return
            if (NEEDS_ROOM.has(msg.type) && !ws.room) return
            handler(ws, msg, ws.room)
        })

        ws.on('close', () => leaveCurrentRoom(ws))
    })

    // Détecte les connexions mortes (wifi coupé, onglet tué...) que TCP ne signale pas
    const heartbeat = setInterval(() => {
        for (const ws of wss.clients) {
            if (!ws.isAlive) {
                ws.terminate()
                continue
            }
            ws.isAlive = false
            ws.ping()
        }
    }, HEARTBEAT_INTERVAL)
    wss.on('close', () => clearInterval(heartbeat))

    return wss
}
