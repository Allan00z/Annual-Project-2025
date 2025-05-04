import Image from "next/image";
import bonnet from "../../medias/images/crochet-bg_files/bonnet-avec-pompom.jpg.webp";
import montagne from "../../medias/images/crochet-bg_files/montagne.svg";
import crochet from "../../medias/images/crochet-bg_files/crochet.svg";
import reiki from "../../medias/images/crochet-bg_files/reiki.svg";
import bandeaux from "../../medias/images/Boutique – Créations artisanales uniques faites à la main – Audelweiss Craft_files/bandeaux-300x300.jpg.webp";
import creatrice from "../../medias/images/crochet-bg_files/4b016c7372b5440180c5e265eed458d1-scaled.webp";

export default function About() {
  return (
    <section>
      <div className="container mx-auto py-20 px-6 flex flex-col md:flex-row-reverse items-center gap-10 ">
        {/* Partie texte */}
        <div className="flex flex-col md:w-1/2 space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center md:text-left">
            À propos de la créatrice
          </h2>
          <p className="text-lg leading-relaxed text-justify">
            Je m’appelle Audrey, créatrice de la marque @audelweiss.craft.
          </p>
          <p className="text-lg leading-relaxed text-justify">
            J’ai grandi à Embrun, une petite ville nichée au cœur des
            Hautes-Alpes, entourée de montagnes et de paysages grandioses. Ces
            racines alpines ont forgé mon amour de la nature et de
            l’authenticité, des valeurs qui m’accompagnent toujours aujourd’hui.
          </p>
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
            <div className="absolute w-48 h-64 md:w-64 md:h-80 rounded-4xl overflow-hidden -bottom-10 -left-2 md:-left-10 outline-[5px] outline-white">
              <Image
                src={creatrice}
                alt="créatrice"
                fill
                className="absolute object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-20 px-6 flex flex-col md:flex-row md:justify-center md:items-stretch gap-10">
        {/* Card 1 */}
        <div className="relative flex flex-col items-center w-full md:w-1/3">
          <div className="card bg-base-100 w-full">
            <div className="card-body">
              <h2 className="text-4xl text-[#f7c0a6] pb-3">01</h2>
              <div className="badge text-2xl mb-5 font-medium">
                ARTISANAT EMBRUNAIS
              </div>
              <p className="text-xl">
                Je vis dans les Hautes-Alpes, un cadre qui m’inspire chaque
                jour. Toutes mes créations sont réalisées ici, à la main, avec
                des matériaux choisis avec soin.
              </p>
            </div>
          </div>
          <Image
            src={montagne}
            alt="Montagne"
            className="-translate-y-1/2 md:block w-32"
          />
        </div>

        {/* Card 2 */}
        <div className="relative flex flex-col items-center w-full md:w-1/3 md:translate-y-10">
          <div className="card bg-base-100 w-full">
            <div className="card-body">
              <h2 className="text-4xl text-[#f7c0a6] pb-3">02</h2>
              <div className="badge text-2xl mb-5 font-medium">
                ÉDITIONS LIMITÉES ET SUR-MESURE
              </div>
              <p className="text-xl">
                Je suis une créatrice curieuse, toujours en quête de nouvelles
                idées. Cette envie d’explorer donne naissance à des pièces
                variées : petites séries ou sur-mesure.
              </p>
            </div>
          </div>
          <Image
            src={crochet}
            alt="Crochet"
            className="-translate-y-1/2 md:block w-32"
          />
        </div>

        {/* Card 3 */}
        <div className="relative flex flex-col items-center w-full md:w-1/3">
          <div className="card bg-base-100 w-full">
            <div className="card-body">
              <h2 className="text-4xl text-[#f7c0a6] pb-3">03</h2>
              <div className="badge text-2xl mb-5 font-medium">
                ÉNERGIE ET BIEN-ÊTRE AVEC LE REIKI
              </div>
              <p className="text-xl">
                Depuis 2021, je suis certifiée praticienne Reiki. J'infuse mes
                créations d'intentions positives pour vous apporter bien-être et
                harmonie.
              </p>
            </div>
          </div>
          <Image
            src={reiki}
            alt="Reiki"
            className="-translate-y-1/2 md:block w-32"
          />
        </div>
      </div>
      <div className="container mx-auto py-20 px-6 flex flex-col md:flex-row items-center gap-10">
        {/* Partie texte */}
        <div className="flex flex-col md:w-1/2 space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center md:text-left">
            Mon parcours professionnel
          </h2>
          <p className="text-lg leading-relaxed text-justify">
            Après des études en informatique et en création de sites internet,
            je me suis installée à Lyon pour développer mes compétences dans le
            digital. Le web, en constante évolution, m’a permis d’explorer la
            création sous diverses formes, alliant technique et esthétique.
            Cette immersion dans la conception digitale a posé les bases de ma
            démarche artistique. Aujourd’hui freelance spécialisée en
            développement web et design UI/UX, je transmets également mon savoir
            en tant que formatrice.
          </p>
          <p className="text-lg leading-relaxed text-justify">
            Cette aventure créative s’est enrichie avec ma découverte du
            crochet, une nouvelle forme d’expression artistique qui me permet
            d’allier matières, couleurs et énergie.
          </p>
          <a href="/about">
            <button className="btn btn-primary mt-6 bg-black text-white border-black hover:bg-white hover:text-black transition">
              Découvrir mon site freelance
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
            <div className="absolute w-48 h-64 md:w-64 md:h-80 rounded-4xl overflow-hidden -bottom-10 -right-2 md:-right-20 outline-[5px] outline-white">
              <Image
                src={creatrice}
                alt="créatrice"
                fill
                className="absolute object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
