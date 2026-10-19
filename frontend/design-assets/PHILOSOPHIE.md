# Assets scrapbook : intentions

Les fichiers de `public/assets/scrapbook/` sont **générés** par `generate.py` (graine fixe :
relancer le script redonne exactement les mêmes fichiers). Ne pas les retoucher à la main :
modifier le script, puis `python3 design-assets/generate.py` depuis `frontend/`.

## « Fibre lente » (textures, approche algorithmic-art)

Un papier n'est pas un bruit : c'est une mémoire de fabrication. La pâte a été brassée (des
nappes douces de densité, plus claires ou plus sombres), puis des fibres se sont couchées dans le
sens du tamis (de courts traits presque parallèles), enfin la presse a laissé un grain fin. Le
générateur reprend ces trois temps dans cet ordre : nappes de bruit en 1/f, fibres orientées par
une direction dominante avec une dispersion contrôlée, grain haute fréquence.

Tout est périodique par construction (bruit filtré dans le domaine de Fourier, fibres dessinées
sur le tore) : la texture se répète sans couture visible, ce qui permet des tuiles de 256 px très
légères au lieu d'une grande image.

Le contraste est tenu volontairement bas : la texture se sent plus qu'elle ne se voit, et ne doit
jamais concurrencer le texte ni les dessins des joueurs. Chaque amplitude a été réglée en
regardant la tuile à taille réelle sur le fond, pas en plein écran zoomé.

## « Encre d'atelier » (éléments, approche canvas-design)

Chaque élément est un objet de bureau réel, réduit à sa silhouette : bande de masking tape aux
bouts déchirés, coin photo en papier noir, tampon encreur au double anneau, bord de fiche arrachée,
cercle tracé au stylo bille. Aucun ne porte de texte : le texte reste dans l'interface, lisible et
traduisible.

La main est simulée par une irrégularité mesurée : les contours sont des polylignes dont chaque
point est décalé d'une petite quantité pseudo-aléatoire, jamais assez pour paraître tremblant. Le
tampon a des manques d'encre, le stylo dépasse son point de départ, le tape déchiré n'a pas deux
dents pareilles.

Les icônes (crayon, coche, urne, couronne, horloge, copie) partagent un seul trait d'encre de
2 px à bouts ronds, sur une grille de 24. Elles sont utilisées comme masques CSS : leur couleur
vient de `currentColor`, elles suivent donc les tokens.
