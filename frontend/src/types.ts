export interface User {
    id: number | string
    username: string
    avatar: string | null
    hat: string | null
    guest: boolean
}

export type Player = User

export type Point = [number, number]

export interface Stroke {
    id: string
    userId: User['id']
    color: string
    width: number
    points: Point[]
    image?: string // pot de peinture : zone remplie (PNG transparent), sans points
}

export type DrawingTool = 'brush' | 'fill'

export interface ChatMessage {
    from: { id: User['id']; username: string } | null // null = message système
    text: string
    at: number
    variant?: 'info' | 'success' | 'close' // style des messages système
}

export type Difficulty = 'easy' | 'medium' | 'hard'
export type GameMode = 'classic' | 'impostor'
export type GamePhase =
    | 'lobby'
    | 'gameEnd'
    // classique
    | 'choosing'
    | 'drawing'
    | 'turnEnd'
    // imposteur (+ 'drawing')
    | 'voting'
    | 'results'

// État de la partie tel que le voit CE joueur (le serveur cache ce qu'il ne doit pas savoir)
interface BaseGameState {
    phase: GamePhase
    round: number
    rounds: number
    drawTime: number
    remaining: number // ms avant la fin de la phase
    scores: Record<string, number>
}

export interface ClassicGameState extends BaseGameState {
    mode: 'classic'
    drawerId: User['id'] | null
    choices: { text: string; difficulty: Difficulty }[] | null // seulement pour le dessinateur
    word: string | null // pour le dessinateur, ceux qui ont trouvé, et en fin de tour
    difficulty: Difficulty | null
    hint: string | null // "__a_"
    guessed: User['id'][]
    turnPoints: Record<string, number> | null
}

export interface ImpostorResult {
    impostorId: User['id']
    civilWord: string
    impostorWord: string
    caught: boolean
    votes: Record<string, User['id']> // votant -> joueur désigné
    points: Record<string, number>
}

export interface ImpostorGameState extends BaseGameState {
    mode: 'impostor'
    myWord: string | null // personne ne sait s'il a le mot de l'imposteur
    finished: User['id'][] // qui a validé son dessin
    voted: User['id'][] // qui a déjà voté (pas pour qui)
    myVote: User['id'] | null
    result: ImpostorResult | null
}

export type GameState = ClassicGameState | ImpostorGameState

// Messages envoyés par le serveur
export type ServerMessage =
    | {
          type: 'room:state'
          code: string
          hostId: User['id']
          players: Player[]
          strokes: Stroke[]
          canvas: { width: number; height: number }
          game: GameState
      }
    | { type: 'room:players'; players: Player[]; hostId: User['id'] }
    | { type: 'room:kicked'; reason: string }
    | ({ type: 'chat' } & ChatMessage)
    | { type: 'draw:start'; stroke: Stroke } // aussi pour les remplissages
    | { type: 'draw:points'; userId: User['id']; id: string; points: Point[] }
    | { type: 'draw:remove'; id: string }
    | { type: 'draw:clear' }
    | { type: 'draw:all'; strokes: Stroke[] }
    | ({ type: 'game:state' } & GameState)
    | { type: 'error'; code: string; message: string }

// --- Historique des parties (API REST /api/games) ---

export interface GameRecordPlayer {
    userId: number | null // null : invité, ou joueur qui a retiré la partie de son historique
    username: string
    avatar: string | null
    hat: string | null
    score: number
    rank: number // ex æquo = même rang
}

export interface GameRecord {
    id: number
    mode: GameMode
    roomCode: string
    rounds: number
    drawTime: number
    startedAt: string
    endedAt: string
    players: GameRecordPlayer[] // du premier au dernier
    me: GameRecordPlayer | null
}

export interface GameHistoryPage {
    games: GameRecord[]
    nextCursor: number | null
}

export interface GameStats {
    played: number
    wins: number
    totalPoints: number
    bestScore: number
    byMode: Record<GameMode, { played: number; wins: number }>
}
