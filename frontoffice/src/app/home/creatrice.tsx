import Image from "next/image";
import bandeaux from "../../medias/images/Boutique/bandeaux-300x300.jpg.webp";
import creatrice from "../../medias/images/crochet-bg_files/4b016c7372b5440180c5e265eed458d1-scaled.webp";

const Creatrice = () => {
  return (
    <section className="container mx-auto py-20 px-15 flex flex-col md:flex-row items-center gap-10">
      {/* Partie texte */}
      <div className="flex flex-col md:w-1/2 space-y-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center md:text-left">
          À propos de la créatrice
        </h2>
        <p className="text-lg leading-relaxed text-justify">
          Je m’appelle Audrey, créatrice passionnée installée dans les
          Hautes-Alpes. Curieuse et toujours en quête de nouvelles idées,
          j’explore sans cesse différentes techniques et styles au crochet.
          Chaque pièce que je réalise reflète cette envie d’expérimentation et
          de créativité.
        </p>
        <p className="text-lg leading-relaxed text-justify">
          Je réalise également de la gravure (sur bois essentiellement, mais pas
          que !) ou du flocage pour personnaliser toute sorte d’objets et
          éléments de décoration.
        </p>
        <p className="text-lg leading-relaxed text-justify">
          Pour moi, chaque création est une aventure qui allie savoir-faire
          artisanal, inspiration locale et connexion intérieure. C’est cette
          approche inspirée de la montagne que je souhaite partager à travers
          mon univers.
        </p>
        <a href="/about" className="flex justify-center md:justify-start">
          <button className="btn border-none mt-6 bg-[#f7c0a6] text-white hover:bg-white hover:text-black transition">
            En savoir plus
          </button>
        </a>
      </div>

      {/* Partie image */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 md:w-1/2 mx-auto py-10 justify-center">
        {/* Image des bandeaux */}
        <div className="relative w-80 md:w-2/3 h-80 md:h-[500px]">
          <Image
            src={bandeaux}
            alt="bandeaux tricotés"
            fill
            className="object-cover rounded-4xl outline-[3px] outline-[#f7c0a6]"
          />
          {/* Image de la créatrice en forme ovale */}
          <div className="absolute w-48 h-64 md:w-64 md:h-80 rounded-4xl overflow-hidden -bottom-10 -right-5 md:-right-30 outline-[5px] outline-white">
            <Image src={creatrice} alt="créatrice" fill className="absolute object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Creatrice;
