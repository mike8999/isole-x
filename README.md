# Isole x !

Jeux pour s’entraîner en STI2D.

- **Version 1 (plateau vert)** : https://mike8999.github.io/isole-x/
- **Version 2 (établi / fablab, spécialités)** : https://mike8999.github.io/isole-x/fablab/
- **Atelier STI2D (Isole x ! + Physic’s & Co) — dernière version** : https://mike8999.github.io/isole-x/v3/
  - ancienne version 15 conservée : https://mike8999.github.io/isole-x/v3-v15/
  - ancienne version 14 conservée : https://mike8999.github.io/isole-x/v3-v14/
  - ancienne version 13 conservée : https://mike8999.github.io/isole-x/v3-v13/
  - ancienne version 12 conservée : https://mike8999.github.io/isole-x/v3-v12/
  - ancienne version 11 conservée : https://mike8999.github.io/isole-x/v3-v11/
  - ancienne version 10 conservée : https://mike8999.github.io/isole-x/v3-v10/
  - ancienne version 9 conservée : https://mike8999.github.io/isole-x/v3-v9/
  - ancienne version 8 conservée : https://mike8999.github.io/isole-x/v3-v8/
  - ancienne version 7 conservée : https://mike8999.github.io/isole-x/v3-v7/
  - ancienne version 6 conservée : https://mike8999.github.io/isole-x/v3-v6/
  - ancienne version 5 conservée : https://mike8999.github.io/isole-x/v3-v5/
  - ancienne version 4 conservée : https://mike8999.github.io/isole-x/v3-v4/
  - ancienne version 3 conservée : https://mike8999.github.io/isole-x/v3-v3/
  - ancienne version 2 conservée : https://mike8999.github.io/isole-x/v3-v2/
  - ancienne version 1 conservée : https://mike8999.github.io/isole-x/v3-v1/
  - Isole x ! : 12 chapitres (dont « Expert », 10 défis difficiles) (5 défis pour addition et multiplication, 10 ensuite, avec une vraie progression et un défi ultime difficile) : formules de spécialité SI, SIN, ITEC, EE, AC, problèmes SI ou STI2D selon la spécialité, inéquations, robot Volt, badges, défi chrono, défi du jour, boutique, code de sauvegarde, hors ligne, fonctions, complexes, résultat précis, coups bonus, entraînement ciblé, mode expérimental, tutoriel et aide animés
  - Physic’s & Co : bloc chimie, 40 équations à équilibrer (combustions, oxydoréduction, acides-bases, matériaux et énergie)
- **Neon Rush STI2D (révisions : quiz terminal, flashcards, schémas animés à compléter) — dernière version** : https://mike8999.github.io/isole-x/neon-rush/
  - ancienne version 1 conservée : https://mike8999.github.io/isole-x/neon-rush-v1/
  - Mode professeur (code dans la variable Netlify `NEON_PROF_CODE`) : édition de toutes les questions, cartes, fiches et schémas, enregistrées en ligne (fonction `neon-contenu`, Netlify Blobs) et vues par les élèves au chargement suivant
  - Schémas en glisser-déposer : circuit DEL, poutre sur deux appuis, chaîne de puissance, chaîne d'information, chaîne cinématique pignon-crémaillère
  - Boîte à idées vers la base Notion (Jeu = Neon Rush STI2D)
- **Isole x ! Jungle, collège / seconde — dernière version** : https://mike8999.github.io/isole-x/college/
  - ancienne version 16 conservée : https://mike8999.github.io/isole-x/college-v16/
  - ancienne version 15 conservée : https://mike8999.github.io/isole-x/college-v15/
  - ancienne version 14 conservée : https://mike8999.github.io/isole-x/college-v14/
  - ancienne version 13 conservée : https://mike8999.github.io/isole-x/college-v13/
  - ancienne version 12 conservée : https://mike8999.github.io/isole-x/college-v12/
  - ancienne version 11 conservée : https://mike8999.github.io/isole-x/college-v11/
  - ancienne version 10 conservée : https://mike8999.github.io/isole-x/college-v10/
  - ancienne version 9 conservée : https://mike8999.github.io/isole-x/college-v9/
  - ancienne version 8 conservée : https://mike8999.github.io/isole-x/college-v8/
  - ancienne version 7 conservée : https://mike8999.github.io/isole-x/college-v7/
  - ancienne version 6 conservée : https://mike8999.github.io/isole-x/college-v6/
  - ancienne version 5 conservée : https://mike8999.github.io/isole-x/college-v5/
  - ancienne version 4 conservée : https://mike8999.github.io/isole-x/college-v4/
  - ancienne version 3 conservée : https://mike8999.github.io/isole-x/college-v3/
  - ancienne version 2 conservée : https://mike8999.github.io/isole-x/college-v2/
  - ancienne version 1 conservée : https://mike8999.github.io/isole-x/college-v1/


Apparence (bouton « Apparence », dans les réglages) : 9 thèmes communs aux trois jeux (établi, jungle, nuit, tableau blanc, contraste élevé gratuits ou propres au jeu ; océan, espace, prestige à débloquer ; « Le labo des SII » gratuit dans l'atelier, « Bonbon » à débloquer dans la Jungle avec les pièces), style du plateau, forme de l'inconnue, couleur des boutons, taille des jetons.

Boîte à idées (💡, sur l'accueil de l'atelier et de la Jungle) : suggestions anonymes (plus pratique, nouvelle idée, bug, autre) envoyées dans la base Notion « Boîte à idées – Isole x ! » par la fonction Netlify `netlify/functions/idees.mjs` (variable d'environnement `NOTION_TOKEN` = clé de l'intégration Notion).

Nouveautés issues de la boîte à idées (fichier `nouveautes.css` + moteur et interface) : dans la pioche, glisser un jeton sur un autre propose **additionner ou multiplier** (x·x = x²) ; jeton **( )** : glisser « ( » devant un terme puis toucher le dernier terme (après un −, les signes s'inversent : −a + b = −(a − b)) ; **déplacer un terme** dans son membre (ou un facteur dans son produit) en le déposant sur un signe ou un bord, sans compter de coup ; outils **1/□, □², √□** toujours dans la pioche, utilisables sur un bloc (refusé avec un contre-exemple si ce n'est pas tout le membre) ; mascotte en haut à droite qui cligne des yeux, se réjouit, fronce les sourcils et encourage. Jungle : compagnon au choix dans les réglages (Pépix, Buzix le chien, Catix la chatte), qui s'endort après 3 jours sans défi réussi.
