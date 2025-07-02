"use client";

import { useState, useEffect } from 'react';
import type { Product } from '@/models/product';
import '@/styles/product-selector.css';

interface ProductSelectorProps {
  selectedProducts: number[];
  onProductsChange: (productIds: number[]) => void;
  availableProducts: Product[];
  isLoading?: boolean;
}

export default function ProductSelector({ 
  selectedProducts, 
  onProductsChange, 
  availableProducts,
  isLoading = false 
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(availableProducts);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(availableProducts);
    } else {
      const filtered = availableProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, availableProducts]);

  const handleProductToggle = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      onProductsChange(selectedProducts.filter(id => id !== productId));
    } else {
      onProductsChange([...selectedProducts, productId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      onProductsChange([]);
    } else {
      onProductsChange(filteredProducts.map(p => p.id));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement des produits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="product-selector space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={handleSelectAll}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          {selectedProducts.length === filteredProducts.length ? 'Tout désélectionner' : 'Tout sélectionner'}
        </button>
      </div>

      <div className="text-sm text-gray-600">
        {selectedProducts.length} produit(s) sélectionné(s) sur {availableProducts.length}
      </div>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
        {filteredProducts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {availableProducts.length === 0 
              ? 'Aucun produit disponible' 
              : 'Aucun produit trouvé pour cette recherche'
            }
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              return (
                <label
                  key={product.id}
                  className={`product-item flex items-start space-x-3 p-3 rounded-md cursor-pointer border ${
                    isSelected 
                      ? 'selected bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleProductToggle(product.id)}
                    className="product-checkbox mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </div>
                    <div className="text-sm font-semibold text-blue-600 mt-1">
                      {product.price ? `${product.price.toFixed(2)} €` : 'Prix non défini'}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
