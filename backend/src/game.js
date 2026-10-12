import { randomInt } from 'crypto'
import { DIFFICULTIES, pickWord } from './words.js'

// Déroulement d'une partie :
//   lobby → [tour : choosing → drawing → turnEnd] × (joueurs × manches) → gameEnd
// Une « manche » = chaque joueur dessine une fois. Un « tour » = un dessinateur.

export const MIN_PLAYERS = 2
export const ROUNDS = { min: 1, max: 10, default: 3 }
export const DRAW_TIME = { min: 30, max: 180, default: 80 } // secondes
const CHOOSE_TIME = 15 * 1000
const TURN_END_TIME = 5 * 1000
const MAX_HINT_LETTERS = 3

// --- Points : tout le barème est ici, pour pouvoir l'équilibrer facilement ---

const BASE_POINTS = { easy: 100, medium: 200, hard: 300 }

// Celui qui trouve : de 100 % (tout de suite) à 50 % (à la dernière seconde) de la base
export function guesserPoints(difficulty, timeLeftRatio) {
    return Math.round(BASE_POINTS[difficulty] * (0.5 + 0.5 * timeLeftRatio))
}

// Le dessinateur : jusqu'à la moitié de la base, selon la proportion de joueurs qui ont trouvé
export function drawerPoints(difficulty, found, guessers) {
    if (guessers === 0) return 0
    return Math.round((BASE_POINTS[difficulty] / 2) * (found / guessers))
}

// --- Comparaison des propositions ---

// "Arc-en-Ciel" → "arcenciel" : sans accents, majuscules, espaces ni ponctuation
export function normalize(text) {
    return text
        .toLowerCase()
        .replace(/œ/g, 'oe')
        .replace(/æ/g, 'ae')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]/g, '')
}

// Distance de Damerau-Levenshtein : nombre minimal de lettres à ajouter, supprimer,
// remplacer ou inverser avec la voisine ("chta" → "chat" = 1)
export function editDistance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i])
    for (let j = 1; j <= b.length; j++) d[0][j] = j
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
            }
        }
    }
    return d[a.length][b.length]
}

// « Proche » : une lettre d'écart, ou deux si le mot est assez long pour que ça reste parlant
export function isClose(guess, answer) {
    const maxDistance = answer.length >= 6 ? 2 : 1
    if (answer.length < 3 || Math.abs(guess.length - answer.length) > maxDistance) return false
    return editDistance(guess, answer) <= maxDistance
}

const isLetter = (char) => /[\p{L}\p{N}]/u.test(char)

export class Game {
    constructor(room) {
        this.room = room
        this.phase = 'lobby'
        this.settings = { rounds: ROUNDS.default, drawTime: DRAW_TIME.default }
        this.round = 0
        this.scores = new Map() // userId -> points
        this.hasDrawn = new Set() // joueurs ayant déjà dessiné pendant cette manche
        this.drawerId = null
        this.choices = [] // [{ text, difficulty }] proposés au dessinateur
        this.word = null // { text, difficulty } choisi
        this.revealed = new Set() // indices des lettres données en indice
        this.guessed = new Map() // userId -> points gagnés pendant ce tour
        this.turnPoints = new Map() // points gagnés au tour précédent (affichés en fin de tour)
        this.usedWords = new Set()
        this.deadline = 0
        this.timers = []
    }

    get isPlaying() {
        return this.phase !== 'lobby' && this.phase !== 'gameEnd'
    }

    // Hors partie, tout le monde peut gribouiller pour patienter
    canDraw(userId) {
        if (!this.isPlaying) return this.room.players.has(userId)
        return this.phase === 'drawing' && userId === this.drawerId
    }

    canClear(userId) {
        if (!this.isPlaying) return userId === this.room.hostId
        return this.phase === 'drawing' && userId === this.drawerId
    }

    // Le dessinateur et ceux qui ont trouvé connaissent le mot
    knowsWord(userId) {
        return userId === this.drawerId || this.guessed.has(userId)
    }

    // --- Minuteurs ---

    schedule(delay, fn) {
        this.timers.push(setTimeout(fn, delay))
    }

    clearTimers() {
        this.timers.forEach(clearTimeout)
        this.timers = []
    }

    // --- Déroulement ---

    start(userId, { rounds, drawTime } = {}) {
        if (userId !== this.room.hostId || this.isPlaying) return
        if (this.room.players.size < MIN_PLAYERS) {
            return this.room.sendTo(
                userId,
                systemMessage(`Il faut au moins ${MIN_PLAYERS} joueurs`),
            )
        }
        if (Number.isInteger(rounds) && rounds >= ROUNDS.min && rounds <= ROUNDS.max) {
            this.settings.rounds = rounds
        }
        if (Number.isInteger(drawTime) && drawTime >= DRAW_TIME.min && drawTime <= DRAW_TIME.max) {
            this.settings.drawTime = drawTime
        }
        this.scores = new Map([...this.room.players.keys()].map((id) => [id, 0]))
        this.usedWords.clear()
        this.hasDrawn.clear()
        this.turnPoints.clear()
        this.round = 1
        this.room.broadcast(systemMessage('La partie commence !', 'info'))
        this.nextTurn()
    }

    nextTurn() {
        this.clearTimers()
        // Le prochain dessinateur : le premier joueur (ordre d'arrivée) qui n'a pas encore dessiné
        let drawerId = [...this.room.players.keys()].find((id) => !this.hasDrawn.has(id))
        if (drawerId === undefined) {
            this.round++
            this.hasDrawn.clear()
            if (this.round > this.settings.rounds) return this.endGame()
            drawerId = this.room.players.keys().next().value
        }
        this.hasDrawn.add(drawerId)
        this.drawerId = drawerId
        this.phase = 'choosing'
        this.word = null
        this.revealed.clear()
        this.guessed.clear()
        this.choices = DIFFICULTIES.map((difficulty) => ({
            text: pickWord(difficulty, this.usedWords),
            difficulty,
        }))
        this.room.clear()
        this.room.broadcast({ type: 'draw:clear' })
        this.deadline = Date.now() + CHOOSE_TIME
        // Pas de choix à temps : un mot au hasard parmi les trois
        this.schedule(CHOOSE_TIME, () => this.choose(drawerId, randomInt(this.choices.length)))
        this.broadcastState()
    }

    choose(userId, index) {
        if (this.phase !== 'choosing' || userId !== this.drawerId) return
        if (!Number.isInteger(index) || !this.choices[index]) return
        this.clearTimers()
        this.word = this.choices[index]
        this.choices = []
        this.usedWords.add(this.word.text)
        this.phase = 'drawing'
        const drawTime = this.settings.drawTime * 1000
        this.deadline = Date.now() + drawTime
        this.schedule(drawTime, () => this.endTurn())
        this.scheduleHints(drawTime)
        this.broadcastState()
    }

    // Révèle quelques lettres pendant la seconde moitié du temps
    scheduleHints(drawTime) {
        const letters = [...this.word.text].filter(isLetter).length
        const count = Math.min(MAX_HINT_LETTERS, Math.floor(letters / 3))
        for (let i = 0; i < count; i++) {
            this.schedule(drawTime * (0.5 + (0.5 * i) / count), () => this.revealLetter())
        }
    }

    revealLetter() {
        const hidden = [...this.word.text]
            .map((char, i) => (isLetter(char) && !this.revealed.has(i) ? i : -1))
            .filter((i) => i >= 0)
        if (hidden.length <= 1) return // on ne donne jamais tout le mot
        this.revealed.add(hidden[randomInt(hidden.length)])
        this.broadcastState()
    }

    // "tour Eiffel" → "_ _ _ _   _ _ _ _ _ _" côté client ; on garde espaces, tirets, apostrophes
    hint() {
        return [...this.word.text]
            .map((char, i) => (isLetter(char) && !this.revealed.has(i) ? '_' : char))
            .join('')
    }

    // Renvoie true si le message a été pris en charge par le jeu
    handleChat(user, text) {
        if (this.phase !== 'drawing') return false
        const message = {
            type: 'chat',
            from: { id: user.id, username: user.username },
            text,
            at: Date.now(),
        }
        // Ceux qui connaissent le mot ne parlent qu'entre eux, pour ne pas le divulguer
        if (this.knowsWord(user.id)) {
            this.sendToInsiders(message)
            return true
        }
        const guess = normalize(text)
        const answer = normalize(this.word.text)
        if (guess === answer) {
            this.correctGuess(user)
            return true
        }
        this.room.broadcast(message)
        if (isClose(guess, answer)) {
            this.room.sendTo(user.id, systemMessage(`« ${text} » est tout proche !`, 'close'))
        }
        return true
    }

    correctGuess(user) {
        const timeLeftRatio =
            Math.max(0, this.deadline - Date.now()) / (this.settings.drawTime * 1000)
        const points = guesserPoints(this.word.difficulty, timeLeftRatio)
        this.guessed.set(user.id, points)
        this.addScore(user.id, points)
        this.room.broadcast(systemMessage(`${user.username} a trouvé le mot !`, 'success'))
        this.room.sendTo(
            user.id,
            systemMessage(`Bravo, c'était « ${this.word.text} » (+${points} pts)`, 'success'),
        )
        if (this.everyoneGuessed()) this.endTurn()
        else this.broadcastState()
    }

    everyoneGuessed() {
        return [...this.room.players.keys()].every((id) => this.knowsWord(id))
    }

    endTurn() {
        if (this.phase !== 'drawing') return
        this.clearTimers()
        // On ne compte que les joueurs encore présents
        const guessers = [...this.room.players.keys()].filter((id) => id !== this.drawerId)
        const found = guessers.filter((id) => this.guessed.has(id)).length
        const drawerGain = drawerPoints(this.word.difficulty, found, guessers.length)
        this.addScore(this.drawerId, drawerGain)
        this.turnPoints = new Map(this.guessed)
        this.turnPoints.set(this.drawerId, drawerGain)
        this.phase = 'turnEnd'
        this.room.broadcast(systemMessage(`Le mot était « ${this.word.text} »`, 'info'))
        this.deadline = Date.now() + TURN_END_TIME
        this.schedule(TURN_END_TIME, () => this.nextTurn())
        this.broadcastState()
    }

    endGame() {
        this.clearTimers()
        this.phase = 'gameEnd'
        this.drawerId = null
        this.word = null
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
        this.phase = 'lobby'
        this.drawerId = null
        this.word = null
        this.choices = []
        if (reason) this.room.broadcast(systemMessage(reason, 'info'))
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
        if (this.isPlaying && !this.scores.has(userId)) this.scores.set(userId, 0)
        // Les autres doivent voir le nouveau venu dans le classement
        if (this.isPlaying) this.broadcastState()
    }

    onPlayerLeave(userId) {
        if (!this.isPlaying) return
        if (this.room.players.size < MIN_PLAYERS) {
            return this.stop('Plus assez de joueurs, retour au salon')
        }
        if (userId === this.drawerId) {
            this.room.broadcast(systemMessage('Le dessinateur est parti', 'info'))
            if (this.phase === 'choosing') return this.nextTurn()
            if (this.phase === 'drawing') return this.endTurn()
        }
        // Le dernier joueur qui n'avait pas trouvé est parti
        if (this.phase === 'drawing' && this.everyoneGuessed()) return this.endTurn()
        this.broadcastState()
    }

    // --- État envoyé aux clients : chacun ne voit que ce qu'il a le droit de voir ---

    stateFor(userId) {
        const isDrawer = userId === this.drawerId
        const revealWord =
            this.phase === 'turnEnd' || (this.phase === 'drawing' && this.knowsWord(userId))
        return {
            phase: this.phase,
            round: this.round,
            rounds: this.settings.rounds,
            drawTime: this.settings.drawTime,
            drawerId: this.drawerId,
            remaining: this.isPlaying ? Math.max(0, this.deadline - Date.now()) : 0,
            choices: this.phase === 'choosing' && isDrawer ? this.choices : null,
            word: revealWord ? this.word.text : null,
            difficulty:
                this.phase === 'drawing' || this.phase === 'turnEnd' ? this.word.difficulty : null,
            hint: this.phase === 'drawing' ? this.hint() : null,
            scores: Object.fromEntries(this.scores),
            guessed: [...this.guessed.keys()],
            turnPoints: this.phase === 'turnEnd' ? Object.fromEntries(this.turnPoints) : null,
        }
    }

    broadcastState() {
        for (const id of this.room.players.keys()) {
            this.room.sendTo(id, { type: 'game:state', ...this.stateFor(id) })
        }
    }

    sendToInsiders(message) {
        for (const id of this.room.players.keys()) {
            if (this.knowsWord(id)) this.room.sendTo(id, message)
        }
    }
}

export function systemMessage(text, variant = 'info') {
    return { type: 'chat', from: null, text, variant, at: Date.now() }
}
