# 🎲 Monopoly GO! Tracker

🇬🇧 [English](https://github.com/Kevinr99089/Mgo-Tracker/blob/main/README.md) | 🇫🇷 [Français](https://github.com/Kevinr99089/Mgo-Tracker/blob/main/READMEfr.md)

[![Démo en direct](https://img.shields.io/badge/D%C3%A9mo%20en%20direct-Jouer%20maintenant-success?style=for-the-badge)](https://kevinr99089.github.io/Mgo-Tracker/)
[![Version](https://img.shields.io/badge/Version-4.07.2-6366f1?style=for-the-badge)](https://github.com/Kevinr99089/Mgo-Tracker)

Une application web élégante, rapide et fonctionnant entièrement côté navigateur, conçue pour aider les joueurs de Monopoly GO! à suivre leurs albums d'autocollants, gérer plusieurs comptes et organiser leurs échanges sans effort.

👉 **[Accéder au Tracker Ici](https://kevinr99089.github.io/Mgo-Tracker/)**

---

## ✨ Fonctionnalités

* **Support Multijoueur :** Suivez les albums de votre compte principal et de vos comptes secondaires (ou de vos amis) au même endroit.
* **Système de Tableau Intelligent :** Basculez entre un suivi d'état visuel et un mode permettant de compter exactement le nombre de doublons.
* **Configuration des Cartes en Or :** Définissez quelles sont les cartes en Or (Gold) de la saison en cours.
* **Registre d'Échanges Or :** Gardez une trace écrite de vos échanges de cartes en Or.
* **Interface Bilingue :** S'adapte automatiquement en anglais ou en français selon la langue de votre système ou de votre navigateur.
* **Ambiance Personnalisable :** Choisissez parmi quatre fonds animés, dont un mode secret rare.
* **Prêt pour l'Impression :** Mise en page épurée avec sélection des joueurs à inclure, pour imprimer facilement la liste des autocollants manquants.
* **Annuler :** Revenez instantanément sur votre dernière modification via le bouton Annuler dans le dock.

---

## 📖 Comment ça marche : Le Tableau

L'application s'articule autour de "Cartes en verre" (Glass Cards) pour chaque joueur, contenant des grilles qui représentent les albums du jeu. Chaque saison peut être configurée avec **21 à 26 albums**, contenant chacun 9 autocollants (grille 3×3).

### États des cartes
En cliquant sur une case, vous pouvez alterner entre 3 états pour suivre votre collection :
1. **Vide / Sombre :** Vous n'avez pas cet autocollant.
2. **Bleu (Plein) :** Vous possédez exactement un exemplaire de cet autocollant.
3. **Rouge (Croix) :** Vous avez des doublons de cet autocollant et pouvez l'échanger.

### Joueur Principal vs Joueurs Secondaires
* **Joueur Principal (1er de la liste) :** Le premier joueur de votre liste bénéficie de fonctionnalités premium. Il a accès à un **"Mode Chiffres"** (activable via le bouton '123') qui permet de taper le *nombre exact* de doublons possédés au lieu d'une simple croix rouge. Il dispose également d'un champ **Note** dédié.
* **Joueurs Secondaires :** Disposent d'un suivi visuel standard (Manquant / Possédé / Doublon) pour voir d'un simple coup d'œil ce dont les comptes secondaires ou amis ont besoin.
* *Note : Vous pouvez réorganiser les joueurs dynamiquement dans le menu "Gérer les joueurs". Si vous changez le joueur principal, les chiffres exacts seront effacés pour éviter les erreurs, mais les croix rouges resteront intactes.*

### Cartes en Or
Les cartes en Or sont indiquées par une bordure dorée brillante. Vous pouvez configurer les cartes en Or de votre saison lors de l'assistant de configuration initial, ou à tout moment via le bouton "Configurer Or" situé dans le dock en bas de l'écran.

---

## 🎨 Modes d'Ambiance

Le tracker propose quatre modes d'arrière-plan animés, accessibles depuis le dock :

| Mode | Description |
|------|-------------|
| 🔵 Orbes Cosmiques | Orbes en dégradé flottant doucement |
| 🃏 Cartes Flottantes | Silhouettes de cartes animées qui dérivent à l'écran |
| 🟣 Cadres Néons | Rectangles néon clignotants, certains avec un effet de lumière mourante réaliste |
| ✨ Spécial | Un mode Shiny secret — apparaît avec 1% de chance à chaque cycle. Estimez-vous chanceux ! |

---

## 💾 Comment les données sont stockées (Confidentialité)

**Vos données sont 100% privées et restent sur votre appareil.** Cette application utilise le **Stockage Local (Local Storage)** de votre navigateur pour sauvegarder toutes vos configurations, les noms des joueurs et l'état des tableaux.
* **Pas de base de données :** Il n'y a aucun serveur backend ni base de données cloud.
* **Pas de pistage (tracking) :** Nous ne collectons, ne traitons, ni ne voyons vos données.

### Sauvegardes et Synchronisation Multi-Appareils
Puisque les données sont stockées localement dans votre navigateur, elles ne se synchroniseront pas automatiquement entre vos appareils. L'application propose deux façons de transférer vos données :

**Sauvegarde complète (tous les tableaux) :**
1. Ouvrez le Menu et cliquez sur **Sauver vers un fichier**. Cela télécharge un fichier `.json` contenant les tableaux de tous les joueurs ainsi que l'ensemble de vos réglages.
2. Envoyez ce fichier sur votre autre appareil (par e-mail, Discord, câble, etc.).
3. Sur le nouvel appareil, ouvrez l'application, cliquez sur **Charger** dans le menu, et sélectionnez le fichier `.json` pour restaurer votre configuration exacte.

**Partage d'un tableau (un seul tableau, via un lien) :**
L'application permet également de partager le tableau d'un joueur précis via un simple lien, sans aucun fichier à manipuler.
1. Ouvrez le Menu et cliquez sur **Partager un tableau**.
2. Sélectionnez le joueur dont vous souhaitez partager le tableau.
3. Un lien unique est généré instantanément. Copiez-le et envoyez-le à qui vous voulez (WhatsApp, Discord, SMS, e-mail — tout fonctionne).
4. Quand le destinataire ouvre le lien, l'application détecte automatiquement le tableau partagé et affiche une **fenêtre d'import**, lui permettant de l'ajouter à son propre tracker en un seul clic.

> Particulièrement pratique pour se coordonner avec des amis, gérer des comptes secondaires depuis l'appareil de quelqu'un d'autre, ou synchroniser rapidement un seul tableau sans partager l'intégralité de votre sauvegarde.

> **⚠️ À savoir :** Le lien est une photo de votre tableau au moment où vous l'avez partagé — il ne se met pas à jour tout seul. Si vous modifiez votre tableau par la suite et voulez que l'autre personne ait la version à jour, il suffit de repartager un nouveau lien.

---

## 🔒 Sécurité

* **Protection XSS :** Toutes les saisies utilisateur (noms de joueurs, notes) sont échappées en HTML avant d'être insérées dans la page, empêchant toute injection malveillante.
* **Aucun script externe :** Le fichier est 100% autonome — aucun appel CDN, aucun code tiers chargé à l'exécution.
* **Les actions destructives sont doublement confirmées :** Une réinitialisation complète nécessite deux dialogues de confirmation distincts avant qu'une donnée soit effacée.

---

## 🛠️ Construit avec
* HTML5 pur
* CSS3 (Propriétés personnalisées, Glassmorphism, Animations, Media Queries d'impression)
* Vanilla JavaScript (Aucun framework, totalement autonome)

---

*Avertissement : Ce projet est un outil non officiel créé par un fan et n'est ni affilié, ni approuvé, ni sponsorisé par Scopely ou Monopoly GO!*
