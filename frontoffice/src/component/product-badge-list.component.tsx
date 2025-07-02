"use client";

import type { Product } from '@/models/product';

interface ProductBadgeListProps {
  products: Product[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductBadgeList({ 
  products, 
  maxDisplay = 3,
  size = 'sm'
}: ProductBadgeListProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const displayedProducts = products.slice(0, maxDisplay);
  const remainingCount = products.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-2">
      {displayedProducts.map((product) => (
        <span 
          key={product.id}
          className={`bg-blue-100 text-blue-700 rounded-full font-medium ${sizeClasses[size]}`}
          title={`${product.name} - ${product.price ? `${product.price.toFixed(2)} €` : 'Prix non défini'}`}
        >
          {product.name}
        </span>
      ))}
      {remainingCount > 0 && (
        <span 
          className={`bg-gray-100 text-gray-600 rounded-full font-medium ${sizeClasses[size]}`}
          title={`${remainingCount} autres produits`}
        >
          +{remainingCount} autres
        </span>
      )}
    </div>
  );
}
