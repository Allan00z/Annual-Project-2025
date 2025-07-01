import Image from "next/image";
import type { About } from "../../models/about";
import montagne from "../../medias/images/crochet-bg_files/montagne.svg";
import crochet from "../../medias/images/crochet-bg_files/crochet.svg";
import reiki from "../../medias/images/crochet-bg_files/reiki.svg";
import bandeaux from "../../medias/images/Boutique/bandeaux-300x300.jpg.webp";
import creatrice from "../../medias/images/crochet-bg_files/4b016c7372b5440180c5e265eed458d1-scaled.webp";

interface ApiResponse {
  data: About;
  meta: Record<string, any>;
}

/**
 * Get the "About" data from the API
 * @returns {Promise<About>} Les données de la page "À propos"
 * @throws {Error} Si la requête échoue
 */
async function getAboutData(): Promise<About> {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  try {
    const res = await fetch(`${STRAPI_URL}/api/about`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data: ApiResponse = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching about data:", error);
    throw error;
  }
}

export default async function About() {
  const aboutData = await getAboutData();

  return (
    <section>
      <div className="container mx-auto py-20 px-6 flex flex-col md:flex-row-reverse items-center gap-10 ">
        <div className="flex flex-col md:w-1/2 space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center md:text-left">
            {aboutData.aboutMeTitle}
          </h2>
          {aboutData.aboutMe.split("\n\n").map((paragraph: string, index: number) => (
            <p key={index} className="text-lg leading-relaxed text-justify">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 md:w-1/2 mx-auto py-10 justify-center">
          <div className="relative w-80 md:w-2/3 h-80 md:h-[500px]">
            <Image
              src={bandeaux}
              alt="bandeaux tricotés"
              fill
              className="object-cover rounded-4xl outline-[3px] outline-[#f7c0a6]"
            />
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
        <div className="relative flex flex-col items-center w-full md:w-1/3">
          <div className="card bg-base-100 w-full">
            <div className="card-body">
              <h2 className="text-4xl text-[#f7c0a6] pb-3">01</h2>
              <div className="badge text-2xl mb-5 font-medium">
                {aboutData.pro1Title}
              </div>
              <p className="text-xl">{aboutData.pro1}</p>
            </div>
          </div>
          <Image
            src={montagne}
            alt="Montagne"
            className="-translate-y-1/2 md:block w-32"
          />
        </div>

        <div className="relative flex flex-col items-center w-full md:w-1/3 md:translate-y-10">
          <div className="card bg-base-100 w-full">
            <div className="card-body">
              <h2 className="text-4xl text-[#f7c0a6] pb-3">02</h2>
              <div className="badge text-2xl mb-5 font-medium">
                {aboutData.pro2Title}
              </div>
              <p className="text-xl">{aboutData.pro2}</p>
            </div>
          </div>
          <Image
            src={crochet}
            alt="Crochet"
            className="-translate-y-1/2 md:block w-32"
          />
        </div>

        <div className="relative flex flex-col items-center w-full md:w-1/3">
          <div className="card bg-base-100 w-full">
            <div className="card-body">
              <h2 className="text-4xl text-[#f7c0a6] pb-3">03</h2>
              <div className="badge text-2xl mb-5 font-medium">
                {aboutData.pro3Title}
              </div>
              <p className="text-xl">{aboutData.pro3}</p>
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
        <div className="flex flex-col md:w-1/2 space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center md:text-left">
            {aboutData.proBackgroundTitle}
          </h2>
          {aboutData.proBackground.split("\n\n").map((paragraph: string, index: number) => (
            <p key={index} className="text-lg leading-relaxed text-justify">
              {paragraph}
            </p>
          ))}
          <a href="/about">
            <button className="btn btn-primary mt-6 bg-black text-white border-black hover:bg-white hover:text-black transition">
              Découvrir mon site freelance
            </button>
          </a>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 md:w-1/2 mx-auto py-10 justify-center">
          <div className="relative w-80 md:w-2/3 h-80 md:h-[500px]">
            <Image
              src={bandeaux}
              alt="bandeaux tricotés"
              fill
              className="object-cover rounded-4xl outline-[3px] outline-[#f7c0a6]"
            />
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
