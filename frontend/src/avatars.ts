// Avatars et couvre-chefs prédéfinis, dessinés dans public/avatars et public/hats.
// Listes à garder synchronisées avec backend/src/avatars.js (le serveur refuse les autres)

// top : ordonnée du haut de la tête (repère 64×64), là où se pose le couvre-chef
export const AVATARS = [
    { id: 'cat', label: 'Chat', top: 22 },
    { id: 'dog', label: 'Chien', top: 19 },
    { id: 'fox', label: 'Renard', top: 21 },
    { id: 'panda', label: 'Panda', top: 19 },
    { id: 'rabbit', label: 'Lapin', top: 26 },
    { id: 'bear', label: 'Ours', top: 20 },
    { id: 'frog', label: 'Grenouille', top: 17 },
    { id: 'owl', label: 'Hibou', top: 18 },
    { id: 'penguin', label: 'Pingouin', top: 17 },
    { id: 'mouse', label: 'Souris', top: 27 },
    { id: 'koala', label: 'Koala', top: 22 },
    { id: 'chick', label: 'Poussin', top: 21 },
] as const

export const HATS = [
    { id: 'cap', label: 'Casquette' },
    { id: 'tophat', label: 'Haut-de-forme' },
    { id: 'crown', label: 'Couronne' },
    { id: 'beanie', label: 'Bonnet' },
    { id: 'antenna', label: 'Antennes' },
    { id: 'halo', label: 'Auréole' },
    { id: 'party', label: 'Chapeau de fête' },
] as const

export type AvatarId = (typeof AVATARS)[number]['id']
export type HatId = (typeof HATS)[number]['id']

const INITIALS_TOP = 18 // sans avatar : au-dessus des initiales

const findAvatar = (id: string | null) => AVATARS.find((a) => a.id === id)

// null si inconnu : on retombe alors sur les initiales / pas de couvre-chef
export function avatarUrl(id: string | null) {
    return findAvatar(id) ? `/avatars/${id}.svg` : null
}

export function hatUrl(id: string | null) {
    return HATS.some((h) => h.id === id) ? `/hats/${id}.svg` : null
}

export function headTop(avatar: string | null) {
    return findAvatar(avatar)?.top ?? INITIALS_TOP
}
