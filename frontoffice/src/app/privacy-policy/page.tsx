import React from 'react';
import { notFound } from 'next/navigation';

// Interface pour les données de la politique de confidentialité
interface PrivacyPolicySection {
  id: number;
  documentId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  order: number;
}

interface PrivacyPolicyData {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  sections: PrivacyPolicySection[];
}

interface PrivacyPolicyResponse {
  data: PrivacyPolicyData;
  meta: {};
}

// Fonction pour récupérer les données de la politique de confidentialité
async function getPrivacyPolicyData(): Promise<PrivacyPolicyResponse | null> {
  try {
    const response = await fetch('http://localhost:1338/api/privacy-policy?populate=*', {
      next: { revalidate: 3600 }, // Cache pendant 1 heure
    });

    if (!response.ok) {
      throw new Error('Failed to fetch privacy policy data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching privacy policy data:', error);
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  const privacyPolicyData = await getPrivacyPolicyData();

  if (!privacyPolicyData) {
    notFound();
  }

  const { sections } = privacyPolicyData.data;

  // Trier les sections par ordre
  const sortedSections = sections.sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Politique de confidentialité
          </h1>
          <p className="text-gray-600 mt-2">
            Dernière mise à jour : {new Date(privacyPolicyData.data.updatedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-8">
              Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre site web.
            </p>

            {/* Sections */}
            <div className="space-y-8">
              {sortedSections.map((section) => (
                <div key={section.id} className="border-l-4 border-orange-400 pl-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <div className="text-gray-700 leading-relaxed">
                    {section.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-12 p-6 bg-orange-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Exercer vos droits
              </h3>
              <p className="text-gray-700">
                Pour exercer vos droits concernant vos données personnelles ou si vous avez des questions sur cette politique de confidentialité, vous pouvez nous contacter à l'adresse : 
                <a href="mailto:contact@audelweiss.fr" className="text-orange-600 hover:text-orange-800 font-medium ml-1">
                  contact@audelweiss.fr
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Métadonnées pour le SEO
export const metadata = {
  title: 'Politique de confidentialité - Audelweiss Craft',
  description: 'Découvrez comment nous collectons, utilisons et protégeons vos données personnelles sur le site Audelweiss Craft.',
};
