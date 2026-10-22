// Historique des parties : enregistrement en fin de partie + routes REST /api/games
import { Router } from 'express'
import prisma from './prisma.js'
import { requireAuth } from './auth.js'

const MODES = ['classic', 'impostor']
const PAGE_SIZE = { default: 10, max: 50 }

// Les invités n'ont pas de ligne User : leur id est une chaîne "guest-…"
const accountId = (id) => (Number.isInteger(id) ? id : null)

// Enregistre une partie terminée (appelé par BaseGame.endGame).
// Seuls les joueurs présents à la fin figurent au classement, comme dans le jeu.
export async function saveGame(game) {
    const ranking = game.ranking()
    // Une partie entre invités ne serait visible dans l'historique de personne
    if (!ranking.some(({ id }) => accountId(id) !== null)) return null

    const players = ranking.map(({ id, score }) => {
        const { user } = game.room.players.get(id)
        return {
            userId: accountId(id),
            username: user.username,
            avatar: user.avatar ?? null,
            hat: user.hat ?? null,
            score,
            // Ex æquo : même rang que le premier joueur ayant ce score (1, 1, 3…)
            rank: ranking.findIndex((p) => p.score === score) + 1,
        }
    })

    return prisma.game.create({
        data: {
            mode: game.mode,
            roomCode: game.room.code,
            rounds: game.settings.rounds,
            drawTime: game.settings.drawTime,
            startedAt: game.startedAt,
            players: { create: players },
        },
    })
}

// Une partie telle que l'API la renvoie : joueurs du premier au dernier
const withPlayers = {
    players: {
        orderBy: [{ rank: 'asc' }, { username: 'asc' }],
        select: { userId: true, username: true, avatar: true, hat: true, score: true, rank: true },
    },
}

// Ajoute la ligne du joueur connecté, pour afficher « 2e · 340 pts » sans la chercher côté client
function withMe(game, userId) {
    return { ...game, me: game.players.find((p) => p.userId === userId) ?? null }
}

// Middleware : l'historique est lié à un compte, les invités n'en ont pas
function requireAccount(req, res, next) {
    if (req.user.guest) {
        return res.status(403).json({ error: 'Crée un compte pour garder un historique' })
    }
    next()
}

function parseId(value) {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : null
}

export const historyRouter = Router()
historyRouter.use(requireAuth, requireAccount)

// GET /api/games?mode=classic&limit=10&cursor=42 : mes parties, de la plus récente à la plus ancienne
historyRouter.get('/', async (req, res) => {
    const { mode, limit, cursor } = req.query
    if (mode !== undefined && !MODES.includes(mode)) {
        return res.status(400).json({ error: 'Mode inconnu' })
    }
    const take = Math.min(Math.max(Number.parseInt(limit) || PAGE_SIZE.default, 1), PAGE_SIZE.max)
    const after = cursor === undefined ? null : parseId(cursor)
    if (cursor !== undefined && !after) return res.status(400).json({ error: 'Curseur invalide' })

    // Pagination par curseur : on demande une partie de plus pour savoir s'il reste une page
    const games = await prisma.game.findMany({
        where: { mode, players: { some: { userId: req.user.id } } },
        include: withPlayers,
        orderBy: { id: 'desc' },
        take: take + 1,
        ...(after && { cursor: { id: after }, skip: 1 }),
    })
    const hasMore = games.length > take
    const page = games.slice(0, take)
    res.json({
        games: page.map((game) => withMe(game, req.user.id)),
        nextCursor: hasMore ? page.at(-1).id : null,
    })
})

// GET /api/games/stats : parties jouées, victoires, points, au total et par mode
historyRouter.get('/stats', async (req, res) => {
    const userId = req.user.id
    const countFor = async (mode) => {
        const where = { userId, ...(mode && { game: { mode } }) }
        const [played, wins] = await Promise.all([
            prisma.gamePlayer.count({ where }),
            prisma.gamePlayer.count({ where: { ...where, rank: 1 } }),
        ])
        return { played, wins }
    }
    const [total, points, ...byMode] = await Promise.all([
        countFor(null),
        prisma.gamePlayer.aggregate({
            where: { userId },
            _sum: { score: true },
            _max: { score: true },
        }),
        ...MODES.map(countFor),
    ])
    res.json({
        ...total,
        totalPoints: points._sum.score ?? 0,
        bestScore: points._max.score ?? 0,
        byMode: Object.fromEntries(MODES.map((mode, i) => [mode, byMode[i]])),
    })
})

// GET /api/games/:id : le détail d'une partie à laquelle j'ai participé
historyRouter.get('/:id', async (req, res) => {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' })
    const game = await prisma.game.findFirst({
        where: { id, players: { some: { userId: req.user.id } } },
        include: withPlayers,
    })
    if (!game) return res.status(404).json({ error: 'Partie introuvable' })
    res.json(withMe(game, req.user.id))
})

// DELETE /api/games/:id : retire la partie de MON historique.
// Les autres joueurs la gardent : ma ligne reste dans le classement, mais n'est plus liée à mon compte.
historyRouter.delete('/:id', async (req, res) => {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' })
    const { count } = await prisma.gamePlayer.updateMany({
        where: { gameId: id, userId: req.user.id },
        data: { userId: null },
    })
    if (count === 0) return res.status(404).json({ error: 'Partie introuvable' })
    // Plus personne n'y est rattaché : la partie ne sert plus à rien (ses lignes partent en cascade)
    await prisma.game.deleteMany({ where: { id, players: { none: { userId: { not: null } } } } })
    res.status(204).end()
})
