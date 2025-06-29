This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## .env.local

Create a `.env.local` file in the root of the project with the following content:

```env
# Configuration Gmail SMTP
GMAIL_USER=
GMAIL_PASSWORD=

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRAPI_URL=http://localhost:1338
```