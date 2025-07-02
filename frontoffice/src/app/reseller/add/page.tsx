import type { Metadata } from 'next';
import { checkUserRole } from "@/app/services/auth.server-side.services";
import { redirect } from 'next/navigation';
import ResellerForm from '@/component/reseller-form.component';

export const metadata: Metadata = {
  title: 'Ajouter un Revendeur | Créations Artisanales',
  description: 'Ajouter un nouveau revendeur à notre réseau de partenaires.',
};

export default async function AddReseller() {
  const isOwner = await checkUserRole('owner');
  
  if (!isOwner) {
    redirect('/reseller');
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Ajouter un nouveau revendeur
            </h1>
            
            <ResellerForm mode="create" />
          </div>
        </div>
      </div>
    </section>
  );
}
