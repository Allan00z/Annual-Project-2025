"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import type { Reseller } from "../models/resseler";
import ProductBadgeList from "./product-badge-list.component";

interface ResellerCardProps {
  reseller: Reseller;
}

export default function ResellerCard({ reseller }: ResellerCardProps) {
  const [formattedAddress, setFormattedAddress] = useState<string>("");

  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ResellerApp/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.address) {
          const addressParts = [];
          
          if (data.address.house_number) {
            addressParts.push(data.address.house_number);
          }
          if (data.address.road) {
            addressParts.push(data.address.road);
          }
          if (data.address.city || data.address.town || data.address.village) {
            addressParts.push(data.address.city || data.address.town || data.address.village);
          }
          if (data.address.postcode) {
            addressParts.push(data.address.postcode);
          }
          if (data.address.country) {
            addressParts.push(data.address.country);
          }
          
          return addressParts.join(', ');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
    }
    return null;
  };

  useEffect(() => {
    if (!reseller.address.address && reseller.address.coordinates) {
      const { lat, lng } = reseller.address.coordinates;
      fetchAddressFromCoordinates(lat, lng).then(address => {
        if (address) {
          setFormattedAddress(address);
        }
      });
    }
  }, [reseller.address]);
  const handleViewOnMap = () => {
    const { lat, lng } = reseller.address.coordinates;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 w-full">
        {reseller.image ? (
          <Image
            src={`${process.env.STRAPI_URL || 'http://localhost:1338'}${reseller.image.url}`}
            alt={reseller.image.alternativeText || reseller.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-lg">Aucune image</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          {reseller.name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {reseller.description}
        </p>

        <div className="flex items-center text-gray-500 mb-4">
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          <span className="text-sm">
            {reseller.address.address || 
             formattedAddress || 
             `${reseller.address.coordinates.lat.toFixed(4)}, ${reseller.address.coordinates.lng.toFixed(4)}`}
          </span>
        </div>

        {reseller.products && reseller.products.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Produits disponibles :
            </h4>
            <ProductBadgeList 
              products={reseller.products} 
              maxDisplay={3} 
              size="sm" 
            />
          </div>
        )}

        <button
          onClick={handleViewOnMap}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
            />
          </svg>
          Voir sur la carte
        </button>
      </div>
    </div>
  );
}
