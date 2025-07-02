import { cookies } from 'next/headers';

/**
 * Check if the user has a specific role
 * @param roleType - The type of role to check (owner, etc.)
 * @returns Promise that resolves to true if the user has the role, false otherwise
 */
export async function checkUserRole(roleType: string | null = null): Promise<boolean> {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt')?.value;
    
    if (!jwt) {
      return false;
    }

    const response = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des informations utilisateur: ${response.status}`);
    }

    const userData = await response.json();
    return roleType ? userData.role?.type === roleType : true;
  } catch (error) {
    console.error("Erreur lors de la vérification du rôle utilisateur:", error);
    return false;
  }
}
