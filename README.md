# 🏢 Lotissement AL BASSATINE - Système de Gestion Immobilière

Application web moderne et professionnelle pour la gestion des ventes d'appartements du lotissement AL BASSATINE à Ahfir. Développée entièrement en frontend avec une interface responsive et un design élégant.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8)

## ✨ Fonctionnalités

### 📋 Gestion des Ventes (CRUD Complet)
- ✅ **Créer** : Saisie de nouvelles ventes via formulaire modal
- 📖 **Lire** : Affichage paginé de toutes les ventes dans un tableau interactif
- ✏️ **Modifier** : Édition des ventes existantes
- 🗑️ **Supprimer** : Suppression avec confirmation de sécurité

### 🔍 Recherche et Filtres Avancés
- 🔎 Recherche globale en temps réel (nom, prénom, téléphone, immeuble, date)
- 🏢 Filtre par immeuble (dynamique)
- 📅 Filtre par plage de dates (début et fin)
- 🔄 Réinitialisation rapide des filtres
- 📊 Affichage du nombre de filtres actifs

### 📊 Statistiques et Graphiques
- 📈 **Dashboard** avec 4 indicateurs clés :
  - Total des ventes
  - Ventes du mois en cours
  - Ventes de l'année en cours
  - Nombre d'immeubles uniques
- 📉 **Graphiques interactifs** (Chart.js) :
  - Évolution mensuelle des ventes (ligne)
  - Ventes par immeuble (barres)
  - Répartition des ventes (camembert)
- 📄 Page dédiée aux statistiques avec navigation

### 💾 Import/Export de Données
- 📤 **Export Excel (XLS)** : Téléchargement avec colonnes auto-ajustées
- 📥 **Import Excel/CSV** : Importation avec validation et détection automatique du format
- 📄 **Export PDF** : Génération de documents PDF professionnels
- ✅ Vérification des doublons lors de l'import
- 🔒 Validation de l'unicité du champ "Appartement"

### 🎨 Interface Utilisateur
- 🌓 **Mode sombre/clair** : Basculement instantané avec persistance
- 📱 **Design responsive** : Optimisé pour mobile, tablette et desktop
- ⚡ **Skeleton loading** : Animations de chargement professionnelles
- 🔔 **Notifications toast** : Messages élégants et non-intrusifs
- 🎯 **Accessibilité** : Support ARIA, navigation au clavier, focus visible
- 🖱️ **UX optimisée** : Modals, confirmations, feedback visuel

### 📄 Pagination
- 📑 Pagination complète avec contrôle du nombre d'éléments par page
- 🔢 Affichage des informations de pagination
- ⚙️ Options : 10, 20, 50, 100 éléments par page

### 🎯 Validation et Sécurité
- ✅ Validation côté client en temps réel
- 🛡️ Protection contre les injections XSS
- 📝 Validation stricte des formats (téléphone, date, appartement)
- ⚠️ Messages d'erreur contextuels et accessibles
- 🔒 Prévention des doublons

## 🚀 Démarrage Rapide

### Prérequis
- Un navigateur moderne (Chrome, Edge, Firefox, Safari)
- Aucune installation requise (application frontend pure)

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/sadiki-med.git
   cd sadiki-med
   ```

2. **Ouvrir l'application**

   **Option 1 : Serveur local (recommandé)**
   
   Pour éviter les problèmes CORS avec les modules ES6, utilisez un serveur local :
   
   **Python 3 :**
   ```bash
   python server.py
   ```
   Puis ouvrez : `http://localhost:8000`
   
   **Node.js :**
   ```bash
   node server.js
   ```
   Puis ouvrez : `http://localhost:8000`
   
   **Windows (double-clic) :**
   ```bash
   server.bat
   ```
   
   **Option 2 : Directement**
   - Ouvrir `index.html` dans un navigateur moderne
   - ⚠️ Note : Certains navigateurs peuvent bloquer les modules ES6 en mode `file://`

### Utilisation

1. **Ajouter une vente**
   - Cliquer sur "Nouvelle Vente" dans la barre de filtres
   - Remplir le formulaire modal
   - Cliquer sur "Enregistrer"

2. **Rechercher et filtrer**
   - Utiliser la barre de recherche globale
   - Sélectionner un immeuble dans le filtre
   - Définir une plage de dates

3. **Modifier/Supprimer**
   - Cliquer sur "Modifier" ou "Supprimer" dans la colonne Actions
   - Pour la modification, le formulaire modal s'ouvre avec les données pré-remplies

4. **Exporter les données**
   - Cliquer sur "Exporter Excel" pour télécharger un fichier XLS
   - Cliquer sur "Exporter PDF" pour générer un PDF

5. **Importer des données**
   - Cliquer sur "Importer Excel/CSV"
   - Sélectionner un fichier XLS, XLSX ou CSV
   - Les données valides seront ajoutées (doublons vérifiés)

6. **Consulter les statistiques**
   - Cliquer sur "Statistiques" dans la navbar
   - Naviguer entre les différents graphiques via les onglets

## 📁 Structure du Projet

```
sadiki-med/
├── index.html              # Page principale (gestion des ventes)
├── statistiques.html       # Page des statistiques et graphiques
├── logo.png                # Logo du projet
│
├── js/
│   ├── app.js              # Logique principale de l'application
│   ├── storage.js          # Gestion du LocalStorage
│   ├── csv.js              # Import/Export Excel/CSV
│   ├── pdf.js              # Génération de PDF
│   ├── stats.js            # Calcul des statistiques
│   ├── charts.js           # Gestion des graphiques Chart.js
│   └── statistiques.js     # Logique de la page statistiques
│
├── server.py               # Serveur HTTP Python (pour développement)
├── server.js               # Serveur HTTP Node.js (pour développement)
├── server.bat              # Script Windows pour lancer le serveur
├── LIRE_MOI_SERVEUR.md     # Instructions pour le serveur local
│
├── todo.md                 # Cahier des charges
└── README.md               # Documentation (ce fichier)
```

## 🛠️ Technologies Utilisées

- **HTML5** : Structure sémantique et accessible
- **TailwindCSS 3.0** : Framework CSS utilitaire (via CDN)
- **JavaScript ES6+** : Modules ES6, classes, async/await
- **Chart.js 4.4.0** : Graphiques interactifs et responsives
- **jsPDF** : Génération de documents PDF
- **LocalStorage API** : Persistance des données côté client
- **File API** : Gestion des fichiers (import/export)

## 📋 Champs du Formulaire

| Champ | Type | Requis | Format | Description |
|-------|------|--------|--------|-------------|
| Nom | Texte | ✅ | - | Nom du client |
| Prénom | Texte | ✅ | - | Prénom du client |
| Téléphone | Tel | ✅ | 10 chiffres | Numéro de téléphone |
| Date d'achat | Date | ✅ | YYYY-MM-DD | Date de l'achat (pas de date future) |
| Appartement | Texte | ✅ | XXX-XX-XX | Format : Immeuble-Étage-Numéro (ex: 148-03-41) |

## 📊 Format des Fichiers

### Export Excel (XLS)
- Format HTML table avec métadonnées Excel
- Colonnes automatiquement ajustées à la largeur du contenu
- Compatible avec Microsoft Excel, LibreOffice, Google Sheets

### Import Excel/CSV
- Formats supportés : `.xls`, `.xlsx`, `.csv`
- Détection automatique du format
- Validation des données et vérification des doublons
- Colonnes attendues : `Nom`, `Prénom`, `Téléphone`, `Date d'achat`, `Appartement`

### Export PDF
- Document professionnel avec toutes les données
- Mise en page optimisée pour l'impression
- En-tête avec logo et informations du lotissement

## 🎨 Personnalisation

### Couleurs Principales
- **Rouge** : `#DC2626` - Actions principales, erreurs
- **Vert** : `#16A34A` - Succès, confirmations
- **Bleu** : `#2563EB` - Informations, liens
- **Jaune** : `#CA8A04` - Avertissements

### Mode Sombre
Le mode sombre est automatiquement appliqué selon la préférence de l'utilisateur et persiste entre les sessions.

## 🔒 Sécurité et Confidentialité

- ✅ Validation stricte des données côté client
- ✅ Protection contre les injections XSS (échappement HTML)
- ✅ Validation des formats (téléphone, date, appartement)
- ✅ Vérification de l'unicité des appartements
- ⚠️ **Note** : Les données sont stockées localement dans le navigateur (LocalStorage)
- ⚠️ **Recommandation** : Pour un usage professionnel, envisager un backend sécurisé

## 📱 Compatibilité Navigateurs

| Navigateur | Version minimale | Statut |
|------------|------------------|--------|
| Chrome | 90+ | ✅ Testé |
| Edge | 90+ | ✅ Testé |
| Firefox | 88+ | ✅ Testé |
| Safari | 14+ | ✅ Testé |
| Chrome Mobile | 90+ | ✅ Testé |
| Safari iOS | 14+ | ✅ Testé |

## ⚠️ Limitations

- **LocalStorage** : Limite de stockage ~5-10MB selon le navigateur
- **Pas de backend** : Toutes les données sont stockées localement
- **Pas de synchronisation** : Les données ne sont pas partagées entre appareils
- **Pas de sauvegarde cloud** : Recommandation d'exporter régulièrement les données

## 🐛 Dépannage

### Les données ne s'enregistrent pas
- Vérifier que le navigateur autorise le LocalStorage
- Vérifier l'espace de stockage disponible
- Vider le cache et réessayer

### L'import échoue
- Vérifier le format du fichier (XLS, XLSX ou CSV)
- Vérifier que les colonnes sont dans l'ordre : Nom, Prénom, Téléphone, Date d'achat, Appartement
- Vérifier que les données respectent les formats requis
- Consulter les messages d'erreur affichés dans les notifications toast

### Le design ne s'affiche pas correctement
- Vérifier la connexion internet (TailwindCSS via CDN)
- Vider le cache du navigateur
- Vérifier que JavaScript est activé

### Erreur CORS lors de l'ouverture directe
- Utiliser un serveur local (voir section Installation)
- Les modules ES6 nécessitent un serveur HTTP

### Le mode sombre ne persiste pas
- Vérifier que le navigateur autorise le LocalStorage
- Vider le cache et réessayer

## 📝 Changelog

### Version 1.0.0 (Actuelle)
- ✨ Gestion complète des ventes (CRUD)
- ✨ Recherche et filtres avancés
- ✨ Statistiques et graphiques interactifs
- ✨ Import/Export Excel et PDF
- ✨ Mode sombre/clair avec persistance
- ✨ Skeleton loading animations
- ✨ Notifications toast
- ✨ Pagination complète
- ✨ Design responsive et accessible
- ✨ Validation et sécurité renforcées

## 🤝 Contribution

Ce projet est développé pour un usage spécifique. Pour toute suggestion ou amélioration, veuillez ouvrir une issue sur GitHub.

## 📄 Licence

Proprietary - Tous droits réservés

Développé pour le **Lotissement AL BASSATINE, Ahfir**

## 👤 Auteur

**Mohammed SADIKI**
- 📞 Téléphone : +212 6 23 40 32 45

## 🙏 Remerciements

- [TailwindCSS](https://tailwindcss.com/) pour le framework CSS
- [Chart.js](https://www.chartjs.org/) pour les graphiques
- [jsPDF](https://github.com/parallax/jsPDF) pour la génération PDF

---

⭐ Si ce projet vous est utile, n'hésitez pas à lui donner une étoile sur GitHub !
