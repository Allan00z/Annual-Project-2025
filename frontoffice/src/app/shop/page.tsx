"use client";

import HeroComponent from "../../component/hero.component";
import CardComponent from "@/component/card.component";
import { useEffect, useState } from "react";
import productsData from "../data/products/products";
import { useSearchParams } from "next/navigation";

export default function Shop() {
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>("default");
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts().then((fetchedProducts) => {
      setProducts(fetchedProducts);
    });
  }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && products.length > 0) {
      // Cherche le nom correspondant à l'id
      const matchedCategory = products
        .flatMap((p) => p.product_categories)
        .find((c: any) => String(c.id) === categoryParam);
      if (matchedCategory) {
        setSelectedCategories([matchedCategory.name]);
      }
    }
  }, [searchParams, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:1338/api/products?populate=product_categories&populate=feedbacks");
      if (!response.ok) throw new Error("Failed to fetch products");
      const res = await response.json();
      return res.data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const filteredProducts = products
    .filter((product) => {
      const matchCategory =
        selectedCategories.length === 0 ||
        product.product_categories.some((cat: any) =>
          selectedCategories.includes(cat.name)
        );

      const productPrice = product.price || 0;
      const matchPriceMin = priceMin === null || productPrice >= priceMin;
      const matchPriceMax = priceMax === null || productPrice <= priceMax;

      const avgRating =
        product.feedbacks?.length > 0
          ? product.feedbacks.reduce((sum: number, f: any) => sum + f.grade, 0) /
          product.feedbacks.length
          : 0;
      const matchRating = minRating === null || avgRating >= minRating;

      return matchCategory && matchPriceMin && matchPriceMax && matchRating;
    })
    .sort((a, b) => {
      if (sortOption === "rating") {
        const avgA =
          a.feedbacks?.length > 0
            ? a.feedbacks.reduce((sum: number, f: any) => sum + f.grade, 0) /
            a.feedbacks.length
            : 0;
        const avgB =
          b.feedbacks?.length > 0
            ? b.feedbacks.reduce((sum: number, f: any) => sum + f.grade, 0) /
            b.feedbacks.length
            : 0;
        return avgB - avgA;
      }

      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen text-black bg-white">
      <HeroComponent />

      <div className="flex flex-col lg:flex-row my-5">
        <div className="hidden lg:block w-1/4 p-6 space-y-6 text-sm border-r border-pink-100">
          <Filters
            products={products}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceMinChange={setPriceMin}
            onPriceMaxChange={setPriceMax}
            minRating={minRating}
            onMinRatingChange={setMinRating}
          />
        </div>

        <div className="w-full lg:w-3/4 p-6 pb-10">
          <div className="flex flex-end w-full mb-5">
            <div className="relative w-fit ml-auto">
              <select
                className="select select-bordered pr-10 text-sm border-[#BF7451] text-[#BF7451]"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Tri par popularités</option>
                <option value="rating">Tri par notes moyennes</option>
                <option value="price-asc">Tri par tarifs croissants</option>
                <option value="price-desc">Tri par tarifs décroissants</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 lg:hidden">
            <button
              className="btn btn-outline btn-sm text-[#BF7451] border-[#BF7451]"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Cacher Filtres" : "Afficher Filtres"}
            </button>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 border rounded bg-pink-50 space-y-4">
              <Filters
                products={products}
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategory}
                priceMin={priceMin}
                priceMax={priceMax}
                onPriceMinChange={setPriceMin}
                onPriceMaxChange={setPriceMax}
                minRating={minRating}
                onMinRatingChange={setMinRating}
              />
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-6">
            {filteredProducts.map((product, i) => (
              <CardComponent
                id={product.documentId}
                image={product?.image}
                title={product.name}
                description={product.description}
                price={product.price}
                handleAddToCart={() => { }}
                feedbacks={product.feedbacks || []}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Filters mis à jour avec filtre par note
function Filters({
  products = [],
  selectedCategories = [],
  onToggleCategory,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  minRating,
  onMinRatingChange,
}: {
  products?: any[];
  selectedCategories?: string[];
  onToggleCategory?: (catName: string) => void;
  priceMin?: number | null;
  priceMax?: number | null;
  onPriceMinChange?: (val: number | null) => void;
  onPriceMaxChange?: (val: number | null) => void;
  minRating?: number | null;
  onMinRatingChange?: (val: number | null) => void;
}) {
  const uniqueCategories = Array.from(
    new Set(products.flatMap((p) => p.product_categories.map((cat: any) => cat.name)))
  );

  return (
    <>
      {/* Catégories */}
      <div className="bg-pink">
        <div className="font-semibold uppercase text-[#BF7451] flex justify-between items-center mb-2">
          Filtrer
        </div>
        <ul className="menu bg-base-100 w-full rounded-box">
          <li>
            <details open>
              <summary className="font-semibold text-[#BF7451]">Catégories</summary>
              <ul className="p-2 bg-base-100 text-[#BF7451]">
                {uniqueCategories.map((catName) => (
                  <label key={catName} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-pink-400"
                      checked={selectedCategories.includes(catName)}
                      onChange={() => onToggleCategory && onToggleCategory(catName)}
                    />
                    <span className="text-[#000000]">{catName}</span>
                  </label>
                ))}
              </ul>
            </details>
          </li>
        </ul>
      </div>

      {/* Prix */}
      <div className="mt-4">
        <h2 className="font-semibold uppercase text-[#BF7451]">Prix</h2>
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            placeholder="Min €"
            value={priceMin !== null ? priceMin : ""}
            onChange={(e) =>
              onPriceMinChange && onPriceMinChange(e.target.value === "" ? null : Number(e.target.value))
            }
            className="input input-bordered w-1/2 text-black border-pink outline-[#BF7451]"
          />
          <input
            type="number"
            placeholder="Max €"
            value={priceMax !== null ? priceMax : ""}
            onChange={(e) =>
              onPriceMaxChange && onPriceMaxChange(e.target.value === "" ? null : Number(e.target.value))
            }
            className="input input-bordered w-1/2 text-black outline-[#BF7451]"
          />
        </div>
      </div>
    </>
  );
}
