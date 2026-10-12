import { randomInt } from 'crypto'

// Mots proposés au dessinateur, classés par difficulté.
// Plus tard : packs de mots personnalisés stockés en base (Prisma).
// prettier-ignore
export const WORDS = {
    easy: [
        'chat', 'chien', 'maison', 'soleil', 'arbre', 'pomme', 'voiture', 'fleur', 'poisson',
        'lune', 'étoile', 'ballon', 'chapeau', 'livre', 'gâteau', 'banane', 'vélo', 'bateau',
        'nuage', 'cœur', 'oiseau', 'clé', 'lit', 'table', 'chaise', 'œuf', 'pizza', 'train',
        'avion', 'tortue', 'serpent', 'escargot', 'glace', 'carotte', 'parapluie', 'fusée',
        'lunettes', 'téléphone', 'cadeau', 'bougie',
    ],
    medium: [
        'pirate', 'château', 'volcan', 'girafe', 'pingouin', 'dragon', 'sirène', 'robot',
        'fantôme', 'astronaute', 'cactus', 'ananas', 'crocodile', 'montgolfière', 'phare',
        'igloo', 'licorne', 'squelette', 'tornade', 'aquarium', 'guitare', 'trampoline',
        'boussole', 'sablier', 'toboggan', 'pieuvre', 'kangourou', 'moustache', 'arc-en-ciel',
        'bonhomme de neige', 'cerf-volant', 'sous-marin', 'tour Eiffel', "feu d'artifice",
        'pyramide', 'citrouille', 'vampire', 'chevalier', 'hamster', 'éolienne',
    ],
    hard: [
        'gravité', 'démocratie', 'nostalgie', 'embouteillage', 'photosynthèse', 'déjà-vu',
        'insomnie', 'recyclage', 'procrastination', 'ombre chinoise', 'effet papillon',
        'trou noir', 'marée haute', 'mal de mer', 'jeu de mots', 'hibernation', 'éclipse',
        'mirage', 'écho', 'reflet', 'liberté', 'jalousie', 'vertige', 'cauchemar', 'horoscope',
        'inflation', 'migration', 'camouflage', 'évolution', 'gratte-ciel', 'téléportation',
        'angle mort', 'coup de foudre', 'lune de miel', 'boule de cristal', 'sens interdit',
        'selfie', 'déménagement', 'apesanteur', 'chaîne alimentaire',
    ],
}

export const DIFFICULTIES = ['easy', 'medium', 'hard']

// Tire un mot de la difficulté demandée en évitant ceux déjà joués dans la partie
export function pickWord(difficulty, used) {
    const list = WORDS[difficulty]
    const fresh = list.filter((w) => !used.has(w))
    const pool = fresh.length ? fresh : list
    return pool[randomInt(pool.length)]
}
