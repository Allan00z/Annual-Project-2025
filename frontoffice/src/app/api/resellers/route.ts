import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt')?.value;

    if (!jwt) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userData = await userResponse.json();
    if (userData.role?.type !== 'owner') {
      return NextResponse.json({ error: 'Accès refusé - droits insuffisants' }, { status: 403 });
    }

    const formData = await request.formData();
    const data = formData.get('data') as string;

    if (!data) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (parseError) {
      console.error('Erreur lors du parsing des données:', parseError);
      return NextResponse.json({ error: 'Format de données invalide' }, { status: 400 });
    }

    const response = await fetch(`${STRAPI_URL}/api/resellers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: parsedData
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erreur Strapi (${response.status}):`, errorBody);
      throw new Error(`Erreur lors de la création du revendeur: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erreur lors de la création du revendeur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
