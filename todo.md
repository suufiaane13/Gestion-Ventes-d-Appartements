Cahier des Charges – Système de Saisie d’Informations Appartements
1. Présentation du projet

Contexte :
Un bureau immobilier souhaite gérer facilement les ventes d’appartements. Les informations doivent être saisies et consultables rapidement, sans serveur ni base de données, et pouvoir être exportées/importées via CSV.

Objectif :
Créer une application web responsive et professionnelle, utilisant TailwindCSS, permettant la saisie, l’affichage, la modification, la suppression et l’export/import des données clients et appartements.

2. Fonctionnalités principales
2.1 Formulaire de saisie

Le formulaire doit permettre de saisir :

Nom

Prénom

Téléphone

Date d’achat

Immeuble - Étages - Numéro d’appartement : (ex: 148-03-41)

Comportement :

Validation des champs obligatoires

Message de confirmation après enregistrement

2.2 Tableau d’affichage

Affiche toutes les ventes enregistrées

Colonnes : Nom, Prénom, Téléphone, Date d’achat, Immeuble - Étages - Numéro d’appartement, Actions

Actions disponibles : Modifier, Supprimer

Tri et recherche par nom, téléphone, immeuble ou date

2.3 Export / Import CSV

Export CSV pour Excel ou sauvegarde

Import CSV pour restaurer les données ou transférer sur un autre PC

Les données sont également stockées localement via LocalStorage pour persistance côté client

2.4 Responsive Design

Adapté PC, tablette et mobile

Layout fluide, boutons et champs adaptés aux petits écrans

3. Design et interface utilisateur
3.1 Couleurs principales

Rouge : #DC2626 (alertes, erreurs)

Vert : #16A34A (succès, confirmations)

Blanc : #FFFFFF (fond, zones de saisie)

3.2 Styles et TailwindCSS

Formulaires : bords arrondis, ombre légère (rounded-lg, shadow-md)

Boutons : grands, contrastés, avec hover (hover:bg-red-700 / hover:bg-green-700)

Tableaux : lignes alternées (odd:bg-gray-50, even:bg-white), responsive (overflow-x-auto)

Alertes/messages : couleurs selon type (bg-red-100 / bg-green-100 avec texte rouge ou vert)

3.3 UX / UI

Interface claire et simple

Boutons d’action visibles et intuitifs

Feedback immédiat après action (enregistrement, suppression, import/export)

Formulaire en haut de la page, tableau en dessous

4. Technologies utilisées

Frontend : HTML, TailwindCSS, JavaScript

Stockage : LocalStorage pour persistance locale

CSV : Export et import côté client avec JavaScript

Responsiveness : TailwindCSS classes (sm:, md:, lg:)

5. Scénario d’utilisation

L’utilisateur ouvre l’application

Saisie des informations dans le formulaire

Validation des champs et message de confirmation en vert

Les données apparaissent automatiquement dans le tableau

L’utilisateur peut modifier ou supprimer une ligne

L’utilisateur peut exporter toutes les données en CSV ou importer un fichier CSV existant

Les données restent persistantes même après fermeture du navigateur grâce à LocalStorage

6. Contraintes

Application entièrement frontend, pas de backend

Compatible avec les navigateurs récents (Chrome, Edge, Firefox)

Interface professionnelle et responsive

Couleurs respectant la charte : rouge, vert, blanc