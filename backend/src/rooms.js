import { randomInt } from 'crypto'

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600
const MAX_PLAYERS = 10
const MAX_STROKES = 2000
const MAX_POINTS_PER_STROKE = 5000
const EMPTY_ROOM_TTL = 60 * 1000 // une salle vide est supprimée au bout d'une minute

// Pas de I/O/0/1 pour éviter les confusions à l'oral
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const rooms = new Map()

function generateCode() {
    let code
    do {
        code = Array.from({ length: 5 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join(
            '',
        )
    } while (rooms.has(code))
    return code
}

export class Room {
    constructor(host) {
        this.code = generateCode()
        this.hostId = host.id
        this.players = new Map() // userId -> { user, ws }
        this.strokes = [] // { id, userId, color, width, points: [[x, y], ...] }
        this.deleteTimer = null
    }

    get isFull() {
        return this.players.size >= MAX_PLAYERS
    }

    addPlayer(user, ws) {
        clearTimeout(this.deleteTimer)
        const previous = this.players.get(user.id)
        // Le même compte ouvert dans un autre onglet : l'ancienne connexion est éjectée
        if (previous && previous.ws !== ws) {
            previous.ws.room = null
            send(previous.ws, { type: 'room:kicked', reason: 'Connecté depuis un autre onglet' })
        }
        this.players.set(user.id, { user, ws })
        ws.room = this
    }

    removePlayer(userId) {
        this.players.delete(userId)
        if (this.players.size === 0) {
            this.deleteTimer = setTimeout(() => rooms.delete(this.code), EMPTY_ROOM_TTL)
            return
        }
        if (this.hostId === userId) {
            // L'hôte part : le plus ancien joueur restant prend la main
            this.hostId = this.players.keys().next().value
        }
    }

    // Étape 1 : tout le monde dessine. Sera restreint au dessinateur de la manche.
    canDraw(userId) {
        return this.players.has(userId)
    }

    broadcast(message, exceptWs = null) {
        const data = JSON.stringify(message)
        for (const { ws } of this.players.values()) {
            if (ws !== exceptWs && ws.readyState === ws.OPEN) ws.send(data)
        }
    }

    playersList() {
        return [...this.players.values()].map(({ user }) => ({
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            guest: user.guest,
        }))
    }

    state() {
        return {
            code: this.code,
            hostId: this.hostId,
            players: this.playersList(),
            strokes: this.strokes,
            canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        }
    }

    // --- Dessin ---

    startStroke(userId, { id, color, width, point }) {
        if (this.strokes.length >= MAX_STROKES) return null
        const stroke = { id, userId, color, width, points: [point] }
        this.strokes.push(stroke)
        return stroke
    }

    addPoints(userId, strokeId, points) {
        const stroke = this.findStroke(userId, strokeId)
        if (!stroke || stroke.points.length + points.length > MAX_POINTS_PER_STROKE) return false
        stroke.points.push(...points)
        return true
    }

    findStroke(userId, strokeId) {
        // On cherche depuis la fin : c'est presque toujours le dernier trait
        for (let i = this.strokes.length - 1; i >= 0; i--) {
            const stroke = this.strokes[i]
            if (stroke.id === strokeId && stroke.userId === userId) return stroke
        }
        return null
    }

    // Annule le dernier trait de ce joueur
    undo(userId) {
        for (let i = this.strokes.length - 1; i >= 0; i--) {
            if (this.strokes[i].userId === userId) return this.strokes.splice(i, 1)[0].id
        }
        return null
    }

    clear() {
        this.strokes = []
    }
}

export function createRoom(host) {
    const room = new Room(host)
    rooms.set(room.code, room)
    return room
}

export function getRoom(code) {
    return typeof code === 'string' ? rooms.get(code.toUpperCase()) : undefined
}

export function send(ws, message) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message))
}
