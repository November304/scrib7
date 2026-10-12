export interface User {
    id: number | string
    username: string
    avatar: string | null
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
}

export interface ChatMessage {
    from: { id: User['id']; username: string } | null // null = message système
    text: string
    at: number
    variant?: 'info' | 'success' | 'close' // style des messages système
}

export type Difficulty = 'easy' | 'medium' | 'hard'
export type GamePhase = 'lobby' | 'choosing' | 'drawing' | 'turnEnd' | 'gameEnd'

// État de la partie tel que le voit CE joueur (le serveur cache le mot aux autres)
export interface GameState {
    phase: GamePhase
    round: number
    rounds: number
    drawTime: number
    drawerId: User['id'] | null
    remaining: number // ms avant la fin de la phase
    choices: { text: string; difficulty: Difficulty }[] | null // seulement pour le dessinateur
    word: string | null // pour le dessinateur, ceux qui ont trouvé, et en fin de tour
    difficulty: Difficulty | null
    hint: string | null // "_ _ a _"
    scores: Record<string, number>
    guessed: User['id'][]
    turnPoints: Record<string, number> | null
}

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
    | { type: 'draw:start'; stroke: Stroke }
    | { type: 'draw:points'; userId: User['id']; id: string; points: Point[] }
    | { type: 'draw:remove'; id: string }
    | { type: 'draw:clear' }
    | ({ type: 'game:state' } & GameState)
    | { type: 'error'; code: string; message: string }
