// Couleur stable dérivée d'un identifiant (pour les avatars)
export function colorFromId(id: string | number) {
    let hash = 0
    for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) | 0
    return `hsl(${Math.abs(hash) % 360} 70% 55%)`
}

export function initials(username: string) {
    return username.slice(0, 2).toUpperCase()
}
