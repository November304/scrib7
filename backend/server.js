import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { authRouter } from './src/auth.js'

const PORT = process.env.PORT ?? 3000
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET manquant : copie backend/.env.example vers backend/.env')
    process.exit(1)
}

const app = express()
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api', (req, res) => res.status(404).json({ error: 'Route inconnue' }))

// En production, Express sert aussi le build du frontend
const distDir = fileURLToPath(new URL('../frontend/dist', import.meta.url))
app.use(express.static(distDir))
app.get('/{*splat}', (req, res, next) =>
    res.sendFile('index.html', { root: distDir }, (err) => err && next()),
)

const server = createServer(app)

server.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`))
