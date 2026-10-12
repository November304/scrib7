// Avatars et couvre-chefs prédéfinis (dessins dans frontend/public/avatars et frontend/public/hats).
// Listes à garder synchronisées avec frontend/src/avatars.ts
export const AVATARS = [
    'cat',
    'dog',
    'fox',
    'panda',
    'rabbit',
    'bear',
    'frog',
    'owl',
    'penguin',
    'mouse',
    'koala',
    'chick',
]

export const HATS = ['cap', 'tophat', 'crown', 'beanie', 'antenna', 'halo', 'party']

// Choix facultatif : absent -> null, inconnu -> undefined (refusé par l'appelant)
function parseChoice(value, list) {
    if (value === undefined || value === null || value === '') return null
    return list.includes(value) ? value : undefined
}

export const parseAvatar = (value) => parseChoice(value, AVATARS)
export const parseHat = (value) => parseChoice(value, HATS)
