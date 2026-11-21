import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { authRouter } from './src/auth.js'
import { historyRouter } from './src/history.js'
import { attachWebSocket } from './src/ws.js'

const PORT = process.env.PORT ?? 3000
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET manquant : copie backend/.env.example vers backend/.env')
    process.exit(1)
}
if(!process.env.FRONTEND_URL) {
    console.error('FRONTEND_URL manquant : copie backend/.env.example vers backend/.env')
    process.exit(1)
}

const isProd = process.env.NODE_ENV === 'production'

const app = express()
app.set('trust proxy', 1) //En prod on est derrière le proxy de Railway donc on peut lui faire confiance
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}))
app.use(express.json({ limit: '100kb' }))

app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/games', historyRouter)
app.use('/api', (req, res) => res.status(404).json({ error: 'Route inconnue' }))

const server = createServer(app)
attachWebSocket(server)

server.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`))
