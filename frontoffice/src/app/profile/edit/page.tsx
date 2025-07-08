'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '../../services/auth.service';

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

interface FormData {
  firstname: string;
  lastname: string;
  deliveryAddress: string;
  billingAddress: string;
}

export default function EditProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname: '',
    deliveryAddress: '',
    billingAddress: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
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
        
        // Pré-remplir le formulaire avec les données existantes
        if (data.client) {
          setFormData({
            firstname: data.client.firstname || '',
            lastname: data.client.lastname?.toUpperCase() || '',
            deliveryAddress: data.client.deliveryAddress?.address || '',
            billingAddress: data.client.billingAddress?.address || ''
          });
        }
        
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'lastname' ? value.toUpperCase() : value
    }));
    // Réinitialiser les messages d'erreur et de succès
    setError(null);
    setSuccess(null);
  };

  const geocodeAddress = async (address: string) => {
    try {
      // Utiliser l'API Nominatim d'OpenStreetMap pour le géocodage
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        // Générer un geohash simple (implémentation basique)
        const geohash = generateGeohash(lat, lng);
        
        return {
          address,
          coordinates: { lat, lng },
          geohash
        };
      }
      
      // Si le géocodage échoue, retourner des coordonnées par défaut
      return {
        address,
        coordinates: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
        geohash: 'u09tunq'
      };
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      return {
        address,
        coordinates: { lat: 48.8566, lng: 2.3522 },
        geohash: 'u09tunq'
      };
    }
  };

  const generateGeohash = (lat: number, lng: number): string => {
    // Implémentation basique d'un geohash
    const chars = '0123456789bcdefghjkmnpqrstuvwxyz';
    let geohash = '';
    let latRange = [-90, 90];
    let lngRange = [-180, 180];
    let isEven = true;
    
    for (let i = 0; i < 12; i++) {
      let bit = 0;
      for (let j = 0; j < 5; j++) {
        if (isEven) {
          const mid = (lngRange[0] + lngRange[1]) / 2;
          if (lng >= mid) {
            bit = (bit << 1) | 1;
            lngRange[0] = mid;
          } else {
            bit = bit << 1;
            lngRange[1] = mid;
          }
        } else {
          const mid = (latRange[0] + latRange[1]) / 2;
          if (lat >= mid) {
            bit = (bit << 1) | 1;
            latRange[0] = mid;
          } else {
            bit = bit << 1;
            latRange[1] = mid;
          }
        }
        isEven = !isEven;
      }
      geohash += chars[bit];
    }
    
    return geohash;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = AuthService.getToken();
      if (!token || !userData) {
        throw new Error('Token ou données utilisateur manquants');
      }

      const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
      
      const deliveryAddressData = formData.deliveryAddress ? await geocodeAddress(formData.deliveryAddress) : null;
      const billingAddressData = formData.billingAddress ? await geocodeAddress(formData.billingAddress) : null;
      
      const clientData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        users_permissions_user: userData.id,
        deliveryAddress: deliveryAddressData,
        billingAddress: billingAddressData
      };

      let response;
      
      if (userData.client) {
        response = await fetch(`${STRAPI_URL}/api/clients/${userData.client.documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ data: clientData }),
        });
      } else {
        response = await fetch(`${STRAPI_URL}/api/clients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: clientData }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erreur HTTP: ${response.status}`);
      }

      setSuccess('Profil mis à jour avec succès ! Vous allez être redirigé vers votre compte.');
      
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        router.push('/account');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Modifier mon profil</h1>
                <p className="text-gray-600 mt-1">Mettez à jour vos informations personnelles</p>
              </div>
              <button
                onClick={() => router.push('/account')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Retour
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Erreur</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Succès</p>
              <p>{success}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                    placeholder="VOTRE NOM"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse de livraison
                </label>
                <input
                  type="text"
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Adresse complète de livraison"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Exemple: 123 Rue de la Paix, 75001 Paris, France
                </p>
              </div>

              <div>
                <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse de facturation
                </label>
                <input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Adresse complète de facturation"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Exemple: 123 Rue de la Paix, 75001 Paris, France
                </p>
              </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                        Note importante
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                        <p>
                            Les adresses seront automatiquement géocodées pour améliorer la précision des livraisons. 
                            Assurez-vous de saisir des adresses complètes et précises.
                        </p>
                        </div>
                    </div>
                    </div>
                </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du compte</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom d'utilisateur
                    </label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {userData?.username}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {userData?.email}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Pour modifier ces informations, contactez le support.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/account')}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
