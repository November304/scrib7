import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import prisma from './prisma.js'

const JWT_SECRET = process.env.JWT_SECRET
const COOKIE_NAME = 'token'
const MAX_AGE = 7 * 24 * 3600 * 1000 // 7 jours
const USERNAME_RE = /^[\p{L}\p{N}_-]{3,20}$/u

// Le contenu du JWT : c'est aussi ce que voient les autres joueurs
export function signToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, avatar: user.avatar ?? null, guest: !!user.guest },
        JWT_SECRET,
        { expiresIn: '7d' },
    )
}

// Renvoie l'utilisateur contenu dans le token, ou null si le token est absent/invalide
export function verifyToken(token) {
    if (!token) return null
    try {
        const { id, username, avatar, guest } = jwt.verify(token, JWT_SECRET)
        return { id, username, avatar, guest }
    } catch {
        return null
    }
}

function setTokenCookie(res, user) {
    res.cookie(COOKIE_NAME, signToken(user), {
        httpOnly: true, // inaccessible depuis le JS du navigateur (protection XSS)
        sameSite: 'lax', // non envoyé par les requêtes cross-site (protection CSRF)
        secure: process.env.NODE_ENV === 'production',
        maxAge: MAX_AGE,
    })
}

export function tokenFromCookies(cookies) {
    return cookies?.[COOKIE_NAME]
}

// Middleware : req.user est rempli si le cookie est valide, 401 sinon
export function requireAuth(req, res, next) {
    const user = verifyToken(tokenFromCookies(req.cookies))
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    req.user = user
    next()
}

function checkCredentials(body) {
    const { username, password } = body ?? {}
    if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
        return 'Pseudo invalide (3 à 20 caractères : lettres, chiffres, _ ou -)'
    }
    if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
        return 'Mot de passe trop court (6 caractères minimum)'
    }
    return null
}

const publicUser = (user) => ({
    id: user.id,
    username: user.username,
    avatar: user.avatar ?? null,
    guest: !!user.guest,
})

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
    const error = checkCredentials(req.body)
    if (error || !req.body.password) {
        return res.status(400).json({ error: error ?? 'Mot de passe requis' })
    }
    const { username, password } = req.body
    if (await prisma.user.findUnique({ where: { username } })) {
        return res.status(409).json({ error: 'Ce pseudo est déjà pris' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { username, passwordHash } })
    setTokenCookie(res, user)
    res.status(201).json(publicUser(user))
})

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body ?? {}
    const user =
        typeof username === 'string' ? await prisma.user.findUnique({ where: { username } }) : null
    // Même message dans les deux cas pour ne pas révéler quels pseudos existent
    if (
        !user ||
        typeof password !== 'string' ||
        !(await bcrypt.compare(password, user.passwordHash))
    ) {
        return res.status(401).json({ error: 'Pseudo ou mot de passe incorrect' })
    }
    setTokenCookie(res, user)
    res.json(publicUser(user))
})

// Mode invité : pas de compte en base, juste un JWT avec un id unique
authRouter.post('/guest', (req, res) => {
    const error = checkCredentials({ username: req.body?.username })
    if (error) return res.status(400).json({ error })
    const user = { id: `guest-${randomUUID()}`, username: req.body.username, guest: true }
    setTokenCookie(res, user)
    res.status(201).json(publicUser(user))
})

authRouter.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME)
    res.status(204).end()
})

authRouter.get('/me', requireAuth, (req, res) => {
    res.json(req.user)
})
