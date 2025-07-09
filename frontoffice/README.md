# Front Office - Guide d'Installation

Ce projet est une application [Next.js](https://nextjs.org) créée avec [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prérequis

Avant de commencer l'installation, assurez-vous d'avoir les éléments suivants installés sur votre machine :

- **Node.js** : Version 18.x à 22.x
- **npm** : Version 6.0.0 ou supérieure
- **Back Office** : Le serveur Strapi doit être démarré et accessible

## Installation

Suivez ces étapes pour installer et configurer le Front Office :

### 1. Cloner le dépôt

```bash
git clone https://github.com/Allan00z/Annual-Project-2025.git
cd Annual-Project-2025/frontoffice
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env.local` à la racine du dossier frontoffice avec le contenu suivant :

```env
# Configuration Gmail SMTP
GMAIL_USER=
GMAIL_PASSWORD=

# Clés Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRAPI_URL=http://localhost:1338
```

### 4. Démarrer le serveur en mode développement

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

L'application sera disponible à l'adresse `http://localhost:3000`.

## Scripts disponibles

- `npm run dev` : Démarre le serveur en mode développement
- `npm run build` : Compile l'application pour la production
- `npm run start` : Démarre l'application en mode production
- `npm run lint` : Vérifie la qualité du code avec ESLint
- `npm run type-check` : Vérifie les types TypeScript

## Technologies utilisées

- **Framework** : Next.js 15.x avec App Router
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Paiement** : Stripe
- **Email** : Nodemailer avec Gmail SMTP
- **API** : Intégration avec Strapi (Back Office)

## Déploiement

Pour déployer l'application en production :

1. Compilez l'application :
```bash
npm run build
```

2. Démarrez l'application :
```bash
npm run start
```

## Support

Pour plus d'informations sur Next.js, consultez :
- [Documentation Next.js](https://nextjs.org/docs)
- [Tutoriel interactif Next.js](https://nextjs.org/learn)