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
        'lapin', 'souris', 'vache', 'cochon', 'cheval', 'mouton', 'canard', 'poule', 'abeille',
        'papillon', 'araignée', 'grenouille', 'éléphant', 'lion', 'singe', 'ours', 'baleine',
        'requin', 'fraise', 'cerise', 'citron', 'orange', 'poire', 'raisin', 'tomate',
        'champignon', 'fromage', 'pain', 'bonbon', 'sucette', 'chocolat', 'frite', 'hamburger',
        'sandwich', 'chaussure', 'chaussette', 'pantalon', 'robe', 'écharpe', 'gant', 'montre',
        'sac', 'valise', 'crayon', 'ciseaux', 'cahier', 'horloge', 'lampe', 'porte', 'fenêtre',
        'escalier', 'canapé', 'télévision', 'ordinateur', 'piano', 'tambour', 'bus', 'camion',
        'tracteur', 'moto', 'trottinette', 'hélicoptère', 'fourchette', 'cuillère', 'couteau',
        'assiette', 'bouteille', 'tasse', 'brosse à dents', 'savon', 'pluie', 'neige', 'éclair',
        'montagne', 'île', 'plage', 'nez', 'main', 'pied', 'sapin',
    ],
    medium: [
        'pirate', 'château', 'volcan', 'girafe', 'pingouin', 'dragon', 'sirène', 'robot',
        'fantôme', 'astronaute', 'cactus', 'ananas', 'crocodile', 'montgolfière', 'phare',
        'igloo', 'licorne', 'squelette', 'tornade', 'aquarium', 'guitare', 'trampoline',
        'boussole', 'sablier', 'toboggan', 'pieuvre', 'kangourou', 'moustache', 'arc-en-ciel',
        'bonhomme de neige', 'cerf-volant', 'sous-marin', 'tour Eiffel', "feu d'artifice",
        'pyramide', 'citrouille', 'vampire', 'chevalier', 'hamster', 'éolienne',
        'dinosaure', 'hérisson', 'paresseux', 'flamant rose', 'caméléon', 'méduse', 'hippocampe',
        'chauve-souris', 'toucan', 'koala', 'panda', 'zèbre', 'rhinocéros', 'hippopotame', 'lama',
        'morse', 'castor', 'écureuil', 'sorcière', 'magicien', 'momie', 'zombie', 'extraterrestre',
        'ninja', 'cowboy', 'clown', 'pompier', 'policier', 'plongeur', 'princesse', 'docteur',
        'boulanger', 'jardinier', 'balançoire', 'grande roue', 'manège', 'hamac', 'tente',
        'feu de camp', 'lampe torche', 'loupe', 'microscope', 'télescope', 'aimant', 'ampoule',
        'parachute', 'catapulte', 'épée', 'bouclier', 'couronne', 'trésor', 'carte au trésor',
        'ancre', 'bouée', 'moulin', 'pont', 'tunnel', 'église', 'statue de la Liberté', 'grotte',
        'cascade', 'désert', 'jungle', 'oasis', 'crêpe', 'croissant', 'sushi', 'spaghetti',
        'barbe à papa', 'pop-corn', 'bowling', 'surf', 'échecs', 'fléchettes', 'yoyo',
        'nœud papillon', 'appareil photo', 'manette', 'aspirateur', 'machine à laver',
    ],
    hard: [
        'gravité', 'démocratie', 'nostalgie', 'embouteillage', 'photosynthèse', 'déjà-vu',
        'insomnie', 'recyclage', 'procrastination', 'ombre chinoise', 'effet papillon',
        'trou noir', 'marée haute', 'mal de mer', 'jeu de mots', 'hibernation', 'éclipse',
        'mirage', 'écho', 'reflet', 'liberté', 'jalousie', 'vertige', 'cauchemar', 'horoscope',
        'inflation', 'migration', 'camouflage', 'évolution', 'gratte-ciel', 'téléportation',
        'angle mort', 'coup de foudre', 'lune de miel', 'boule de cristal', 'sens interdit',
        'selfie', 'déménagement', 'apesanteur', 'chaîne alimentaire',
        'amitié', 'colère', 'timidité', 'fierté', 'ennui', 'bonheur', 'tristesse', 'confiance',
        'mensonge', 'secret', 'souvenir', 'imagination', 'silence', 'chance', 'destin', 'paradoxe',
        'infini', 'karma', 'électricité', 'magnétisme', 'atome', 'ADN', 'séisme',
        'réchauffement climatique', 'pollution', 'marée noire', 'aurore boréale', 'big bang',
        'intelligence artificielle', 'réalité virtuelle', 'wifi', 'mot de passe',
        'virus informatique', 'réseau social', 'algorithme', 'élection', 'grève', 'manifestation',
        'impôts', 'bureaucratie', 'chômage', 'retraite', 'mondialisation', 'publicité', 'censure',
        'tribunal', 'alibi', "poisson d'avril", 'tomber dans les pommes', 'coup de soleil',
        'chair de poule', 'mouton noir', 'langue de bois', 'bouc émissaire', 'cheval de Troie',
        'talon d\'Achille', 'voyage dans le temps', 'heure de pointe', 'décalage horaire',
        'effet domino', 'bouche-à-oreille', 'coup de théâtre', 'fin du monde', 'nuit blanche',
        'page blanche', 'sixième sens', 'âge de pierre', 'Moyen Âge', 'révolution', 'préhistoire',
        'archéologie', 'philosophie', 'mythologie', 'hypnose', 'méditation', 'superstition',
        'gourmandise', 'paresse', 'avarice', 'quatrième dimension',
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
