"use client";

import HeroComponent from "../../component/hero.component";
import CardComponent from "@/component/card.component";
import { products } from "../data/products/products";
import { useState } from "react";
import { useRef } from "react";

export default function Shop() {
  const [showFilters, setShowFilters] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {};

  return (
    <div className="min-h-screen text-black bg-white">
      <HeroComponent />

      <div className="flex flex-col lg:flex-row my-5">
        {/* Sidebar desktop */}
        <div className="hidden lg:block w-1/4 p-6 space-y-6 text-sm border-r border-pink-100">
          <Filters />
        </div>

        {/* Content + Search Bar mobile */}
        <div className="w-full lg:w-3/4 p-6 pb-10">
          <div className="flex flex-end w-full mb-5">
            <div className="relative w-fit ml-auto">
              <select className="select select-bordered pr-10 text-sm border-[#BF7451] text-[#BF7451]">
                <option>Tri par popularités</option>
                <option>Tri par notes moyennes</option>
                <option>Tri par plus récents au plus anciens</option>
                <option>Tri par tarifs croissants</option>
                <option>Tri par tarifs décroissants</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[#BF7451]">
              </div>
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

          {/* Filters mobile */}
          {showFilters && (
            <div className="mb-6 p-4 border rounded bg-pink-50 space-y-4">
              <Filters />
            </div>
          )}

          {/* Produits */}
          <div className="flex flex-wrap justify-between gap-6">
            {products.map((product) => (
              <CardComponent
                key={product.id}
                image={product.image}
                title={product.title}
                description={product.description}
                price={product.price}
                handleAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Filters() {
  return (
    <>
      {/* Catégories */}
      <div className="bg-pink">
        <div className="font-semibold uppercase text-[#BF7451] flex justify-between items-center mb-2">
          Catégories
        </div>
        <ul className="menu bg-base-100 w-full rounded-box">
          <li>
            <details open>
              <summary className="font-semibold text-[#BF7451]">
                Accessoires
              </summary>
              <ul className="p-2 bg-base-100 text-[#BF7451]">
                <FilterItem label="Bandeaux" />
                <FilterItem label="Bonnets" />
                <FilterItem label="Sacs / Bananes" />
                <FilterItem label="Scrunchy" />
              </ul>
            </details>
          </li>
          <li className="text-[#BF7451]">
            <FilterItem label="🍳 Cuisine" />
          </li>
          <li>
            <details>
              <summary className="font-semibold text-[#BF7451]">Déco</summary>
              <ul className="p-2 bg-base-100 text-[#BF7451]">
                <FilterItem label="Wire art" />
              </ul>
            </details>
          </li>
        </ul>
      </div>

      {/* Prix */}
      <div>
        <h2 className="font-semibold uppercase text-[#BF7451] flex justify-between items-center">
          Prix
        </h2>
        <input type="range" className="range custom-range mt-2" />
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            placeholder="€"
            className="input input-bordered w-1/2 text-black border-pink outline-[#BF7451] outline-1"
          />
          <input
            type="number"
            placeholder="€"
            className="input input-bordered w-1/2 text-black outline-[#BF7451] outline-1"
          />
        </div>
      </div>

      {/* Évaluations */}
      <div>
        <h2 className="font-semibold uppercase text-[#BF7451]">Évaluations</h2>
        <div className="flex items-center mt-1 text-[#BF7451]">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 .587l3.668 7.568L24 9.75l-6 5.792L19.336 24 12 20.01 4.664 24 6 15.542 0 9.75l8.332-1.595z" />
              </svg>
            ))}
          <span className="ml-2 text-sm">et au delà</span>
        </div>
      </div>
    </>
  );
}

function FilterItem({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" className="checkbox checkbox-pink-400" />
      <span>{label}</span>
    </label>
  );
}
