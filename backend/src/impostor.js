import { randomInt } from 'crypto'
import { BaseGame, systemMessage } from './game.js'
import { pickPair } from './words.js'

// Mode Imposteur :
//   lobby → [manche : drawing → voting → results] × manches → gameEnd
// Tout le monde reçoit un mot et le dessine en secret, en même temps. Un joueur (l'imposteur)
// a un mot légèrement différent… et personne ne sait qui c'est, pas même lui !
// Les dessins sont ensuite tous dévoilés et chacun vote pour celui qu'il pense être l'imposteur.

const VOTE_TIME = 60 * 1000
const RESULTS_TIME = 10 * 1000

// --- Points : tout le barème est ici, pour pouvoir l'équilibrer facilement ---

const POINTS = {
    foundImpostor: 100, // un joueur vote pour l'imposteur
    impostorHidden: 200, // l'imposteur n'est pas démasqué
    selfDesignated: 150, // l'imposteur a deviné que c'était lui et a voté pour lui-même
}

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
        return this.phase === 'drawing' && this.room.players.has(userId)
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
        const give = (id, amount) => {
            points.set(id, (points.get(id) ?? 0) + amount)
            this.addScore(id, amount)
        }
        for (const [voter, target] of this.votes) {
            if (voter === this.impostorId) {
                if (target === this.impostorId) give(voter, POINTS.selfDesignated)
            } else if (target === this.impostorId) {
                give(voter, POINTS.foundImpostor)
            }
        }
        if (!caught) give(this.impostorId, POINTS.impostorHidden)

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
        if (this.phase === 'voting' && this.everyoneVoted()) return this.endVoting()
        this.broadcastState()
    }

    // --- État envoyé aux clients : on ne dit à personne s'il est l'imposteur ---

    modeState(userId) {
        const inRound = this.phase === 'drawing' || this.phase === 'voting'
        return {
            myWord: inRound ? this.wordOf(userId) : null,
            voted: this.phase === 'voting' ? [...this.votes.keys()] : [],
            myVote: this.votes.get(userId) ?? null,
            result: this.phase === 'results' ? this.result : null,
        }
    }
}
