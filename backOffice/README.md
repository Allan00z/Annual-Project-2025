# Back Office - Guide d'Installation

## Prérequis

Avant de commencer l'installation, assurez-vous d'avoir les éléments suivants installés sur votre machine :

- **Node.js** : Version 18.x à 22.x
- **npm** : Version 6.0.0 ou supérieure
- **PostgreSQL** : Base de données (version recommandée : 14.x ou supérieure)

## Installation

Suivez ces étapes pour installer et configurer le Back Office :

### 1. Cloner le dépôt

```bash
git clone https://github.com/Allan00z/Annual-Project-2025.git
cd Annual-Project-2025/backOffice
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de la base de données

Créez un fichier `.env` à la racine du dossier backOffice avec les informations de connexion à votre base de données PostgreSQL :

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=

# Base de données
DATABASE_CLIENT=postgres
DATABASE_URL=
DATABASE_SSL=false
JWT_SECRET=

# Google Maps API
GOOGLE_MAPS_API_KEY=

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Exécuter les migrations (si nécessaire)

Si des migrations de base de données sont nécessaires :

```bash
npm run strapi -- database:migrate
```

### 5. Démarrer le serveur en mode développement

```bash
npm run dev
```

L'application sera disponible à l'adresse `http://localhost:1337`.

## Scripts disponibles

- `npm run dev` ou `npm run develop` : Démarre le serveur en mode développement
- `npm run build` : Compile l'application pour la production
- `npm run start` : Démarre l'application en mode production
- `npm run strapi` : Exécute des commandes Strapi
- `npm run upgrade` : Met à jour Strapi vers la dernière version
- `npm run upgrade:dry` : Simule une mise à jour sans l'appliquer

## Plugins installés

- `@amicaldo/strapi-google-maps` : Intégration de Google Maps
- `@strapi/plugin-documentation` : Documentation de l'API accessible via `/documentation`
- `@strapi/plugin-users-permissions` : Gestion des utilisateurs et des permissions
- `@strapi/provider-email-nodemailer` : Envoi d'e-mails via Nodemailer