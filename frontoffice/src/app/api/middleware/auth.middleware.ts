import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Authentification middleware for Next.js API routes.
 */
export async function middleware(request: NextRequest) {
  // Check if the request is from an allowed origin
  if (!checkOrigin(request)) {
    return NextResponse.json({ error: 'Requête non autorisée (origin)' }, { status: 403 });
  }

  // Check if the request is authenticated 
  const isAuthenticated = await checkAuth(request);
  if (!isAuthenticated) {
    return NextResponse.redirect(`${APP_URL}/login`);
  }

  return NextResponse.next();
}

/**
 * Checks if the request comes from an allowed origin.
 */
export const checkOrigin = (request: NextRequest) => {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (!APP_URL) {
    console.error('NEXT_PUBLIC_APP_URL non défini');
    return false;
  }

  if (process.env.NODE_ENV === 'development') {
    if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
      return true;
    }
  }

  if ((origin && origin === APP_URL) || (referer && referer.startsWith(APP_URL))) {
    return true;
  }

  return false;
};

/**
 * Checks if the request is authenticated.
 */
export const checkAuth = async (request: NextRequest): Promise<boolean> => {
  const token =
    request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
    request.cookies.get('session')?.value;

  return token ? await validateToken(token) : false;
};

/**
 * Validates a JWT token by making a request to the Strapi API.
 */
const validateToken = async (token: string): Promise<boolean> => {
  try {
    const res = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.ok;
  } catch (err) {
    console.error('Erreur de validation du token :', err);
    return false;
  }
};
