# scrib7

Jeu multijoueur en ligne inspiré de skribbl.io : un joueur dessine, les autres devinent.
Mode signature : **l'Imposteur**, où tout le monde dessine son mot en secret… mais l'un des
joueurs a un mot différent, et personne ne sait qui, pas même lui.

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
  src/game.js        base commune aux modes : réglages, minuteurs, scores, début/fin de partie
  src/classic.js     mode classique : tours, choix du mot, devinettes, indices, barème
  src/impostor.js    mode Imposteur : dessins secrets, vote, barème
  src/words.js       mots par difficulté + paires de mots proches pour l'Imposteur
frontend/src/
  services/socket.ts connexion WebSocket unique avec reconnexion automatique
  stores/            Pinia : auth (utilisateur courant), room (état de la salle)
  views/             Login, Home, Room
  components/        DrawingBoard (SVG), DrawingToolbar, PlayerList, ChatBox, UserAvatar,
                     GameHeader (mode, manche, mot/indice, minuteur), GameOverlay (choix du mot,
                     résultats), ImpostorGallery (dessins de tous les joueurs + vote)
```

## Protocole WebSocket

Messages JSON `{ type, ...données }`. Le serveur valide tout (couleurs, coordonnées, tailles)
et ne fait jamais confiance au client.

| Client → serveur | Serveur → clients                              |
| ---------------- | ---------------------------------------------- |
| `room:create`    | `room:state` (état complet à l'arrivée)        |
| `room:join`      | `room:players` (arrivées, départs, hôte)       |
| `room:leave`     | `room:kicked` (ouvert dans un autre onglet)    |
| `chat`           | `chat`                                         |
| `draw:start`     | `draw:start`                                   |
| `draw:points`    | `draw:points` (envoyés par paquets ~25/s)      |
| `draw:undo`      | `draw:remove`                                  |
| `draw:clear`     | `draw:clear`                                   |
| `game:start`     | `game:state` (personnalisé pour chaque joueur) |
| `game:choose`    | `draw:all` (Imposteur : dévoile les dessins)   |
| `game:vote`      |                                                |

En mode Imposteur, pendant la phase de dessin, les messages `draw:*` ne sont pas diffusés aux
autres joueurs : chacun ne voit que son propre dessin jusqu'au vote.

## Mode classique

`lobby → [choosing → drawing → turnEnd] × tours → gameEnd`

- L'hôte lance la partie (2 joueurs minimum) et règle le nombre de manches et le temps de dessin.
  Une **manche** = chaque joueur dessine une fois.
- Au début de son tour, le dessinateur choisit parmi **3 mots** : facile, moyen, difficile
  (15 s, sinon un mot est tiré au hasard). Lui seul peut dessiner.
- Les autres devinent dans le chat. La comparaison ignore accents, majuscules, espaces et tirets.
  À 1 lettre près (2 pour les mots de 6 lettres ou plus), le joueur reçoit en privé « tout proche ! ».
- Une bonne réponse n'est jamais affichée ; ceux qui ont trouvé (et le dessinateur) ne parlent
  plus qu'entre eux pour ne pas divulguer le mot.
- Des lettres sont révélées pendant la seconde moitié du temps. Le tour se termine quand tout
  le monde a trouvé ou que le temps est écoulé.
- Points (barème regroupé en haut de `backend/src/game.js`, à équilibrer) : base 100 / 200 / 300
  selon la difficulté ; celui qui trouve gagne de 100 % à 50 % de la base selon sa rapidité, le
  dessinateur jusqu'à 50 % selon la proportion de joueurs qui ont trouvé.

## Mode Imposteur (3 joueurs minimum)

`lobby → [drawing → voting → results] × manches → gameEnd`

- Chaque manche, tout le monde reçoit un mot et le dessine **en même temps et en secret**.
  Un joueur tiré au sort, l'imposteur, a un mot proche mais différent (chat / tigre,
  guitare / violon…). **Personne ne sait qui est l'imposteur, pas même lui** : il faut dessiner
  sans trop en dévoiler.
- À la fin du temps, tous les dessins sont dévoilés côte à côte et chacun vote (60 s, on peut
  changer d'avis ; la phase se termine dès que tout le monde a voté). On peut voter pour soi.
- L'imposteur est **démasqué** s'il reçoit strictement plus de voix que tous les autres
  (les votes pour soi-même ne comptent pas dans ce décompte).
- Points : +100 pour chaque joueur qui vote pour l'imposteur, qu'il soit l'imposteur ou non.
  C'est le seul barème.

## Feuille de route

- [x] Comptes (bcrypt + JWT) et mode invité
- [x] Salles avec code, lien d'invitation, transfert d'hôte
- [x] Dessin SVG synchronisé en temps réel, gomme, annuler, chat
- [x] Mode classique : manches, choix du mot (3 difficultés), minuteur, indices, score
- [ ] Équilibrage du barème de points
- [x] Mode Imposteur : mots secrets, dessins simultanés, vote
- [ ] Roulette de malus, replay final animé
- [ ] Upload d'avatar et de packs de mots, historique des parties (Prisma)
- [ ] Galerie (IndexedDB), PWA, Web Component `<scribble-gallery>`
- [ ] Déploiement Nginx + PM2
