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
      }
    | { type: 'room:players'; players: Player[]; hostId: User['id'] }
    | { type: 'room:kicked'; reason: string }
    | ({ type: 'chat' } & ChatMessage)
    | { type: 'draw:start'; stroke: Stroke }
    | { type: 'draw:points'; userId: User['id']; id: string; points: Point[] }
    | { type: 'draw:remove'; id: string }
    | { type: 'draw:clear' }
    | { type: 'error'; code: string; message: string }
