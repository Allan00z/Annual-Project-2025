import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos Revendeurs | Créations Artisanales',
  description: 'Découvrez les lieux physiques où vous pouvez retrouver nos créations artisanales. Trouvez le revendeur le plus proche de chez vous.',
  keywords: ['revendeurs', 'magasins', 'créations artisanales', 'lieux de vente', 'boutiques partenaires'],
};

import type { Reseller } from "../../models/resseler";
import ResellerCard from "../../component/reseller-card.component";
import { checkUserRole } from "../../app/services/auth.server-side.services";
import Link from "next/link";

function ResellerCardWithAdmin({ reseller, isOwner }: { reseller: Reseller; isOwner: boolean }) {
  return (
    <div className="relative">
      <ResellerCard reseller={reseller} />
      {isOwner && (
        <div className="absolute top-4 right-4 flex gap-2">
          <Link
            href={`/reseller/edit/${reseller.documentId}`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
            title="Modifier le revendeur"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </Link>
          <Link
            href={`/reseller/delete/${reseller.documentId}`}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
            title="Supprimer le revendeur"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

interface ApiResponse {
  data: Reseller[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Get the resellers data from the API
 * @returns {Promise<Reseller[]>} Les données des revendeurs
 * @throws {Error} Si la requête échoue
 */
async function getResellersData(): Promise<Reseller[]> {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  try {
    const res = await fetch(`${STRAPI_URL}/api/resellers/?populate=*`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch resellers data");
    }

    const data: ApiResponse = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching resellers data:", error);
    throw error;
  }
}

export default async function Reseller() {
  const resellers = await getResellersData();
  const isOwner = await checkUserRole('owner');

  return (
    <section className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto py-16 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Nos Revendeurs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Découvrez les lieux physiques où vous pouvez retrouver nos créations artisanales. 
            Chaque revendeur a été soigneusement sélectionné pour partager nos valeurs d'authenticité et de qualité.
          </p>
          
          {isOwner && (
            <div className="mt-8">
              <Link 
                href="/reseller/add" 
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Ajouter un revendeur
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {resellers.map((reseller) => (
            <ResellerCardWithAdmin key={reseller.id} reseller={reseller} isOwner={isOwner} />
          ))}
        </div>

        {resellers.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg 
                className="w-16 h-16 mx-auto text-gray-400 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucun revendeur disponible
              </h3>
              <p className="text-gray-500">
                Nous travaillons activement pour étendre notre réseau de revendeurs. 
                Revenez bientôt pour découvrir de nouveaux partenaires !
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t">
        <div className="container mx-auto py-16 px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Vous souhaitez devenir revendeur ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez notre réseau de partenaires et proposez nos créations artisanales 
            dans votre boutique. Contactez-nous pour en savoir plus.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </section>
  );
}
