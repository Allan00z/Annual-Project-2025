import type { Metadata } from 'next';
import { checkUserRole } from '../services/auth.server-side.services';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Administration | Créations Artisanales',
  description: 'Panel d\'administration pour la gestion du site',
};

export default async function AdminDashboard() {
  const isOwner = await checkUserRole('owner');
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  
  if (!isOwner) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel d'Administration</h1>
          <p className="mt-1 text-gray-600">
            Gérez votre site et vos commandes depuis ce tableau de bord
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/orders" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-blue-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Gestion des Commandes</h3>
                  <p className="text-sm text-gray-600">
                    Voir, gérer et clôturer les commandes. Contacter les clients.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-blue-600">
                  <span>Accéder à la gestion</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/reseller" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-green-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Gestion des Revendeurs</h3>
                  <p className="text-sm text-gray-600">
                    Ajouter, modifier et supprimer des revendeurs partenaires.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <span>Gérer les revendeurs</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

            <a href={`${STRAPI_URL}/admin`} target="_blank" rel="noopener noreferrer" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-purple-300">
              <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Back Office (Strapi)</h3>
                <p className="text-sm text-gray-600">
                Gérer le contenu, les produits et les configurations.
                </p>
              </div>
              </div>
              <div className="mt-4">
              <div className="flex items-center text-sm text-purple-600">
                <span>Ouvrir Strapi</span>
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              </div>
            </div>
            </a>

          <Link href="/" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-gray-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Retour au Site</h3>
                  <p className="text-sm text-gray-600">
                    Retourner à la page d'accueil du site web.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span>Aller à l'accueil</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/orders?filter=pending"
                className="flex items-center p-4 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors"
              >
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Commandes en attente</p>
                  <p className="text-sm text-gray-600">Voir les nouvelles commandes</p>
                </div>
              </Link>

              <Link
                href="/reseller/add"
                className="flex items-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ajouter un revendeur</p>
                  <p className="text-sm text-gray-600">Nouveau partenaire</p>
                </div>
              </Link>

              <a
                href={`${STRAPI_URL}/admin/content-manager/collection-types/api::product.product`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Gérer les produits</p>
                  <p className="text-sm text-gray-600">Dans Strapi</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
