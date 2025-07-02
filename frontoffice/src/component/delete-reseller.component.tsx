"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Reseller } from "@/models/resseler";

interface DeleteResellerComponentProps {
  reseller: Reseller;
}

export default function DeleteResellerComponent({ reseller }: DeleteResellerComponentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/resellers/${reseller.documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du revendeur');
      }

      router.push('/reseller');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
        <div className="flex">
          <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Attention !</p>
            <p className="text-sm">
              Cette action est irréversible. Le revendeur sera définitivement supprimé de la base de données.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Informations du revendeur à supprimer :
        </h3>
        
        <div className="flex gap-6">
          {reseller.image && (
            <div className="flex-shrink-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1338'}${reseller.image.url}`}
                alt={reseller.image.alternativeText || reseller.name}
                width={150}
                height={150}
                className="rounded-lg object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              {reseller.name}
            </h4>
            
            <p className="text-gray-600 mb-3">
              {reseller.description}
            </p>
            
            <div className="flex items-center text-gray-500 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {reseller.address.address || `${reseller.address.coordinates.lat.toFixed(4)}, ${reseller.address.coordinates.lng.toFixed(4)}`}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Suppression...' : 'Confirmer la suppression'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
