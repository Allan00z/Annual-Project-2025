import type { Metadata } from 'next';
import { checkUserRole } from "@/app/services/auth.server-side.services";
import { redirect, notFound } from 'next/navigation';
import DeleteResellerComponent from '@/component/delete-reseller.component';
import type { Reseller } from "@/models/resseler";

export const metadata: Metadata = {
  title: 'Supprimer un Revendeur | Créations Artisanales',
  description: 'Supprimer un revendeur du réseau de partenaires.',
};

interface ApiResponse {
  data: Reseller;
}

async function getResellerById(documentId: string): Promise<Reseller | null> {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  try {
    const res = await fetch(`${STRAPI_URL}/api/resellers/${documentId}?populate=*`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data: ApiResponse = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching reseller:", error);
    return null;
  }
}

export default async function DeleteReseller({ params }: { params: { id: string } }) {
  const isOwner = await checkUserRole('owner');
  
  if (!isOwner) {
    redirect('/reseller');
  }

  const reseller = await getResellerById(params.id);

  if (!reseller) {
    notFound();
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-red-600 mb-8">
              Supprimer le revendeur
            </h1>
            
            <DeleteResellerComponent reseller={reseller} />
          </div>
        </div>
      </div>
    </section>
  );
}
