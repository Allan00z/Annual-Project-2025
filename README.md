# Annual Project 2025 - Audeleweiss

**Audeleweiss** est un projet de e-commerce complet qui comprend un back office basé sur Strapi pour la gestion du contenu et un front office développé avec Next.js pour l'interface utilisateur. 

## 🏗️ Architecture du projet

Ce projet est composé de deux applications principales :

```
Annual-Project-2025/
├── backOffice/          # API Strapi (Back Office)
│   ├── src/
│   ├── config/
│   ├── database/
│   └── README.md
├── frontoffice/         # Application Next.js (Front Office)
│   ├── src/
│   ├── public/
│   └── README.md
└── README.md           # Ce fichier
```

### 🖥️ Back Office - API Strapi
- **Framework** : Strapi 5.x
- **Base de données** : PostgreSQL
- **Port** : 1337
- **Fonction** : Gestion du contenu, API REST, panneau d'administration

### 🌐 Front Office - Application Next.js
- **Framework** : Next.js 15.x avec App Router
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Port** : 3000
- **Fonction** : Interface utilisateur, boutique en ligne

## 🚀 Installation rapide

### Prérequis

Assurez-vous d'avoir installé :

- **Node.js** : Version 18.x à 22.x
- **npm** : Version 6.0.0 ou supérieure
- **PostgreSQL** : Version 14.x ou supérieure

### Installation complète

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Allan00z/Annual-Project-2025.git
   cd Annual-Project-2025
   ```

2. **Installer les dépendances pour les deux applications**
   ```bash
   # Back Office
   cd backOffice
   npm install
   
   # Front Office
   cd ../frontoffice
   npm install
   ```

3. **Configuration des variables d'environnement**

   **Back Office** - Créer `backOffice/.env` :
   ```env
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=your-app-keys
   API_TOKEN_SALT=your-api-token-salt
   ADMIN_JWT_SECRET=your-admin-jwt-secret
   TRANSFER_TOKEN_SALT=your-transfer-token-salt
   
   # Base de données
   DATABASE_CLIENT=postgres
   DATABASE_URL=postgresql://username:password@localhost:5432/your-database
   DATABASE_SSL=false
   JWT_SECRET=your-jwt-secret
   
   # Google Maps API
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   
   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

   **Front Office** - Créer `frontoffice/.env.local` :
   ```env
   # Configuration Gmail SMTP
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=your-app-password
   
   # Clés Stripe
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
   
   # URL de l'application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   STRAPI_URL=http://localhost:1337
   ```

4. **Démarrer les applications**

   **Terminal 1 - Back Office** :
   ```bash
   cd backOffice
   npm run dev
   ```

   **Terminal 2 - Front Office** :
   ```bash
   cd frontoffice
   npm run dev
   ```

## 🌟 Fonctionnalités principales

### Back Office (Admin Panel)
- ✅ Gestion des produits et catégories
- ✅ Gestion des commandes
- ✅ Gestion des utilisateurs et permissions
- ✅ Gestion du contenu (articles, pages)
- ✅ Système de commentaires et avis
- ✅ Configuration des livraisons
- ✅ Gestion des remises et promotions
- ✅ Intégration Google Maps
- ✅ Documentation API auto-générée

### Front Office (Boutique)
- ✅ Catalogue de produits avec filtres
- ✅ Panier d'achat
- ✅ Système de paiement Stripe
- ✅ Gestion des comptes utilisateur
- ✅ Processus de commande complet
- ✅ Blog et pages de contenu
- ✅ Interface responsive et moderne
- ✅ Système de contact et FAQ

## 🔧 Technologies utilisées

### Back Office
- **Strapi 5.x** - Headless CMS
- **PostgreSQL** - Base de données
- **Nodemailer** - Envoi d'emails
- **Google Maps API** - Géolocalisation
- **React** - Interface d'administration

### Front Office
- **Next.js 15.x** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Stripe** - Paiements en ligne
- **Radix UI** - Composants accessibles
- **Lucide React** - Icônes

## 🌐 URLs d'accès

Une fois les applications démarrées :

- **Front Office** : http://localhost:3000
- **Back Office Admin** : http://localhost:1337/admin
- **API Documentation** : http://localhost:1337/documentation

## 📚 Documentation détaillée

Pour des instructions d'installation :

- [Back Office README](./backOffice/README.md)
- [Front Office README](./frontoffice/README.md)

## 🛠️ Scripts disponibles

### Back Office
```bash
npm run dev      # Démarrage en développement
npm run build    # Compilation pour production
npm run start    # Démarrage en production
npm run strapi   # Commandes Strapi
```

### Front Office
```bash
npm run dev      # Démarrage en développement
npm run build    # Compilation pour production
npm run start    # Démarrage en production
npm run lint     # Vérification du code
```

## 🚀 Déploiement

### Production
1. Compiler les deux applications :
   ```bash
   # Back Office
   cd backOffice && npm run build
   
   # Front Office
   cd frontoffice && npm run build
   ```

2. Démarrer en production :
   ```bash
   # Back Office
   cd backOffice && npm run start
   
   # Front Office
   cd frontoffice && npm run start
   ```