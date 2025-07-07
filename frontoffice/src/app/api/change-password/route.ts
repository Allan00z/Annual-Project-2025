import { NextRequest, NextResponse } from 'next/server';
import { checkOrigin, checkAuth } from '@/app/api/middleware/auth.middleware';

export async function POST(request: NextRequest) {
  if (!checkOrigin(request)) {
    return NextResponse.json(
      { error: 'Origine non autorisée' },
      { status: 403 }
    );
  }

  const isAuthenticated = await checkAuth(request);
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { currentPassword, password, passwordConfirmation } = body;

    // Validation des paramètres
    if (!currentPassword || !password || !passwordConfirmation) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (password !== passwordConfirmation) {
      return NextResponse.json(
        { error: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }

    // Récupération du token JWT depuis les cookies
    const jwt = request.cookies.get('jwt')?.value;
    if (!jwt) {
      return NextResponse.json(
        { error: 'Token JWT manquant' },
        { status: 401 }
      );
    }

    // Appel à l'API Strapi pour changer le mot de passe
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const response = await fetch(`${STRAPI_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        currentPassword,
        password,
        passwordConfirmation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Erreur lors du changement du mot de passe' },
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mot de passe changé avec succès',
      jwt: data.jwt,
      user: data.user 
    });

  } catch (error: any) {
    console.error('Erreur lors du changement du mot de passe:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
