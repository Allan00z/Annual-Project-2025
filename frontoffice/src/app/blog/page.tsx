import Image from "next/image";
import Link from "next/link";
import pelote from "../../medias/images/crochet-bg_files/0b0bc07c-1615-4152-b893-770a637929dc.webp";

export default function Blog() {
  return (
    <section>
      <div className="flex flex-col p-10">
        <h1 className="m-auto text-center text-5xl p-6">BLOG</h1>
        <p className="m-auto text-center">
          Actualités ou simplement informations complémentaires à mes créations
          😊
        </p>
      </div>
      <div className="container mx-auto py-20 px-6">
        <div className="flex flex-col md:flex-row-reverse gap-10 items-center">
          {/* Left content */}
          <div>
            <span className="inline-block bg-black text-white text-xs font-medium px-3 py-1 rounded mb-4">
              Matériel
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              Addi King Size vs Sentro 48 : quelle machine choisir pour tes
              projets créatifs ?
            </h2>
            <p className="text-sm text-pink-500 mb-4">
              04/04/2025 | 6 minutes de lecture estimées
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Tu rêves de réaliser des bonnets, écharpes, bandeaux et autres
              créations en un temps record ? Tu as peut-être vu passer des
              vidéos virales de tricot circulaire avec des machines comme la
              Sentro 48 ou la Addi King Size.
            </p>
            <Link
              href="/blog/articles/1"
              className="text-pink-500 font-medium underline underline-offset-4 hover:text-pink-600 transition"
            >
              Lire l'article
            </Link>
          </div>

          {/* Right image */}
          <div className="w-full">
            <Image
              src={pelote}
              alt="Addi et Sentro machines à tricoter"
              className="rounded-lg object-cover w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto py-20 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left content */}
          <div>
            <span className="inline-block bg-black text-white text-xs font-medium px-3 py-1 rounded mb-4">
              Matériel
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              Addi King Size vs Sentro 48 : quelle machine choisir pour tes
              projets créatifs ?
            </h2>
            <p className="text-sm text-pink-500 mb-4">
              04/04/2025 | 6 minutes de lecture estimées
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Tu rêves de réaliser des bonnets, écharpes, bandeaux et autres
              créations en un temps record ? Tu as peut-être vu passer des
              vidéos virales de tricot circulaire avec des machines comme la
              Sentro 48 ou la Addi King Size.
            </p>
            <Link
              href="/blog/articles/2"
              className="text-pink-500 font-medium underline underline-offset-4 hover:text-pink-600 transition"
            >
              Lire l'article
            </Link>
          </div>

          {/* Right image */}
          <div className="w-full">
            <Image
              src={pelote}
              alt="Addi et Sentro machines à tricoter"
              className="rounded-lg object-cover w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto py-20 px-6">
        <div className="flex flex-col md:flex-row-reverse gap-10 items-center">
          {/* Left content */}
          <div>
            <span className="inline-block bg-black text-white text-xs font-medium px-3 py-1 rounded mb-4">
              Matériel
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              Addi King Size vs Sentro 48 : quelle machine choisir pour tes
              projets créatifs ?
            </h2>
            <p className="text-sm text-pink-500 mb-4">
              04/04/2025 | 6 minutes de lecture estimées
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Tu rêves de réaliser des bonnets, écharpes, bandeaux et autres
              créations en un temps record ? Tu as peut-être vu passer des
              vidéos virales de tricot circulaire avec des machines comme la
              Sentro 48 ou la Addi King Size.
            </p>
            <Link
              href="/blog/articles/3"
              className="text-pink-500 font-medium underline underline-offset-4 hover:text-pink-600 transition"
            >
              Lire l'article
            </Link>
          </div>

          {/* Right image */}
          <div className="w-full">
            <Image
              src={pelote}
              alt="Addi et Sentro machines à tricoter"
              className="rounded-lg object-cover w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
