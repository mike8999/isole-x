# Isole x !

Jeux pour s’entraîner en STI2D.

- **Version 1 (plateau vert)** : https://mike8999.github.io/isole-x/
- **Version 2 (établi / fablab, spécialités)** : https://mike8999.github.io/isole-x/fablab/
- **Atelier STI2D (Isole x ! + Physic’s & Co) — dernière version** : https://mike8999.github.io/isole-x/v3/
  - ancienne version 23 conservée : https://mike8999.github.io/isole-x/repartition-postes-v23/
  - ancienne version 22 conservée : https://mike8999.github.io/isole-x/repartition-postes-v22/
  - ancienne version 21 conservée : https://mike8999.github.io/isole-x/repartition-postes-v21/
  - ancienne version 20 conservée : https://mike8999.github.io/isole-x/repartition-postes-v20/
  - ancienne version 19 conservée : https://mike8999.github.io/isole-x/repartition-postes-v19/
  - ancienne version 18 conservée : https://mike8999.github.io/isole-x/repartition-postes-v18/
  - ancienne version 17 conservée : https://mike8999.github.io/isole-x/repartition-postes-v17/
  - ancienne version 16 conservée : https://mike8999.github.io/isole-x/repartition-postes-v16/
  - ancienne version 15 conservée : https://mike8999.github.io/isole-x/v3-v15/
  - ancienne version 14 conservée : https://mike8999.github.io/isole-x/v3-v14/
  - ancienne version 13 conservée : https://mike8999.github.io/isole-x/v3-v13/
  - ancienne version 12 conservée : https://mike8999.github.io/isole-x/v3-v12/
  - ancienne version 11 conservée : https://mike8999.github.io/isole-x/v3-v11/
  - ancienne version 10 conservée : https://mike8999.github.io/isole-x/v3-v10/
  - ancienne version 9 conservée : https://mike8999.github.io/isole-x/v3-v9/
  - ancienne version 15 conservée : https://mike8999.github.io/isole-x/repartition-postes-v15/
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
- **Moniteur Arduino (valeurs de capteurs en direct : câble USB, Bluetooth HC-05/HC-06 ou Wi-Fi ESP32) — dernière version** : https://mike8999.github.io/isole-x/moniteur-arduino/
  - ancienne version 1 conservée (USB seul) : https://mike8999.github.io/isole-x/moniteur-arduino-v1/
  - Plusieurs voies séparées par `;` (nom facultatif, ex. `Temp:61;Pot:512`), courbe en temps réel, conversion grandeur = a × brut + b (capteurs prédéfinis Uno et ESP32, calcul à deux points), mode démo sans Arduino
  - USB (Chrome ou Edge sur ordinateur) : `moniteur_capteurs.ino` ; Bluetooth (Android avec Chrome 148 ou plus, ou ordinateur) : `moniteur_bluetooth.ino` (Uno + HC-05/HC-06 sur D10/D11)
  - Wi-Fi (tous les téléphones, iPhone compris) : `moniteur_esp32_wifi.ino`, l'ESP32 crée le réseau « Moniteur-ESP32 » et sert la page sur http://192.168.4.1 ; ce programme est fabriqué par `fabriquer_esp32.py` à partir de `index.html` (à relancer après chaque modification de la page)
  - Boîte à idées vers la base Notion (Jeu = Moniteur Arduino)
- **Retour de séance (avis anonyme des élèves en 10 secondes, vers Notion) — dernière version** : https://mike8999.github.io/isole-x/retour-seance/
  - ancienne version 2 conservée : https://mike8999.github.io/isole-x/retour-seance-v2/
  - ancienne version 1 conservée (sans serveur) : https://mike8999.github.io/isole-x/retour-seance-v1/
  - Page professeur (sans paramètre) : cours, type de séance (Cours, TP, TD, Projet, Évaluation), classe, effectif, date → lien et QR code valables seulement ce jour-là
  - Élèves (`?c=…&k=…&t=…&n=…&d=…`) : paires qui s'excluent (Utile/Inutile, Intéressant/Ennuyeux, Clair/Confus, rythme Trop rapide/Adapté/Trop lent, Inutile/Enrichissant, Ennuyeux/Agréable) + Agréable, Enrichissant, Trop difficile ; sans réseau, la réponse attend sur le téléphone et part au retour de la connexion
  - Page Résultats (`?r`, code `PROF_CODE`) : séances, réponses, participation, score moyen, score par type de séance, évolution, barres par critère ; filtres classe et type
  - Serveur : `retour-seance/serveur-apps-script.gs` (Google Apps Script, propriétés `NOTION_TOKEN` et `PROF_CODE`) → base Notion « Retours de séance » ; boîte à idées vers la base Notion (Jeu = Retour de séance)
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
- **Répartition des postes (bénévoles So Caval) — dernière version** : https://mike8999.github.io/isole-x/repartition-postes/
  - ancienne version 8 conservée : https://mike8999.github.io/isole-x/repartition-postes-v8/
  - ancienne version 7 conservée : https://mike8999.github.io/isole-x/repartition-postes-v7/
  - ancienne version 6 conservée : https://mike8999.github.io/isole-x/repartition-postes-v6/
  - ancienne version 5 conservée : https://mike8999.github.io/isole-x/repartition-postes-v5/
  - ancienne version 4 conservée : https://mike8999.github.io/isole-x/repartition-postes-v4/
  - ancienne version 3 conservée : https://mike8999.github.io/isole-x/repartition-postes-v3/
  - ancienne version 2 conservée : https://mike8999.github.io/isole-x/repartition-postes-v2/
  - ancienne version 1 conservée : https://mike8999.github.io/isole-x/repartition-postes-v1/
  - Données partagées : serveur Google Apps Script (`repartition-postes/serveur-apps-script.gs`), adresse dans `repartition-postes/api.js`


Apparence (bouton « Apparence », dans les réglages) : 9 thèmes communs aux trois jeux (établi, jungle, nuit, tableau blanc, contraste élevé gratuits ou propres au jeu ; océan, espace, prestige à débloquer ; « Le labo des SII » gratuit dans l'atelier, « Bonbon » à débloquer dans la Jungle avec les pièces), style du plateau, forme de l'inconnue, couleur des boutons, taille des jetons.

Boîte à idées (💡, sur l'accueil de l'atelier et de la Jungle) : suggestions anonymes (plus pratique, nouvelle idée, bug, autre) envoyées dans la base Notion « Boîte à idées – Isole x ! » par la fonction Netlify `netlify/functions/idees.mjs` (variable d'environnement `NOTION_TOKEN` = clé de l'intégration Notion).

Nouveautés issues de la boîte à idées (fichier `nouveautes.css` + moteur et interface) : dans la pioche, glisser un jeton sur un autre propose **additionner ou multiplier** (x·x = x²) ; jeton **( )** : glisser « ( » devant un terme puis toucher le dernier terme (après un −, les signes s'inversent : −a + b = −(a − b)) ; **déplacer un terme** dans son membre (ou un facteur dans son produit) en le déposant sur un signe ou un bord, sans compter de coup ; outils **1/□, □², √□** toujours dans la pioche, utilisables sur un bloc (refusé avec un contre-exemple si ce n'est pas tout le membre) ; mascotte en haut à droite qui cligne des yeux, se réjouit, fronce les sourcils et encourage. Jungle : compagnon au choix dans les réglages (Pépix, Buzix le chien, Catix la chatte), qui s'endort après 3 jours sans défi réussi. Le compagnon fait de petites scènes au repos, réagit quand on le touche, boude après 2 jours, rétrécit après 7, 14 ou 21 jours d'absence et reprend un niveau toutes les 3 équations résolues.
