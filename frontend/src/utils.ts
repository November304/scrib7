import { onBeforeUnmount, ref } from 'vue'
import type { Difficulty } from '@/types'

// Couleur néon stable dérivée d'un identifiant (initiales des avatars, lisible sur fond sombre)
export function colorFromId(id: string | number) {
    let hash = 0
    for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) | 0
    return `hsl(${Math.abs(hash) % 360} 75% 70%)`
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
