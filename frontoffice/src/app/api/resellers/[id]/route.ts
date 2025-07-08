import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Route to handle the modification of a reseller in Strapi.
 * This route checks if the user is authenticated and has the 'owner' role before allowing modifications or deletions.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
  
    const response = await fetch(`${STRAPI_URL}/api/resellers/${params.id}`, {
      method: 'PUT',
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
      console.error(`Erreur Strapi lors de la modification (${response.status}):`, errorBody);
      throw new Error(`Erreur lors de la modification du revendeur: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erreur lors de la modification du revendeur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * Route to handle the deletion of a reseller in Strapi.
 * This route checks if the user is authenticated and has the 'owner' role before allowing deletion.
 */
export async function DELETE(
  { params }: { params: { id: string } }
) {
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

    const response = await fetch(`${STRAPI_URL}/api/resellers/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erreur Strapi lors de la suppression (${response.status}):`, errorBody);
      throw new Error(`Erreur lors de la suppression du revendeur: ${response.status} - ${errorBody}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de la suppression du revendeur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
