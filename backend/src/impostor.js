import { randomInt } from 'crypto'
import { BaseGame, systemMessage } from './game.js'
import { pickPair } from './words.js'

// Mode Imposteur :
//   lobby → [manche : drawing → voting → results] × manches → gameEnd
// Tout le monde reçoit un mot et le dessine en secret, en même temps. Un joueur (l'imposteur)
// a un mot légèrement différent… et personne ne sait qui c'est, pas même lui !
// Chacun peut valider son dessin : quand tout le monde a validé, on passe au vote sans attendre.
// Les dessins sont ensuite tous dévoilés et chacun vote pour celui qu'il pense être l'imposteur.

const VOTE_TIME = 60 * 1000
const RESULTS_TIME = 10 * 1000

// Seul barème : voter pour l'imposteur rapporte des points, qu'on soit l'imposteur ou non
const FOUND_IMPOSTOR_POINTS = 100

export class ImpostorGame extends BaseGame {
    static mode = 'impostor'
    static minPlayers = 3 // il faut au moins deux « vrais » joueurs pour démasquer l'imposteur

    constructor(room) {
        super(room)
        this.usedPairs = new Set()
        this.reset()
    }

    // Chacun dessine dans son coin : les traits ne sont dévoilés qu'au moment du vote
    get privateDrawings() {
        return this.phase === 'drawing'
    }

    canDraw(userId) {
        if (!this.isPlaying) return super.canDraw(userId)
        return (
            this.phase === 'drawing' && this.room.players.has(userId) && !this.finished.has(userId)
        )
    }

    // Pendant la manche, « tout effacer » n'efface que son propre dessin
    canClear(userId) {
        return this.canDraw(userId)
    }

    reset() {
        this.impostorId = null
        this.civilWord = null
        this.impostorWord = null
        this.words = new Map() // userId -> mot à dessiner
        this.finished = new Set() // joueurs qui ont validé leur dessin
        this.votes = new Map() // votant -> joueur désigné
        this.result = null
    }

    // Un joueur arrivé en cours de manche fait partie des « vrais » joueurs
    wordOf(userId) {
        return this.words.get(userId) ?? this.civilWord
    }

    // --- Déroulement ---

    begin() {
        this.usedPairs.clear()
        this.newRound()
    }

    newRound() {
        this.clearTimers()
        this.reset()
        const ids = [...this.room.players.keys()]
        this.impostorId = ids[randomInt(ids.length)]
        ;[this.civilWord, this.impostorWord] = pickPair(this.usedPairs)
        for (const id of ids) {
            this.words.set(id, id === this.impostorId ? this.impostorWord : this.civilWord)
        }
        this.phase = 'drawing'
        this.clearBoard()
        this.room.broadcast(
            systemMessage(
                "Dessine ton mot… sans trop en dévoiler : l'un de vous est l'imposteur !",
            ),
        )
        this.setDeadline(this.settings.drawTime * 1000, () => this.startVoting())
        this.broadcastState()
    }

    nextRound() {
        if (this.round >= this.settings.rounds) return this.endGame()
        this.round++
        this.newRound()
    }

    startVoting() {
        if (this.phase !== 'drawing') return
        this.clearTimers()
        this.phase = 'voting'
        // Les dessins étaient privés : on envoie maintenant tous les traits à tout le monde
        this.room.broadcast({ type: 'draw:all', strokes: this.room.strokes })
        this.room.broadcast(systemMessage("Tous les dessins sont dévoilés : qui est l'imposteur ?"))
        this.setDeadline(VOTE_TIME, () => this.endVoting())
        this.broadcastState()
    }

    // Valider son dessin (ou revenir dessus tant que tout le monde n'a pas validé)
    finish(userId, done) {
        if (this.phase !== 'drawing' || !this.room.players.has(userId)) return
        if (done) this.finished.add(userId)
        else this.finished.delete(userId)
        if (this.everyoneFinished()) this.startVoting()
        else this.broadcastState()
    }

    everyoneFinished() {
        return [...this.room.players.keys()].every((id) => this.finished.has(id))
    }

    // On peut changer d'avis tant que tout le monde n'a pas voté ; voter pour soi est permis
    vote(userId, targetId) {
        if (this.phase !== 'voting') return
        if (!this.room.players.has(userId) || !this.room.players.has(targetId)) return
        this.votes.set(userId, targetId)
        if (this.everyoneVoted()) this.endVoting()
        else this.broadcastState()
    }

    everyoneVoted() {
        return [...this.room.players.keys()].every((id) => this.votes.has(id))
    }

    endVoting() {
        if (this.phase !== 'voting') return
        this.clearTimers()

        // Démasqué = l'imposteur a reçu strictement plus de voix que n'importe qui d'autre.
        // Les votes pour soi-même ne comptent pas dans le décompte.
        const tally = new Map()
        for (const [voter, target] of this.votes) {
            if (voter !== target) tally.set(target, (tally.get(target) ?? 0) + 1)
        }
        const impostorVotes = tally.get(this.impostorId) ?? 0
        const caught =
            impostorVotes > 0 &&
            [...tally].every(([id, count]) => id === this.impostorId || count < impostorVotes)

        const points = new Map()
        for (const [voter, target] of this.votes) {
            if (target !== this.impostorId) continue
            points.set(voter, FOUND_IMPOSTOR_POINTS)
            this.addScore(voter, FOUND_IMPOSTOR_POINTS)
        }

        this.result = {
            impostorId: this.impostorId,
            civilWord: this.civilWord,
            impostorWord: this.impostorWord,
            caught,
            votes: Object.fromEntries(this.votes),
            points: Object.fromEntries(points),
        }
        this.phase = 'results'
        const name = this.room.players.get(this.impostorId)?.user.username ?? '?'
        this.room.broadcast(
            caught
                ? systemMessage(`${name} était l'imposteur… démasqué !`, 'success')
                : systemMessage(`${name} était l'imposteur et s'en sort !`, 'close'),
        )
        this.room.broadcast(
            systemMessage(
                `Mot des joueurs : « ${this.civilWord} », de l'imposteur : « ${this.impostorWord} »`,
            ),
        )
        this.setDeadline(RESULTS_TIME, () => this.nextRound())
        this.broadcastState()
    }

    playerLeft(userId) {
        if (userId === this.impostorId && this.phase !== 'results') {
            this.room.broadcast(
                systemMessage("L'imposteur est parti, on passe à la manche suivante"),
            )
            return this.nextRound()
        }
        this.votes.delete(userId)
        this.finished.delete(userId)
        if (this.phase === 'drawing' && this.everyoneFinished()) return this.startVoting()
        if (this.phase === 'voting' && this.everyoneVoted()) return this.endVoting()
        this.broadcastState()
    }

    // --- État envoyé aux clients : on ne dit à personne s'il est l'imposteur ---

    modeState(userId) {
        const inRound = this.phase === 'drawing' || this.phase === 'voting'
        return {
            myWord: inRound ? this.wordOf(userId) : null,
            finished: this.phase === 'drawing' ? [...this.finished] : [],
            voted: this.phase === 'voting' ? [...this.votes.keys()] : [],
            myVote: this.votes.get(userId) ?? null,
            result: this.phase === 'results' ? this.result : null,
        }
    }
}
