'use client';
import Image from "next/image";
import React, { useState } from "react";
import handwithcrochet from "../../medias/images/crochet-bg_files/4b016c7372b5440180c5e265eed458d1-scaled.webp";
import cardigan from "../../medias/images/crochet-bg_files/cardigan-400x284.jpg.webp";
import geocache from "../../medias/images/crochet-bg_files/geocache-400x284.jpg.webp";
import patatepositive from "../../medias/images/crochet-bg_files/patate-positive-400x284.jpg.webp";
import montagne from "../../medias/images/crochet-bg_files/montagne.svg";
import crochet from "../../medias/images/crochet-bg_files/crochet.svg";
import reiki from "../../medias/images/crochet-bg_files/reiki.svg";
import tissu from "../../medias/images/crochet-bg_files/0b0bc07c-1615-4152-b893-770a637929dc.webp";
import bandeaufantaisie from "../../medias/images/crochet-bg_files/bandeaufantaisie-400x284.jpg.webp";
import bandeau from "../../medias/images/crochet-bg_files/bandeau-raye.jpg.webp";
import bonnet from "../../medias/images/crochet-bg_files/bonnet-avec-pompom.jpg.webp";
import portecle from "../../medias/images/crochet-bg_files/porte-cle.jpg.webp";

const HomePage = () => {

  const [hovered, setHovered] = useState<"bandeaux" | "bonnets" | "accessoires" | null>(null);

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <section
        className="relative bg-cover bg-center py-12 px-6 h-screen"
        style={{ backgroundImage: `url(${handwithcrochet.src})` }}
      >
        <svg className="absolute bottom-0 left-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fillOpacity="1" d="M0,288L60,272C120,256,240,224,360,229.3C480,235,600,277,720,288C840,299,960,277,1080,240C1200,203,1320,149,1380,122.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>
        {/* Contenu centré à droite */}
        <div className="relative container mx-auto h-full flex items-center justify-start px-6">
          <div className="md:w-1/2 text-left">
            <h1 className="text-5xl font-bold leading-tight text-[#f7c0a6]">
              Des créations <span className="text-[">uni</span> au crochet
            </h1>
            <p className="mt-4 text-lg text-white">
              Chaque pièce est soigneusement confectionnée à la main dans les Hautes-Alpes. Offrez-vous ou à vos proches un savoir-faire authentique, alliant douceur et originalité.
            </p>
            <button className=" btn btn-primary mt-6 bg-black text-white rounded py-2 px-2">Découvrir la boutique</button>
          </div>
        </div>
      </section>
      <section className="relative container mx-auto flex flex-col py-20 px-30-md">
        {/* CARD 1 - alignée à gauche */}
        <div className="relative flex justify-center md:justify-start pb-10-sm">
          <div className="card bg-base-100 w-96 z-1">
            <div className="card-body">
              <h2 className="text-4xl card-title text-[#f7c0a6] pb-5">
                01
              </h2>
              <div className="text-4xl badge badge-secondary pb-5">ARTISANAT EMBRUNAIS</div>
              <p>
                Je vis dans les Hautes-Alpes, un cadre qui m’inspire chaque jour. Toutes mes créations sont réalisées ici, à la main, avec des matériaux choisis avec soin. J’aime l’idée de proposer des pièces qui portent en elles un peu de cette authenticité montagnarde.
              </p>
            </div>
          </div>
          <Image
            src={montagne}
            alt="crochet"
            className="absolute top-1/3 left-[260px] w-[280px] opacity-40 hidden md:block z-0"
          />
        </div>

        {/* CARD 2 - alignée à droite */}
        <div className="relative flex justify-center md:justify-end pb-10-sm">
          <div className="card bg-base-100 w-96 z-1">
            <div className="card-body">
              <h2 className="text-4xl card-title text-[#f7c0a6] pb-5">
                02
              </h2>
              <div className="text-4xl badge badge-secondary pb-5">Éditions limitées ou sur-mesure</div>
              <p>
                Je suis une créatrice curieuse, toujours en quête de nouvelles idées. J’aime tester des techniques, des couleurs et des matières différentes. Cette envie d’explorer donne naissance à des pièces variées : certaines sont produites en petites séries, d’autres peuvent être personnalisées selon vos goûts et vos besoins.
              </p>
            </div>
          </div>
          <Image
            src={crochet}
            alt="crochet"
            className="absolute top-0 right-[300px] w-[280px] opacity-40 hidden md:block z-0"
          />
        </div>

        {/* CARD 3 - alignée à gauche */}
        <div className="relative flex justify-center md:justify-start pb-10-sm">
          <div className="card bg-base-100 w-96 z-1">
            <div className="card-body">
              <h2 className="text-4xl card-title text-[#f7c0a6] pb-5">
                03
              </h2>
              <div className="text-4xl badge badge-secondary pb-5">Énergie et bien-être avec le Reiki</div>
              <p>
                Depuis 2021, je suis certifiée praticienne Reiki. Chaque fois que je crée, je me connecte à cette énergie pour infuser mes pièces d’intentions positives. Mon but est de proposer des créations qui vous apportent à la fois bien-être et harmonie visuelle.
              </p>
            </div>
          </div>
          <Image
            src={reiki}
            alt="reiki"
            className="absolute left-[300px] w-[260px] opacity-40 hidden md:block z-0"
          />
        </div>
      </section>
      <section className="relative flex flex-col py-20 h-screen bg-[#f7c0a6] w-full space-around p-auto">
        <svg className="absolute top-0 left-0 w-screen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fillOpacity="1" d="M0,256L80,218.7C160,181,320,107,480,85.3C640,64,800,96,960,106.7C1120,117,1280,107,1360,101.3L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path></svg>
        <div className="absolute top-0 left-20 w-[300px] h-[300px] overflow-hidden rounded-[30%_70%_70%_30%/30%_30%_70%_70%]">
          <Image
            src={tissu}
            alt="tissu"
            fill
            className="object-cover "
          />
        </div>
        <div className="absolute top-2 left-5 w-[200px] h-[200px] overflow-hidden rounded-[60%_40%_30%_70%/50%_30%_70%_50%]">
          <Image
            src={bandeaufantaisie}
            alt="bandeaufantaisie"
            fill
            className="object-cover "
          />
        </div>

        <div className="flex space-between m-auto w-full">
          <div className="w-1/2 m-auto flex flex-col text-center">
            <h2
              className="text-5xl hover:text-white cursor-pointer"
              onMouseEnter={() => setHovered("bandeaux")}
              onMouseLeave={() => setHovered(null)}
            >
              Bandeaux -
            </h2>
            <h2
              className="text-5xl hover:text-white cursor-pointer"
              onMouseEnter={() => setHovered("bonnets")}
              onMouseLeave={() => setHovered(null)}
            >
              Bonnets -
            </h2>
            <h2
              className="text-5xl hover:text-white cursor-pointer"
              onMouseEnter={() => setHovered("accessoires")}
              onMouseLeave={() => setHovered(null)}
            >
              Accessoires -
            </h2>
            <button className="bg-black text-white w-50 p-5 rounded-lg text-center mt-10 m-auto">Voir la boutique</button>
          </div>
          <div className="flex w-1/2">
            {/* Colonne gauche - les éléments à survoler */}
            <div className="w-1/2 flex gap-4 flex-col">
              <div
                className="relative flower h-44 group cursor-pointer translate-x-50 translate-y-30"
                onMouseEnter={() => setHovered("bandeaux")}
                onMouseLeave={() => setHovered(null)}
              >
                <Image
                  src={bandeau}
                  alt="bandeau miniature"
                  fill
                  className={`object-fill  rounded-full transition duration-300 ${hovered && hovered !== "bandeaux" ? "grayscale blur-sm opacity-50" : "scale-105"
                    }`}
                />
              </div>

              <div
                className="relative flower h-44 group cursor-pointer"
                onMouseEnter={() => setHovered("bonnets")}
                onMouseLeave={() => setHovered(null)}
              >
                <Image
                  src={bonnet}
                  alt="bonnet miniature"
                  fill
                  className={`object-fill rounded-full transition duration-300 ${hovered && hovered !== "bonnets" ? "grayscale blur-sm opacity-50" : "scale-105"
                    }`}
                />
              </div>

              <div
                className="relative flower h-44 group cursor-pointer translate-x-40 -translate-y-20"
                onMouseEnter={() => setHovered("accessoires")}
                onMouseLeave={() => setHovered(null)}
              >
                <Image
                  src={portecle}
                  alt="accessoire miniature"
                  fill
                  className={`object-fill rounded-full transition duration-300 ${hovered && hovered !== "accessoires" ? "grayscale blur-sm opacity-50" : "scale-105"
                    }`}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="w-screen overflow-x">
          les catégories • • • • • les catégories • • • • • les catégories • • • • • les catégories • • • • • les catégories • • • • • les catégories • • • • • les catégories • • • • • les catégories • • • • • les catégories • • • • • les catégories • • • • • les catégories • • • • • les catégories • • • • •
        </p>
      </section>
    </div >
  );
};

export default HomePage;