"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Reseller } from "@/models/resseler";
import type { Product } from "@/models/product";
import { ProductService } from "@/app/services/product.service";
import ProductSelector from "@/component/product-selector.component";

interface ResellerFormProps {
  mode: 'create' | 'edit';
  reseller?: Reseller;
}

interface FormData {
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  products: number[];
}

export default function ResellerForm({ mode, reseller }: ResellerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: reseller?.name || '',
    description: reseller?.description || '',
    address: reseller?.address?.address || '',
    lat: reseller?.address?.coordinates?.lat || 0,
    lng: reseller?.address?.coordinates?.lng || 0,
    products: reseller?.products?.map(p => p.id) || [],
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const products = await ProductService.getAllProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        setError('Impossible de charger la liste des produits');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const resellerData = {
        name: formData.name,
        description: formData.description,
        address: {
          address: formData.address,
          coordinates: {
            lat: formData.lat,
            lng: formData.lng,
          },
          geohash: '',
        },
        products: formData.products,
      };

      const requestFormData = new FormData();
      requestFormData.append('data', JSON.stringify(resellerData));

      const url = mode === 'create' 
        ? '/api/resellers'
        : `/api/resellers/${reseller?.documentId}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        body: requestFormData,
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de ${mode === 'create' ? 'la création' : 'la modification'} du revendeur`);
      }

      router.push('/reseller');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeocoding = async () => {
    if (!formData.address) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ResellerApp/1.0'
          }
        }
      );

      const data = await response.json();
      if (data.length > 0) {
        setFormData({
          ...formData,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
      }
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom du revendeur *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Adresse *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Rue de la Paix, 75001 Paris, France"
          />
          <button
            type="button"
            onClick={handleGeocoding}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Géocoder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">
            Latitude *
          </label>
          <input
            type="number"
            id="lat"
            required
            step="any"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-2">
            Longitude *
          </label>
          <input
            type="number"
            id="lng"
            required
            step="any"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-700">
          <strong>Note :</strong> L'ajout d'images pour le revendeur doit être fait directement via l'interface de Strapi.
        </p>
      </div>

      {/* Section de sélection des produits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Produits vendus par ce revendeur
        </label>
        <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
          <ProductSelector
            selectedProducts={formData.products}
            onProductsChange={(productIds) => 
              setFormData({ ...formData, products: productIds })
            }
            availableProducts={availableProducts}
            isLoading={isLoadingProducts}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Sélectionnez les produits que ce revendeur propose dans sa boutique.
        </p>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading 
            ? (mode === 'create' ? 'Création...' : 'Modification...') 
            : (mode === 'create' ? 'Créer le revendeur' : 'Modifier le revendeur')
          }
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
