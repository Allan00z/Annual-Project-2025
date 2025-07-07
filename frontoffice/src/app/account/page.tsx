'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '../services/auth.service';

interface UserData {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  role?: {
    id: number;
    documentId: string;
    name: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  client?: {
    id: number;
    documentId: string;
    firstname: string;
    lastname: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    deliveryAddress?: {
      address: string;
      geohash: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    billingAddress?: {
      address: string;
      geohash: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
  };
}

export default function Account() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      if (!AuthService.isLoggedIn()) {
        router.push('/login');
        return;
      }

      try {
        const token = AuthService.getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
        const response = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            AuthService.logout();
            router.push('/login');
            return;
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setUserData(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue');
        setIsLoading(false);
      }
    };

    checkAuthAndFetchUser();
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre compte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mon Compte</h1>
                <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {userData && (
            <div className="space-y-6">
              {/* Informations personnelles et client */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Informations personnelles
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom d'utilisateur
                    </label>
                    <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                      {userData.username}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                      {userData.email}
                    </p>
                  </div>
                  
                  {userData.client ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                          {userData.client.firstname}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                          {userData.client.lastname}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="md:col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Informations client manquantes
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>
                                Vos informations personnelles (prénom, nom, adresses) ne sont pas encore renseignées. 
                                Cliquez sur "Modifier le profil" pour compléter votre profil.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut du compte
                    </label>
                    <div className="flex items-center bg-gray-50 p-3 rounded-md">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userData.confirmed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userData.confirmed ? 'Confirmé' : 'Non confirmé'}
                      </span>
                      {userData.blocked && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Bloqué
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {userData.client?.deliveryAddress && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse de livraison
                      </label>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-lg text-gray-900 mb-2">
                          {userData.client.deliveryAddress.address}
                        </p>
                        <div className="text-sm text-gray-600">
                          <p>
                            Coordonnées: {userData.client.deliveryAddress.coordinates.lat.toFixed(6)}, {userData.client.deliveryAddress.coordinates.lng.toFixed(6)}
                          </p>
                          <p>
                            Geohash: {userData.client.deliveryAddress.geohash}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userData.client?.billingAddress && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse de facturation
                      </label>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-lg text-gray-900 mb-2">
                          {userData.client.billingAddress.address}
                        </p>
                        <div className="text-sm text-gray-600">
                          <p>
                            Coordonnées: {userData.client.billingAddress.coordinates.lat.toFixed(6)}, {userData.client.billingAddress.coordinates.lng.toFixed(6)}
                          </p>
                          <p>
                            Geohash: {userData.client.billingAddress.geohash}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rôle utilisateur */}
              {userData.role && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    <span className="inline-block w-6 h-6 bg-purple-500 rounded-full mr-2"></span>
                    Rôle et permissions
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du rôle
                      </label>
                      <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                        {userData.role.name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de rôle
                      </label>
                      <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md capitalize">
                        {userData.role.type}
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                        {userData.role.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Actions
                </h2>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => router.push('/profile/edit')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Modifier le profil
                  </button>
                  
                  <button
                    onClick={() => router.push('/change-password')}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Changer le mot de passe
                  </button>
                  
                  <button
                    onClick={() => router.push('/')}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
