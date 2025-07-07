"use client";

import handwithcrochet from "../../medias/images/crochet-bg_files/4b016c7372b5440180c5e265eed458d1-scaled.webp";
import CarouselComponent from "@/component/carousel.component";

const Hero = () => {


  return (
    <>
      {/* HERO SECTION */}
      <section
        className="relative bg-cover bg-center h-180 flex items-center rounded-xl"
        style={{ backgroundImage: `url(${handwithcrochet.src})` }}
      >
        <div className="relative container mx-auto px-6 md:px-10">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[#f7c0a6]">
              Des créations <span className="text-white">uniques</span> au crochet
            </h1>
            <p className="mt-4 text-lg text-white">
              Chaque pièce est soigneusement confectionnée à la main dans les Hautes-Alpes.
            </p>
            <a href="/shop">
              <button className="btn border-none mt-6 bg-[#F7C0A6] text-white hover:bg-white hover:text-black transition rounded-md cursor-pointer">
                Découvrir la boutique
              </button>
            </a>
          </div>
        </div>
      </section>
      <CarouselComponent />
    </>
  );
};

export default Hero;
