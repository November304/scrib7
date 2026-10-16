import { randomInt } from 'crypto'
import { ClassicGame } from './classic.js'
import { ImpostorGame } from './impostor.js'

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600
const MAX_PLAYERS = 10
const MAX_STROKES = 2000
const MAX_POINTS_PER_STROKE = 5000
const MAX_FILLS = 100 // chaque remplissage est une image (jusqu'à ~60 ko)
const EMPTY_ROOM_TTL = 60 * 1000 // une salle vide est supprimée au bout d'une minute

// Pas de I/O/0/1 pour éviter les confusions à l'oral
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const GAME_MODES = { classic: ClassicGame, impostor: ImpostorGame }

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
        this.strokes = [] // { id, userId, color, width, points: [[x, y], ...], image? }
        this.deleteTimer = null
        this.game = new ClassicGame(this)
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
        this.game.onPlayerJoin(user.id)
    }

    removePlayer(userId) {
        this.players.delete(userId)
        if (this.hostId === userId && this.players.size > 0) {
            // L'hôte part : le plus ancien joueur restant prend la main
            this.hostId = this.players.keys().next().value
        }
        this.game.onPlayerLeave(userId)
        if (this.players.size === 0) {
            this.deleteTimer = setTimeout(() => rooms.delete(this.code), EMPTY_ROOM_TTL)
        }
    }

    canDraw(userId) {
        return this.game.canDraw(userId)
    }

    canClear(userId) {
        return this.game.canClear(userId)
    }

    // L'hôte lance une partie : on change de mode si besoin
    startGame(userId, { mode, ...settings }) {
        if (userId !== this.hostId || this.game.isPlaying) return
        const GameMode = Object.hasOwn(GAME_MODES, mode) ? GAME_MODES[mode] : ClassicGame
        if (!(this.game instanceof GameMode)) this.game = new GameMode(this)
        this.game.start(userId, settings)
    }

    // Diffuse un message de dessin, sauf si les dessins sont secrets (mode Imposteur)
    sendDrawing(ws, message, { includeSelf = false } = {}) {
        if (!this.game.privateDrawings) return this.broadcast(message, includeSelf ? null : ws)
        if (includeSelf) send(ws, message)
    }

    // Les traits qu'un joueur a le droit de voir
    visibleStrokes(userId) {
        if (!this.game.privateDrawings) return this.strokes
        return this.strokes.filter((s) => s.userId === userId)
    }

    sendTo(userId, message) {
        const player = this.players.get(userId)
        if (player) send(player.ws, message)
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
            hat: user.hat,
            guest: user.guest,
        }))
    }

    // L'état dépend du joueur : seul le dessinateur voit le mot
    state(userId) {
        return {
            code: this.code,
            hostId: this.hostId,
            players: this.playersList(),
            strokes: this.visibleStrokes(userId),
            canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
            game: this.game.stateFor(userId),
        }
    }

    // --- Dessin ---

    startStroke(userId, { id, color, width, point }) {
        if (this.strokes.length >= MAX_STROKES) return null
        const stroke = { id, userId, color, width, points: [point] }
        this.strokes.push(stroke)
        return stroke
    }

    // Pot de peinture : un « trait » sans points, avec l'image de la zone remplie
    addFill(userId, { id, color, image }) {
        if (this.strokes.length >= MAX_STROKES) return null
        if (this.strokes.filter((s) => s.image).length >= MAX_FILLS) return null
        const stroke = { id, userId, color, width: 0, points: [], image }
        this.strokes.push(stroke)
        return stroke
    }

    addPoints(userId, strokeId, points) {
        const stroke = this.findStroke(userId, strokeId)
        if (!stroke || stroke.image || stroke.points.length + points.length > MAX_POINTS_PER_STROKE) return false
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

    // « Tout effacer » : seulement son propre dessin quand chacun dessine en secret
    clearDrawing(userId) {
        if (this.game.privateDrawings)
            this.strokes = this.strokes.filter((s) => s.userId !== userId)
        else this.clear()
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
