# scrib7

Jeu multijoueur en ligne inspiré de skribbl.io : un joueur dessine, les autres devinent.
Mode signature (à venir) : **l'Imposteur**, où tout le monde dessine le même mot à tour de rôle…
sauf un joueur qui ne le connaît pas et doit bluffer.

## Stack

| Partie   | Technologies                                                                   |
| -------- | ------------------------------------------------------------------------------ |
| Frontend | Vue 3, TypeScript, Vite, Vue Router, Pinia, dessin en SVG                      |
| Backend  | Node.js, Express 5, WebSocket (`ws`), Prisma 7 + SQLite                        |
| Sécurité | bcrypt (mots de passe), JWT dans un cookie `httpOnly`, validation côté serveur |

## Installation

```bash
pnpm install                       # installe tout + génère le client Prisma
cp backend/.env.example backend/.env   # puis change JWT_SECRET
pnpm --filter backend db:migrate   # crée la base SQLite
pnpm dev                           # front sur http://localhost:5173, API sur :3000
```

En dev, Vite relaie `/api` et `/ws` vers Express (même origine → le cookie passe sans CORS).
En production, `pnpm build` puis `pnpm --filter backend start` : Express sert aussi le build du front.

## Architecture

```
backend/
  server.js          Express : JSON, cookies, routes, fichiers statiques, WebSocket
  prisma/            schéma + migrations
  src/auth.js        /api/auth : register, login, guest, logout, me + middleware requireAuth
  src/ws.js          serveur WebSocket : auth au handshake, validation et routage des messages
  src/rooms.js       salles en mémoire : joueurs, hôte, traits du dessin
frontend/src/
  services/socket.ts connexion WebSocket unique avec reconnexion automatique
  stores/            Pinia : auth (utilisateur courant), room (état de la salle)
  views/             Login, Home, Room
  components/        DrawingBoard (SVG), DrawingToolbar, PlayerList, ChatBox, UserAvatar
```

## Protocole WebSocket

Messages JSON `{ type, ...données }`. Le serveur valide tout (couleurs, coordonnées, tailles)
et ne fait jamais confiance au client.

| Client → serveur | Serveur → clients                           |
| ---------------- | ------------------------------------------- |
| `room:create`    | `room:state` (état complet à l'arrivée)     |
| `room:join`      | `room:players` (arrivées, départs, hôte)    |
| `room:leave`     | `room:kicked` (ouvert dans un autre onglet) |
| `chat`           | `chat`                                      |
| `draw:start`     | `draw:start`                                |
| `draw:points`    | `draw:points` (envoyés par paquets ~25/s)   |
| `draw:undo`      | `draw:remove`                               |
| `draw:clear`     | `draw:clear` (hôte uniquement)              |

## Feuille de route

- [x] Comptes (bcrypt + JWT) et mode invité
- [x] Salles avec code, lien d'invitation, transfert d'hôte
- [x] Dessin SVG synchronisé en temps réel, gomme, annuler, chat
- [ ] Mode classique : manches, mot secret, minuteur, score
- [ ] Mode Imposteur : rôles cachés, tours de dessin, vote
- [ ] Roulette de malus, replay final animé
- [ ] Upload d'avatar et de packs de mots, historique des parties (Prisma)
- [ ] Galerie (IndexedDB), PWA, Web Component `<scribble-gallery>`
- [ ] Déploiement Nginx + PM2
