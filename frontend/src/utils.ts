import { onBeforeUnmount, ref } from 'vue'
import type { Difficulty, Point } from '@/types'

// Fond du tableau : le dessin, la gomme et le pot de peinture partagent cette couleur
export const CANVAS_COLOR = '#fbf7ee'

// Encre de couleur stable dérivée d'un identifiant (initiales des avatars, ≥ 4.5:1 sur papier)
export function colorFromId(id: string | number) {
    let hash = 0
    for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) | 0
    return `hsl(${Math.abs(hash) % 360} 55% 26%)`
}

export function initials(username: string) {
    return username.slice(0, 2).toUpperCase()
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
}

// Heure courante réactive, pour les comptes à rebours
export function useNow(interval = 250) {
    const now = ref(Date.now())
    const timer = setInterval(() => (now.value = Date.now()), interval)
    onBeforeUnmount(() => clearInterval(timer))
    return now
}

// Courbe lissée : on passe par les milieux des segments avec des courbes de Bézier
export function pathOf(points: Point[]) {
    const [first, ...rest] = points
    if (!first) return ''
    if (rest.length === 0) return `M${first[0]} ${first[1]}l0.01 0` // un simple point
    let d = `M${first[0]} ${first[1]}`
    for (let i = 0; i < rest.length - 1; i++) {
        const [x1, y1] = rest[i]!
        const [x2, y2] = rest[i + 1]!
        d += `Q${x1} ${y1} ${(x1 + x2) / 2} ${(y1 + y2) / 2}`
    }
    const last = rest.at(-1)!
    return d + `L${last[0]} ${last[1]}`
}
