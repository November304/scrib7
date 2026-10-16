// Ce qui est commun à tous les modes de jeu : réglages, minuteurs, scores, début et fin de partie.
// Chaque mode (classic.js, impostor.js) hérite de BaseGame et décrit ses propres phases.

export const ROUNDS = { min: 1, max: 10, default: 3 }
export const DRAW_TIME = { min: 30, max: 180, default: 80 } // secondes

export class BaseGame {
    static mode = 'base'
    static minPlayers = 2

    constructor(room) {
        this.room = room
        this.phase = 'lobby'
        this.settings = { rounds: ROUNDS.default, drawTime: DRAW_TIME.default }
        this.round = 0
        this.scores = new Map() // userId -> points
        this.deadline = 0
        this.timers = []
    }

    get mode() {
        return this.constructor.mode
    }

    get minPlayers() {
        return this.constructor.minPlayers
    }

    get isPlaying() {
        return this.phase !== 'lobby' && this.phase !== 'gameEnd'
    }

    // true si les traits ne doivent pas être montrés aux autres joueurs
    get privateDrawings() {
        return false
    }

    // Hors partie, tout le monde peut gribouiller pour patienter (chaque mode précise le reste)
    canDraw(userId) {
        return !this.isPlaying && this.room.players.has(userId)
    }

    canClear(userId) {
        return !this.isPlaying && userId === this.room.hostId
    }

    // Renvoie true si le message a été pris en charge par le jeu
    handleChat() {
        return false
    }

    // --- Minuteurs ---

    schedule(delay, fn) {
        this.timers.push(setTimeout(fn, delay))
    }

    clearTimers() {
        this.timers.forEach(clearTimeout)
        this.timers = []
    }

    // Fin de la phase en cours dans `delay` ms (affichée par le compte à rebours des clients)
    setDeadline(delay, fn) {
        this.deadline = Date.now() + delay
        this.schedule(delay, fn)
    }

    // --- Déroulement ---

    start(userId, { rounds, drawTime } = {}) {
        if (userId !== this.room.hostId || this.isPlaying) return
        if (this.room.players.size < this.minPlayers) {
            return this.room.sendTo(
                userId,
                systemMessage(`Il faut au moins ${this.minPlayers} joueurs pour ce mode`),
            )
        }
        if (Number.isInteger(rounds) && rounds >= ROUNDS.min && rounds <= ROUNDS.max) {
            this.settings.rounds = rounds
        }
        if (Number.isInteger(drawTime) && drawTime >= DRAW_TIME.min && drawTime <= DRAW_TIME.max) {
            this.settings.drawTime = drawTime
        }
        this.scores = new Map([...this.room.players.keys()].map((id) => [id, 0]))
        this.round = 1
        this.room.broadcast(systemMessage('La partie commence !'))
        this.begin()
    }

    // À définir par chaque mode : lance le premier tour
    begin() {}

    // À définir par chaque mode : oublie l'état du tour en cours
    reset() {}

    clearBoard() {
        this.room.clear()
        this.room.broadcast({ type: 'draw:clear' })
    }

    endGame() {
        this.clearTimers()
        this.reset()
        this.phase = 'gameEnd'
        const [winner] = this.ranking()
        if (winner) {
            const name = this.room.players.get(winner.id)?.user.username
            this.room.broadcast(
                systemMessage(`🏆 ${name} gagne avec ${winner.score} pts !`, 'success'),
            )
        }
        this.broadcastState()
    }

    // Retour au salon (plus assez de joueurs)
    stop(reason) {
        this.clearTimers()
        this.reset()
        this.phase = 'lobby'
        if (reason) this.room.broadcast(systemMessage(reason))
        this.broadcastState()
    }

    addScore(userId, points) {
        this.scores.set(userId, (this.scores.get(userId) ?? 0) + points)
    }

    ranking() {
        return [...this.room.players.keys()]
            .map((id) => ({ id, score: this.scores.get(id) ?? 0 }))
            .sort((a, b) => b.score - a.score)
    }

    // --- Arrivées / départs en cours de partie ---

    onPlayerJoin(userId) {
        if (!this.isPlaying) return
        if (!this.scores.has(userId)) this.scores.set(userId, 0)
        // Les autres doivent voir le nouveau venu dans le classement
        this.broadcastState()
    }

    onPlayerLeave(userId) {
        if (!this.isPlaying) return
        if (this.room.players.size < this.minPlayers) {
            return this.stop('Plus assez de joueurs, retour au salon')
        }
        this.playerLeft(userId)
    }

    // À définir par chaque mode : réagit au départ d'un joueur en pleine partie
    playerLeft() {
        this.broadcastState()
    }

    // --- État envoyé aux clients : chacun ne voit que ce qu'il a le droit de voir ---

    stateFor(userId) {
        return {
            mode: this.mode,
            phase: this.phase,
            round: this.round,
            rounds: this.settings.rounds,
            drawTime: this.settings.drawTime,
            remaining: this.isPlaying ? Math.max(0, this.deadline - Date.now()) : 0,
            scores: Object.fromEntries(this.scores),
            ...this.modeState(userId),
        }
    }

    // À définir par chaque mode : la partie de l'état propre au mode
    modeState() {
        return {}
    }

    broadcastState() {
        for (const id of this.room.players.keys()) {
            this.room.sendTo(id, { type: 'game:state', ...this.stateFor(id) })
        }
    }
}

export function systemMessage(text, variant = 'info') {
    return { type: 'chat', from: null, text, variant, at: Date.now() }
}
