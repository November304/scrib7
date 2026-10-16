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

// Mode Imposteur : paires de mots assez proches pour que l'imposteur ne se rende pas compte
// tout de suite qu'il n'a pas le même mot que les autres
// prettier-ignore
export const IMPOSTOR_PAIRS = [
    ['chat', 'tigre'], ['chien', 'loup'], ['pomme', 'tomate'], ['citron', 'orange'],
    ['soleil', 'lune'], ['guitare', 'violon'], ['avion', 'oiseau'], ['bateau', 'sous-marin'],
    ['voiture', 'camion'], ['vélo', 'trottinette'], ['pizza', 'tarte'], ['hamburger', 'sandwich'],
    ['glace', 'gâteau'], ['château', 'maison'], ['arbre', 'sapin'], ['fleur', 'champignon'],
    ['parapluie', 'parasol'], ['chapeau', 'casquette'], ['lunettes', 'jumelles'],
    ['téléphone', 'télécommande'], ['ordinateur', 'télévision'], ['crayon', 'pinceau'],
    ['fourchette', 'cuillère'], ['bougie', 'lampe'], ['montre', 'boussole'], ['pirate', 'cowboy'],
    ['vampire', 'sorcière'], ['robot', 'astronaute'], ['dragon', 'dinosaure'],
    ['requin', 'dauphin'], ['pingouin', 'ours polaire'], ['abeille', 'mouche'],
    ['papillon', 'libellule'], ['escargot', 'tortue'], ['serpent', 'ver de terre'],
    ['girafe', 'zèbre'], ['volcan', 'montagne'], ['plage', 'désert'], ['nuage', 'fumée'],
    ['pluie', 'neige'], ['fusée', 'avion'], ['banane', 'croissant'], ['carotte', 'crayon'],
    ['œuf', 'ballon'], ['igloo', 'tente'], ['phare', 'tour'], ['piano', 'clavier'],
    ['football', 'basket'], ['ski', 'luge'], ['lit', 'canapé'], ['chaise', 'tabouret'],
    ['clé', 'cadenas'], ['cadeau', 'valise'], ['couronne', 'chapeau'], ['épée', 'couteau'],
    ['fantôme', 'momie'], ['licorne', 'cheval'], ['sirène', 'poisson'], ['hélicoptère', 'drone'],
    ['train', 'métro'], ['moto', 'scooter'], ['brosse à dents', 'peigne'], ['savon', 'éponge'],
    ['frite', 'allumette'], ['bonhomme de neige', 'épouvantail'], ['pyramide', 'tente'],
    ['lion', 'chat'], ['vache', 'cochon'], ['canard', 'poule'], ['fraise', 'cerise'],
    ['horloge', 'boussole'], ['bouteille', 'verre'], ['fenêtre', 'porte'], ['cœur', 'étoile'],
    ['souris', 'hamster'], ['lapin', 'kangourou'], ['renard', 'chien'], ['ours', 'gorille'],
    ['singe', 'paresseux'], ['éléphant', 'mammouth'], ['rhinocéros', 'hippopotame'],
    ['crocodile', 'lézard'], ['grenouille', 'crapaud'], ['hibou', 'perroquet'],
    ['aigle', 'corbeau'], ['pigeon', 'mouette'], ['flamant rose', 'cygne'], ['paon', 'dinde'],
    ['baleine', 'orque'], ['pieuvre', 'méduse'], ['crabe', 'homard'], ['crevette', 'escargot'],
    ['étoile de mer', 'coquillage'], ['araignée', 'fourmi'], ['coccinelle', 'scarabée'],
    ['moustique', 'abeille'], ['chenille', 'serpent'], ['chameau', 'dromadaire'],
    ['mouton', 'chèvre'], ['âne', 'cheval'], ['hérisson', 'porc-épic'], ['écureuil', 'castor'],
    ['chauve-souris', 'hibou'], ['phoque', 'morse'], ['koala', 'panda'], ['raisin', 'myrtille'],
    ['poire', 'avocat'], ['ananas', 'noix de coco'], ['pastèque', 'melon'], ['pêche', 'abricot'],
    ['kiwi', 'pomme de terre'], ['champignon', 'brocoli'], ['salade', 'chou'], ['oignon', 'ail'],
    ['piment', 'poivron'], ['maïs', 'blé'], ['pain', 'baguette'], ['fromage', 'beurre'],
    ['saucisse', 'hot-dog'], ['pâtes', 'riz'], ['soupe', 'café'], ['crêpe', 'gaufre'],
    ['donut', 'bagel'], ['cookie', 'biscuit'], ['bonbon', 'sucette'], ['chocolat', 'caramel'],
    ['popcorn', 'chips'], ['sushi', 'maki'], ['tacos', 'kebab'], ['œuf au plat', 'pancake'],
    ['lait', 'yaourt'], ['jus d\'orange', 'limonade'], ['thé', 'café'], ['bière', 'champagne'],
    ['couteau', 'ciseaux'], ['marteau', 'hache'], ['tournevis', 'clé à molette'],
    ['scie', 'râteau'], ['pelle', 'balai'], ['seau', 'arrosoir'], ['échelle', 'escalier'],
    ['brouette', 'chariot'], ['aspirateur', 'balai'], ['réfrigérateur', 'armoire'],
    ['four', 'micro-ondes'], ['casserole', 'poêle'], ['théière', 'cafetière'], ['bol', 'assiette'],
    ['tasse', 'mug'], ['miroir', 'tableau'], ['rideau', 'drapeau'], ['tapis', 'couverture'],
    ['oreiller', 'coussin'], ['baignoire', 'piscine'], ['douche', 'fontaine'], ['lavabo', 'évier'],
    ['toilettes', 'poubelle'], ['ampoule', 'bougie'], ['ventilateur', 'moulin'],
    ['radiateur', 'cheminée'], ['sac à dos', 'valise'], ['portefeuille', 'enveloppe'],
    ['livre', 'cahier'], ['journal', 'lettre'], ['stylo', 'feutre'], ['gomme', 'taille-crayon'],
    ['règle', 'équerre'], ['calculatrice', 'téléphone'], ['appareil photo', 'caméra'],
    ['micro', 'haut-parleur'], ['casque audio', 'boucles d\'oreilles'],
    ['clavier', 'souris d\'ordinateur'], ['manette', 'télécommande'], ['batterie', 'tambour'],
    ['trompette', 'saxophone'], ['flûte', 'clarinette'], ['harpe', 'lyre'], ['accordéon', 'piano'],
    ['violoncelle', 'contrebasse'], ['tennis', 'badminton'], ['golf', 'hockey'], ['boxe', 'karaté'],
    ['natation', 'plongée'], ['surf', 'skateboard'], ['patin à glace', 'roller'],
    ['bowling', 'billard'], ['fléchettes', 'tir à l\'arc'], ['trampoline', 'balançoire'],
    ['toboggan', 'manège'], ['cerf-volant', 'parachute'], ['montgolfière', 'dirigeable'],
    ['taxi', 'bus'], ['ambulance', 'camion de pompiers'], ['tracteur', 'bulldozer'],
    ['grue', 'pelleteuse'], ['voilier', 'canoë'], ['kayak', 'pirogue'], ['paquebot', 'ferry'],
    ['pont', 'tunnel'], ['gratte-ciel', 'immeuble'], ['église', 'mosquée'], ['hôpital', 'école'],
    ['moulin à vent', 'éolienne'], ['cabane', 'niche'], ['grotte', 'tunnel'], ['île', 'oasis'],
    ['rivière', 'cascade'], ['lac', 'étang'], ['forêt', 'jungle'], ['cactus', 'palmier'],
    ['rose', 'tulipe'], ['tournesol', 'marguerite'], ['feuille', 'plume'],
    ['arc-en-ciel', 'aurore boréale'], ['éclair', 'feu d\'artifice'], ['tornade', 'tsunami'],
    ['comète', 'étoile filante'], ['planète', 'ballon'], ['fée', 'ange'], ['sorcier', 'magicien'],
    ['chevalier', 'soldat'], ['roi', 'prince'], ['princesse', 'reine'], ['ninja', 'samouraï'],
    ['clown', 'mime'], ['zombie', 'fantôme'], ['loup-garou', 'vampire'],
    ['extraterrestre', 'robot'], ['super-héros', 'policier'], ['pompier', 'policier'],
    ['médecin', 'infirmier'], ['cuisinier', 'boulanger'], ['détective', 'espion'],
]

// Tire une paire pas encore jouée ; on mélange l'ordre pour que chaque mot puisse être celui
// de l'imposteur. Renvoie [mot des autres, mot de l'imposteur]
export function pickPair(used) {
    const fresh = IMPOSTOR_PAIRS.map((_, i) => i).filter((i) => !used.has(i))
    const pool = fresh.length ? fresh : IMPOSTOR_PAIRS.map((_, i) => i)
    const index = pool[randomInt(pool.length)]
    used.add(index)
    const [a, b] = IMPOSTOR_PAIRS[index]
    return randomInt(2) ? [a, b] : [b, a]
}
