import hauteAlpe from "../../medias/images/crochet-bg_files/haute-alpe.jpg";
import React, { JSX } from "react";
import productsData from "../data/products/products";

export default function Creations(): JSX.Element {
    // Exemple de données fictives, tu peux remplacer par un fetch plus tard
    return (
        <>
            <div
                className="flex flex-col items-center justify-center bg-cover bg-center py-16"
                style={{ backgroundImage: `url(${hauteAlpe})` }}
            >
                <h1 className="text-4xl font-bold text-[#E8A499]">Mes créations</h1>
                <p className="mt-4 text-lg text-black text-center max-w-2xl">
                    Découvrez mes créations passées, chacune unique et réalisée avec soin.
                    Elles peuvent vous inspirer pour une commande personnalisée : il vous suffit de me contacter pour en discuter ensemble ! 😊
                </p>
            </div>

            <div className="container mx-auto px-4 py-10 ">
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
                    {productsData.map((product, index) => (
                        <div key={product.id} className="card bg-base-100 shadow-xl ">
                            {/* Image du produit */}
                            {productsData[index]?.image && (
                                <figure>
                                    <img src={productsData[index].image.src} alt={product.title} className="w-full h-68 object-cover rounded-lg" />
                                    <div className="card-body absolute bottom-0 left-0 right-0 p-4">
                                        <h2 className="card-title text-[#e8a499]">{product.title}</h2>
                                    </div>
                                </figure>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}