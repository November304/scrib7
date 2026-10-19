---
version: alpha
name: scrib7-carnet-kraft
description: >
  Direction « Carnet kraft » pour scrib7, jeu de dessin multijoueur. Le salon de jeu est un
  carnet de croquis posé sur une table d'atelier : fond kraft, feuilles de papier scotchées au
  masking tape, joueurs en tirages photo à coins noirs, minuteur en tampon encreur rouge, chat sur
  fiche bristol lignée. Serif chaleureux (Alegreya) pour tout le texte, manuscrit (Kalam) réservé
  aux annotations. Couleur forte uniquement sur le sens : bleu Bic pour agir, rouge tampon pour le
  temps et l'imposteur, vert pour « trouvé ».

colors:
  kraft: "#C4A57A"
  kraft-deep: "#A88758"
  paper: "#F8F1E2"
  paper-2: "#EFE4CC"
  paper-bright: "#FFFCF5"
  canvas: "#FBF7EE"
  ink: "#2A1F16"
  ink-soft: "#5E5145"
  line: "#8A7660"
  blue: "#2B4C9A"
  blue-deep: "#1F3873"
  red: "#B3362B"
  green: "#3F7A4A"
  tape: "rgb(233 221 176 / 0.88)"
  photo-corner: "#2A1F16"

typography:
  display:
    fontFamily: "Alegreya, Georgia, 'Times New Roman', serif"
    fontSize: 2.5rem
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -0.01em
  title:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.45
  lead:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: 1.125rem
    fontWeight: 700
    lineHeight: 1.3
  mark:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
  ticket:
    fontFamily: "'Courier New', Courier, monospace"
    fontSize: 2rem
    fontWeight: 700
  hand:
    fontFamily: "Kalam, 'Segoe Print', 'Comic Sans MS', cursive"
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.35
  word:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: 1.875rem
    fontWeight: 700
    letterSpacing: 0.3em
  stamp:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: 1.375rem
    fontWeight: 800
    fontVariantNumeric: "lining-nums tabular-nums"
  button:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: 1.0625rem
    fontWeight: 700
    lineHeight: 1

rounded:
  paper: 2px
  button: 3px
  tab: 7px
  stamp: 50%

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px

tilt:
  none: 0deg
  slight: 0.6deg
  soft: 1.5deg
  strong: 2.5deg
  max: 3deg

motion:
  quick: 140ms
  settle: 220ms
  stamp: 180ms
  ease-settle: "cubic-bezier(0.2, 0.8, 0.2, 1)"

components:
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    shadow: "{shadow.sheet}"
    padding: "{spacing.lg}"
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: 12px 20px
    height: 44px
  button-secondary:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    border: "1.5px solid {colors.line}"
    rounded: "{rounded.button}"
  button-danger:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.red}"
    border: "1.5px solid {colors.red}"
  text-input:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    border: "1.5px solid {colors.line}"
    rounded: "{rounded.paper}"
    height: 44px
  timer-stamp:
    textColor: "{colors.red}"
    border: "3px double ring {colors.red}"
    rounded: "{rounded.stamp}"
    size: 64px
  player-print:
    backgroundColor: "{colors.paper-bright}"
    corners: "{colors.photo-corner}"
  chat-card:
    backgroundColor: "{colors.paper-bright}"
    rule: "rgb(43 76 154 / 0.2) every 26px"
    margin: "{colors.red}"
---

# DESIGN.md — scrib7 · Carnet kraft

## Overview

scrib7 est un jeu : on y passe des sessions courtes, intenses, à plusieurs. L'interface est un
**carnet de croquis posé sur une table d'atelier**. Le fond de page est un papier kraft fibreux.
Tout ce qui contient de l'information est une **feuille de papier** posée dessus (légèrement
tournée, tenue par du masking tape). Les joueurs sont des **tirages photo** aux coins noirs, le
minuteur est un **tampon encreur**, le chat est une **fiche bristol lignée**, le tableau de dessin
est une **feuille à dessin** scotchée aux deux coins.

Ce n'est pas un décor : chaque objet correspond à une fonction du jeu, et l'objet choisi dit
quelque chose de son rôle (le tampon = le temps qui presse et les verdicts, le tirage photo = une
personne, la feuille scotchée = un contenu qu'on regarde).

**Caractéristiques clés**

- Fond kraft `{colors.kraft}` texturé ; surfaces papier `{colors.paper}` avec grain et ombre douce
  de feuille posée.
- Couleur forte réservée au sens : bleu Bic `{colors.blue}` = agir (et « moi »), rouge tampon
  `{colors.red}` = temps urgent, imposteur, danger, vert `{colors.green}` = trouvé / validé.
- Alegreya pour tout le texte, Kalam uniquement pour les annotations (noms des joueurs, « tout
  proche ! », légendes, numéro de manche).
- Rotations petites et variées (0,6° à 2,5°, jamais plus de 3°), jamais sur un bloc de texte de
  plus de deux lignes.
- Une seule attache principale : le masking tape. Les coins photo sont réservés aux joueurs.
- Rien ne bouge au repos. Le mouvement répond à une action ou marque un verdict.

## Tokens CSS

À placer tel quel dans `frontend/src/assets/main.css`. Les composants n'utilisent que ces
variables ; aucune couleur hexadécimale propre, sauf nécessité fonctionnelle (palette de dessin).

```css
:root {
    /* Matières */
    --kraft: #c4a57a;
    --kraft-deep: #a88758;
    --paper: #f8f1e2;
    --paper-2: #efe4cc;
    --paper-bright: #fffcf5;
    --canvas: #fbf7ee; /* fond du dessin ET couleur de la gomme */
    --tape: rgb(233 221 176 / 0.88);

    /* Encres */
    --ink: #2a1f16;
    --ink-soft: #5e5145;
    --line: #8a7660; /* bordures d'éléments interactifs : ≥ 3:1 sur papier */
    --blue: #2b4c9a;
    --blue-deep: #1f3873;
    --red: #b3362b;
    --green: #3f7a4a;

    /* Typo */
    --font-text: Alegreya, Georgia, 'Times New Roman', serif;
    --font-hand: Kalam, 'Segoe Print', 'Comic Sans MS', cursive;
    --font-ticket: 'Courier New', Courier, monospace;
    --fs-display: clamp(2rem, 1.4rem + 2.4vw, 2.75rem);
    --fs-title: 1.375rem;
    --fs-body: 1.0625rem;
    --fs-small: 0.9375rem;
    --fs-lead: 1.125rem;
    --fs-mark: 2rem;
    --fs-word: clamp(1.4rem, 1.1rem + 1.2vw, 1.875rem);

    /* Formes */
    --radius-paper: 2px;
    --radius-btn: 3px;
    --radius-tab: 7px;
    --tilt-slight: 0.6deg;
    --tilt-soft: 1.5deg;
    --tilt-strong: 2.5deg;

    /* Profondeur : feuilles posées, pas de halo */
    --shadow-sheet: 0 1px 1px rgb(60 40 20 / 0.22), 0 6px 14px -6px rgb(60 40 20 / 0.35);
    --shadow-print: 0 2px 5px -1px rgb(60 40 20 / 0.4);
    --shadow-lift: 0 2px 2px rgb(60 40 20 / 0.2), 0 14px 28px -10px rgb(60 40 20 / 0.45);
    --shadow-press: 0 2px 0 var(--blue-deep);
    --shadow-tab: inset 0 -5px 6px -5px rgb(60 40 20 / 0.35);

    /* Textures (phase 4 : public/assets/scrapbook/) */
    --tex-kraft: url('/assets/scrapbook/kraft.webp');
    --tex-paper: url('/assets/scrapbook/paper-grain.webp');

    /* Mouvement */
    --dur-quick: 140ms;
    --dur-settle: 220ms;
    --dur-stamp: 180ms;
    --ease-settle: cubic-bezier(0.2, 0.8, 0.2, 1);

    color-scheme: light;
}
```

## Colors

### Matières (surfaces)

| Token | Hex | Rôle |
|---|---|---|
| `--kraft` | #C4A57A | Fond de page, toujours texturé. Jamais derrière du texte courant. |
| `--kraft-deep` | #A88758 | Bords, ombres colorées du kraft, séparateurs posés sur le kraft. |
| `--paper` | #F8F1E2 | Feuilles : panneaux, fiches, overlays. Surface par défaut du texte. |
| `--paper-2` | #EFE4CC | Second ton de papier : zone secondaire dans une feuille, ligne survolée. |
| `--paper-bright` | #FFFCF5 | Champs de saisie, bord des tirages photo, boutons secondaires. |
| `--canvas` | #FBF7EE | Fond du tableau de dessin, des vignettes de la galerie, et couleur de la gomme. |
| `--tape` | rgba #E9DDB0 / 88 % | Masking tape (semi-transparent : on voit la feuille dessous). |

### Encres (texte et sens)

| Token | Hex | Contraste | Rôle |
|---|---|---|---|
| `--ink` | #2A1F16 | 14.3:1 sur papier | Tout le texte courant, les titres. |
| `--ink-soft` | #5E5145 | 6.8:1 sur papier | Texte secondaire, annotations, placeholders. |
| `--line` | #8A7660 | 3.9:1 sur papier | Bordures d'inputs et de boutons secondaires. |
| `--blue` | #2B4C9A | 7.2:1 sur papier | Action principale, liens, focus, « moi », mon vote. |
| `--red` | #B3362B | 5.4:1 sur papier | Minuteur, temps urgent, imposteur, suppression, erreurs. |
| `--green` | #3F7A4A | 4.6:1 sur papier | Mot trouvé, joueur prêt, validation. |

Les couleurs de la palette de dessin (`DrawingToolbar.vue`, `COLORS`) restent des couleurs
réelles, hors système : ce sont les crayons des joueurs, pas l'interface.

Les couleurs d'identité des joueurs (`colorFromId`, teintes claires à 70 % de luminosité) servent
de **fond** aux avatars à initiales, avec le texte en `--ink`. Jamais comme couleur de texte.

## Typography

- **Alegreya** (Google Fonts, 400 / 700 / 800 + italique 400) : titres, texte, boutons, chiffres.
  Chiffres en `font-variant-numeric: lining-nums tabular-nums` pour les scores et le minuteur.
- **Kalam** (Google Fonts, 400 / 700) : annotations seulement. Noms des joueurs, « tout proche ! »,
  « Manche 2/3 », légendes sous les dessins, « (toi) », petites notes de l'interface.
- Chargement : `<link>` Google Fonts dans `index.html` avec `display=swap` et `preconnect`.

| Rôle | Police | Taille | Graisse | Usage |
|---|---|---|---|---|
| Display | Alegreya | 2–2.75rem fluide | 800 | Titre de la page de connexion, « Partie terminée ». |
| Title | Alegreya | 1.375rem | 700 | Titres de feuilles (« Nouvelle partie », « Joueurs »). |
| Body | Alegreya | 1.0625rem | 400 | Texte courant, chat, formulaires. |
| Small | Alegreya | 0.9375rem | 400 | Aides, compteurs. Jamais en dessous. |
| Lead | Alegreya / Kalam | 1.125rem | 700 | Noms des joueurs (Kalam), « Manche 2/3 », gros bouton. |
| Mark | Alegreya | 2rem | 800 | Wordmark, code de salle. |
| Ticket | Courier New | 2rem | 700 | Seul usage : le code tapé dans les 5 cases du ticket « Rejoindre » (chasse fixe pour aligner les cases). |
| Hand | Kalam | 1.0625rem | 400 | Annotations (messages système du chat, légendes). |
| Word | Alegreya | 1.4–1.875rem | 700, interlettrage 0.3em | Mot / indice à deviner. |
| Stamp | Alegreya | 1.375rem | 800, chiffres tabulaires | Minuteur, « +100 », rang. |

Règles : les titres de feuilles sont en casse normale (pas de petites capitales espacées), aucun
mot isolé coloré ou en italique dans un titre, longueur de ligne ≤ 70 caractères.

## Layout

- Conteneur principal 1280px max, marges latérales 16px (mobile) à 24px (desktop).
- Barre du haut sans fond : le wordmark et l'utilisateur posés directement sur le kraft.
- **Salle (desktop ≥ 1000px)** : trois colonnes `260px | 1fr | 300px`
  - gauche : étiquette du code de salle, puis les joueurs ;
  - centre : bandeau du mot et du minuteur, tableau, boîte à outils ;
  - droite : chat sur toute la hauteur.
- **Salle (< 1000px)** : une colonne : bandeau → tableau → outils → chat → joueurs → code.
- Espacement : 24px entre feuilles, 16px à l'intérieur, 8px entre éléments liés.

## Elevation & Depth

| Niveau | Traitement | Usage |
|---|---|---|
| Kraft | texture, aucune ombre | Fond de page. |
| Feuille posée | `--shadow-sheet` | Panneaux, chat, bandeau du mot, tableau. |
| Tirage photo | `--shadow-print` | Avatars des joueurs, vignettes de la galerie. |
| Soulevé | `--shadow-lift` | Overlay (choix du mot, résultats), feuille survolée qu'on peut choisir. |
| Pressé | `--shadow-press` → 0 | Bouton principal au repos → au clic. |

Pas de halo coloré, pas de glassmorphism, pas de flou d'arrière-plan. L'ombre est toujours
brun chaud et décalée vers le bas, comme une feuille réellement posée.

## Shapes & attaches

- **Coins** : papier presque droit (`2px`), boutons `3px`, tampons ronds. Pas de pilule.
- **Masking tape** : bande de 64–80 × 20–22px, bouts déchirés (`clip-path` ou SVG), tournée de
  -40° à +40°. Positions possibles : centre haut, deux coins du haut, un seul coin. Deux feuilles
  voisines n'ont jamais la même position de tape.
- **Coins photo** : triangles noirs dans les angles d'un tirage. Réservés aux joueurs et aux
  dessins de la galerie.
- **Bord déchiré** : bas des overlays (fiche arrachée d'un bloc). Un seul bord déchiré par écran.
- **Tampon** : double anneau rouge, encre légèrement irrégulière (SVG), tourné de -6° à -10°.

## Textures

| Fichier (phase 4) | Usage | Contrainte |
|---|---|---|
| `kraft.webp` | `body`, en mosaïque | ≤ 40 Ko, raccord invisible |
| `paper-grain.webp` | feuilles (en `multiply`), grain du tableau | ≤ 25 Ko, très léger |
| `tape-*.svg` | trois formes de masking tape | ≤ 2 Ko chacun |
| `photo-corner.svg` | coins des tirages | ≤ 1 Ko |
| `stamp-ring.svg` | anneau du tampon (minuteur, verdicts) | ≤ 3 Ko |
| `torn-edge.svg` | masque du bord déchiré | ≤ 2 Ko |
| `icons/*.svg` | crayon, coche, urne, couronne, loupe, horloge : trait d'encre | ≤ 1 Ko chacun |
| `scribble-circle.svg` | cercle au stylo bleu autour de « mon vote » | ≤ 2 Ko |

Le grain du tableau est une **couche au-dessus des traits** (`pointer-events: none`,
`mix-blend-mode: multiply`, opacité ≈ 0.35), pour que gomme et pot de peinture restent exacts :
le fond du dessin est une couleur unie `--canvas`.

## Components

### Barre du haut (`App.vue`)
Wordmark « Scrib**7** » en Alegreya 800 ; le 7 est encré dans un petit tampon rouge rond (le 7
mis en avant, cf. PRODUCT.md). À droite : tirage photo de l'utilisateur (32px), pseudo en Kalam,
« Déconnexion » en bouton texte.

### Boutons (`.btn`)
- `.primary` : fond bleu, texte papier, ombre pressée `0 2px 0 --blue-deep` ; au clic l'ombre
  disparaît et le bouton descend de 2px.
- par défaut : papier clair, bordure `--line`, texte encre ; survol : fond `--paper-2`.
- `.ghost` : texte seul, souligné au survol.
- `.danger` (nouveau) : texte et bordure rouges.
- `.small` : 36px de haut, 0.9375rem. Cible tactile ≥ 44px sur mobile.

### Champs (`input`, `select`)
Papier clair, bordure 1.5px `--line`, coins 2px, 44px de haut. Focus : bordure bleue + anneau
`outline: 2px solid --blue; outline-offset: 2px`. Le code de salle (`.code-input`) est affiché
en 5 cases dessinées (interlettrage + fond rayé).

### Feuille (`.card`, `.panel`)
Fond `--paper` + grain, `--shadow-sheet`, coins 2px. Une feuille peut porter un tape
(`.taped`, `.taped-corners`, `.taped-corner`). Titre de feuille en Alegreya 700, casse normale.

### Étiquette du code (`RoomView` → `.code-panel`)
Étiquette à bagage en papier `--paper-2` avec un œillet dessiné. Code en Alegreya 800, 2rem,
interlettrage 0.2em. Bouton « Copier le lien d'invitation » ; confirmation « Lien copié » avec
une coche dessinée (pas d'emoji).

### Joueurs (`PlayerList`)
Liste verticale compacte. Chaque joueur : tirage photo de l'avatar (40px, bord papier clair,
coins photo, rotation alternée ±1.5°), pseudo en Kalam, score en chiffres tabulaires. États par
**icônes dessinées + texte accessible** (`title` et texte masqué) : crayon = dessine, coche verte
= a trouvé / a fini, urne = a voté, couronne = hôte. « Moi » : pseudo souligné au stylo bleu.
« invité » : petite étiquette papier.

### Bandeau du mot (`GameHeader`)
Bande de papier déchirée, tenue par un tape au centre, tournée de -0.6°.
- Gauche : « Manche 2/3 » en Kalam.
- Centre : le mot ou l'indice. Les lettres cachées sont des traits d'encre (soulignés), les
  lettres révélées en Alegreya 700. Le nombre de lettres est en exposant.
- Droite : le minuteur.
- Le **minuteur** est un tampon rond rouge (64px). Sous 10 s, il s'encre entièrement : fond
  rouge, texte papier, et un mot « vite ! » s'ajoute pour ne pas dépendre de la couleur seule.
- La difficulté est une étiquette avec 1, 2 ou 3 points, plus le libellé.
- Dans le lobby, les réglages de l'hôte sont une fiche avec les champs alignés et le bouton
  « Lancer la partie » en bleu.

### Tableau (`DrawingBoard`)
Feuille `--canvas` scotchée aux deux coins du haut (tapes tournés de ±35°), `--shadow-sheet`.
Grain en surcouche. Curseur croix en mode dessin, pot en mode remplissage. Désactivé : rien ne
change sur le dessin, le curseur devient `not-allowed`.

### Boîte à outils (`DrawingToolbar`)
Bande de papier `--paper-2` sous le tableau.
- Couleurs : pastilles rondes de 28px, comme des gouttes de peinture ; la couleur active est
  entourée d'un anneau d'encre.
- Épaisseurs : boutons carrés papier de 40px.
- Gomme, pot, annuler : icônes au trait d'encre ; l'outil actif passe en fond `--paper` avec
  une bordure bleue.
- « Tout effacer » : variante danger.
- Le sélecteur de couleur personnalisée garde son disque arc-en-ciel (exception fonctionnelle).

### Overlays (`GameOverlay`)
Fiche bristol `--paper` posée sur le tableau (`--shadow-lift`), bord bas déchiré. Elle glisse et
se cale à l'apparition.
- **Choix du mot** : trois bouts de papier **différents**, chacun avec sa propre rotation et sa
  propre position de tape. La difficulté est indiquée par 1, 2 ou 3 points et par son libellé.
- **Fin du tour** : « Le mot était » en Kalam, le mot en display, les points en liste façon
  feuille de score.
- **Fin de partie** : le classement. Le 1er reçoit un tampon rouge « 1er » qui « tape » une fois,
  les 2e et 3e un rang encré, sans médaille emoji.

### Galerie Imposteur (`ImpostorGallery`)
- Les dessins sont des tirages : vignette `--canvas`, coins photo, bord papier clair.
- Les rotations viennent d'une liste fixe indexée (-2°, 1.5°, -0.8°, 2.2°, -1.4°…) et le tape
  change de position d'un tirage à l'autre : jamais une grille de cartes identiques.
- Légende en Kalam : pseudo, « (toi) ».
- **Mon vote** : cercle tracé au stylo bleu autour du tirage, et bouton « Voté ».
- **Verdict** : tampon rouge « Imposteur » posé de travers sur le tirage de l'imposteur (il tape
  une fois), puis les accusations en Kalam sous chaque tirage.
- Bandeau de verdict : feuille avec les deux mots, celui des joueurs et celui de l'imposteur.

### Chat (`ChatBox`)
- Fiche bristol lignée : lignes bleues tous les 26px, marge rouge à gauche. Chaque message tient
  sur sa ligne.
- Messages des joueurs : pseudo en Alegreya 700 suivi du texte.
- Messages système en Kalam `--ink-soft`.
- « A trouvé » en vert avec une coche dessinée, « tout proche » en Kalam rouge.
- Le champ de saisie est la dernière ligne de la fiche.

### Connexion (`LoginView`, `AvatarPicker`)
- **Page** : fiche d'inscription façon carte de bibliothèque.
  - Les onglets « Invité / Connexion / Inscription » sont des intercalaires de classeur
    dépassant du haut de la fiche ; l'onglet actif a la couleur de la fiche.
  - Le titre « Dessine. Devine. Démasque. » s'affiche en display, sans mot coloré.
- **AvatarPicker** :
  - Les avatars sont des petits tirages ; le choix actif est entouré au stylo bleu.
  - L'aperçu est un tirage plus grand, avec le pseudo en légende Kalam.

### Accueil (`HomeView`)
Deux objets volontairement **différents** :
- « Nouvelle partie » : grande feuille scotchée en haut, avec un gros bouton bleu.
- « Rejoindre » : un ticket détachable (bord pointillé perforé), avec le champ du code en
  5 cases et le bouton.

## Motion

| Moment | Effet | Durée |
|---|---|---|
| Apparition d'un overlay | glisse de 8px vers le bas et se cale (rotation 0 → finale) | 220ms `--ease-settle` |
| Verdict (tampon « Imposteur », « 1er », « +100 ») | `scale(1.25) → 1`, opacité 0 → 1 | 180ms |
| Bouton principal pressé | `translateY(2px)`, ombre → 0 | 140ms |
| Survol d'un choix ou d'un tirage votable | soulevé (`--shadow-lift`), redressé de moitié | 140ms |
| Minuteur sous 10 s | changement d'état, pas d'animation en boucle | — |

- Rien n'est animé au repos : pas de flottement, pas de tape qui oscille, pas de parallaxe.
- `@media (prefers-reduced-motion: reduce)` : plus aucune transition de transformation, les
  verdicts apparaissent directement. Les **rotations statiques restent** car elles ne bougent pas.

## Do's and Don'ts

### Do
- Poser chaque bloc d'information sur une feuille de papier, jamais directement sur le kraft
  (sauf le wordmark et le menu utilisateur).
- Varier les rotations et les positions de tape d'un élément à l'autre (listes indexées fixes, pas
  d'aléatoire qui change au rendu).
- Réserver le bleu à l'action, le rouge au temps et aux verdicts, le vert à « trouvé ».
- Garder le texte long droit (0°) ou presque (≤ 0.6°).
- Remplacer chaque emoji de l'interface par une icône dessinée au trait d'encre, accompagnée de
  son texte accessible.
- Tester chaque couleur de texte contre le papier réel (≥ 4.5:1).

### Don't (anti-patterns)
- **Pas de dégradé violet générique**, ni de dégradé décoratif d'aucune sorte. Seule exception :
  le disque arc-en-ciel du sélecteur de couleur personnalisée, qui est fonctionnel.
- **Pas de cartes toutes identiques** : la galerie, les choix de mot et l'accueil varient la
  forme, la rotation et l'attache.
- **Pas d'emojis gratuits** : ✏️ ✅ 🗳️ 👑 🕵️ ⏱ 🥇 deviennent des icônes dessinées ou des tampons.
- Pas de halo néon ni de lueur colorée (héritage du thème précédent à supprimer).
- Pas de petites capitales espacées pour les titres de panneaux.
- Pas de mot isolé coloré ou en italique dans un titre (« Démasque. » perd son accent).
- Pas de police manuscrite pour le texte courant, les boutons ou les champs.
- Pas de rotation au-delà de 3°, ni de rotation sur un paragraphe.
- Pas plus d'une attache par élément (tape **ou** coins photo **ou** trombone, jamais mélangés).
- Pas de texture sous le dessin lui-même (sinon la gomme et le pot de peinture mentent).
- Pas de pilule, pas de glassmorphism, pas de fond animé.

## Responsive Behavior

| Largeur | Changements |
|---|---|
| ≥ 1000px | Salle en 3 colonnes ; rotations normales. |
| 600–999px | Salle en une colonne ; le chat passe sous le tableau ; l'accueil passe en 2 colonnes empilées. |
| < 600px | Rotations divisées par deux (`--tilt-*` réduits) ; tapes plus petits ; boutons pleine largeur dans les formulaires ; bandeau du mot sur deux lignes (mot / minuteur). |
| 375px | Rien ne déborde ; le tableau prend toute la largeur moins 16px de chaque côté. |

- Cibles tactiles ≥ 44 × 44px (pastilles de couleur comprises sur mobile).
- Le tableau garde son ratio 4:3.

## Iteration Guide

1. Toujours partir des tokens : une nouvelle couleur ou une nouvelle ombre s'ajoute ici d'abord.
2. Un composant à la fois, en vérifiant desktop (1440px) et mobile (375px).
3. Avant d'ajouter un ornement, se demander quelle fonction du jeu il représente ; sinon, l'enlever.
4. Les assets décoratifs vivent dans `frontend/public/assets/scrapbook/`.

## Known Gaps

- Les avatars animaux ont un fond papier `--paper-2` (l'ancien fond bleu nuit et son halo néon
  ont été retirés) ; les animaux eux-mêmes gardent leurs couleurs d'origine.
- Le message de victoire envoyé par le serveur contient un emoji 🏆 (texte backend, hors périmètre).
- Les pastilles de couleur de la boîte à outils sont annoncées par leur code hexadécimal ; des noms
  en français seraient plus accessibles.
