# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Des étudiants (projet du cours d'Applications Internet à l'N7) et leurs amis, qui se retrouvent
en ligne pour une partie rapide. L'hôte crée une salle et envoie le lien ou le code à 5 lettres ;
les autres arrivent en invité ou avec un compte. Le projet est aussi évalué par les enseignants
du cours.

## Product Purpose

Jeu multijoueur inspiré de skribbl.io : un joueur dessine, les autres devinent dans le chat.
Le mode signature, l'Imposteur, fait dessiner tout le monde en secret sur le même mot, sauf un
joueur qui a un mot proche (personne ne sait qui, pas même lui), puis tout le monde vote.
Une partie réussie : on rejoint en quelques secondes, on comprend toujours quoi faire, on rit
devant les dessins.

## Positioning

Le mode Imposteur (dessins simultanés et secrets, puis galerie et vote) n'existe pas dans
skribbl.io : c'est ce qui distingue scrib7.

## Operating Context

- Ordinateur d'abord : dessin à la souris ou au trackpad. Le mobile doit fonctionner (rejoindre,
  deviner, voter, dessiner au doigt) sans être la cible principale.
- Sessions courtes et rythmées : minuteur, manches, choix du mot en 15 s, vote en 60 s.
- Écran de jeu dense : tableau de dessin, outils, liste des joueurs, chat, mot/indice, minuteur.

## Capabilities and Constraints

- Comptes (bcrypt + JWT en cookie httpOnly) et mode invité ; avatar et couvre-chef facultatifs.
- Salles avec code et lien d'invitation, transfert d'hôte, 10 joueurs maximum.
- Dessin SVG 800×600 synchronisé en temps réel par WebSocket : pinceau, gomme, pot de peinture,
  annuler, tout effacer. Le serveur valide toutes les couleurs (`#rrggbb`) et coordonnées.
- Ce que l'un dessine doit être identique pour tous : la gomme peint avec la couleur du fond, le
  pot de peinture part d'un fond uni.
- Mode classique (2 joueurs min.) et mode Imposteur (3 joueurs min.).
- Stack figée : Vue 3, TypeScript, Vite, Pinia, CSS pur ; backend Express 5 + ws + Prisma/SQLite.
  Pas de nouvelle dépendance sans accord.
- Ni tests automatisés, ni i18n : interface en français uniquement.

## Brand Commitments

- Le nom « Scrib7 », avec le 7 mis en avant dans le wordmark.
- Les avatars animaux (`frontend/public/avatars/`) et couvre-chefs (`frontend/public/hats/`)
  restent tels quels.
- Le logo (`frontend/public/logo.svg`) peut être redessiné.

## Evidence on Hand

Aucun témoignage, chiffre d'audience ni partenaire : ne pas en inventer. Les seuls contenus réels
sont les mots du jeu (`backend/src/words.js`) et les dessins des joueurs.

## Product Principles

1. Le jeu d'abord : le mot, le minuteur et le dessin sont toujours lisibles en un coup d'œil.
2. Rejoindre sans friction : un lien ou un code, un pseudo, et on joue.
3. Équité : chacun voit exactement le même dessin et les mêmes informations publiques.
4. Le serveur décide : l'interface n'affiche jamais un secret (mot, imposteur) avant son heure.

## Accessibility & Inclusion

WCAG AA : contraste du texte ≥ 4.5:1 (3:1 pour les grands textes et les bordures d'éléments
interactifs), focus clavier visible, aucune information portée par la seule couleur, animations
coupées sous `prefers-reduced-motion`.
