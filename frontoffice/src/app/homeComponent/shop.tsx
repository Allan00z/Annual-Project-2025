import Image from "next/image";
import React, { useState } from "react";
import bandeau from "../../medias/images/crochet-bg_files/bandeau-raye.jpg.webp";
import bonnet from "../../medias/images/crochet-bg_files/bonnet-avec-pompom.jpg.webp";
import productsData from "../data/products/products"

const Shop = () => {
  // State to manage hovered category
  const [hovered, setHovered] = useState<
    "bandeaux" | "bonnets" | "accessoires" | null
  >(null);

  // Shuffle products and select 4 random ones
  const randomProducts = [...productsData]
  .sort(() => 0.5 - Math.random())
  .slice(0, 4);

  return (
    <section>
      <div className="relative flex flex-col items-center py-20 bg-[#f7c0a6] w-full overflow-hidden rounded-xl">
        <div className="overflow-x-hidden w-full">
          <p className="whitespace-nowrap text-2xl animate-marquee overflow-x text-[#BF7451]">
            les catégories • • • • • les catégories • • • • • les catégories • •
            • • • les catégories • • • • • les catégories • • • • • les
            catégories • • • • • les catégories • • • • • les catégories • • • •
            • catégories • • • • • les catégories • • • • • les catégories • • •
            •
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 m-auto">
          <Image
            src={bandeau}
            alt="bandeau miniature"
            width={200}
            height={200}
            className="rounded-lg"
          />
          <div className="flex flex-col text-center space-y-6">
            <h2 className={"text-4xl md:text-5xl hover:text-orange-400 font-bold cursor-pointer"}>
              Bandeaux -
            </h2>
            <h2 className={"text-4xl md:text-5xl hover:text-orange-400 font-bold cursor-pointer"}>
              Bonnets -
            </h2>
            <h2 className={"text-4xl md:text-5xl hover:text-orange-400 font-bold cursor-pointer"}>
              Accessoires -
            </h2>
            <a href="/shop">
              <button className="bg-black text-white px-6 py-4 rounded-lg mt-8 hover:bg-black-800 hover:text-orange-400 transition">
                Voir la boutique
              </button>
            </a>
          </div>

          <Image
            src={bonnet}
            alt="bonnet miniature"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
        <div className="mt-16 overflow-x-hidden w-full">
          <p className="whitespace-nowrap text-2xl animate-marquee overflow-x text-[#BF7451]">
            les catégories • • • • • les catégories • • • • • les catégories • •
            • • • les catégories • • • • • les catégories • • • • • les
            catégories • • • • • les catégories • • • • • les catégories • • • •
            • catégories • • • • • les catégories • • • • • les catégories • • •
            •
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center py-20 gap-10">
        <div className="text-center space-y-2 p-3">
          <p className="text-2xl">Des créations artisanales uniques</p>
          <p className="text-2xl">
            Fait main avec passion pour toi et ceux que tu aimes ✨
          </p>
        </div>

        <section className="container mx-auto py-10 flex flex-col md:flex-row flex-wrap justify-center gap-10">
          {randomProducts.map((produit: any) => (
            <div
              key={produit.id}
              className="flex flex-col items-center w-56 h-full mx-auto md:mx-0"
            >
              <div className="relative w-full h-64 rounded-xl overflow-hidden border border-neutral-200">
                {produit.promo && produit.ancienPrix && (
                  <div className="absolute top-2 left-2 bg-pink-100 text-red-500 px-3 py-1 rounded-md font-semibold text-sm">
                    EN PROMO
                  </div>
                )}
                <Image
                  src={produit.image}
                  alt={produit.title}
                  className="object-cover w-full h-full"
                  width={224}
                  height={256}
                />
              </div>

              <div className="mt-3 text-left w-full">
                <p className="text-lg font-medium truncate w-full">
                  {produit.title}
                </p>
                <div className="flex flex-row">
                  {produit.promo && produit.ancienPrix && (
                      <p className="text-black/30 text-lg mt-1 line-through mr-2">
                        {produit.ancienPrix}
                      </p>
                  )}
                  <p className="text-orange-300 text-lg mt-1">
                    {produit.price}
                  </p>
                </div>
              </div>

              {/* Bouton */}
              <button className="mt-3 bg-[#f7c0a6] text-black hover:text-orange-400 px-4 py-2 rounded-md w-full">
                Ajouter au panier
              </button>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
};

export default Shop;
