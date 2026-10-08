import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  console.log('Client connecté')
  ws.send('Bienvenue, le serveur te répond !')

  ws.on('message', (data) => {
    console.log('Reçu :', data.toString())
    ws.send(`Écho : ${data}`)
  })
})

server.listen(3000, () => console.log('Serveur sur http://localhost:3000'))