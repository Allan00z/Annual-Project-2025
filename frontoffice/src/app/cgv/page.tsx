import type { CgvApiResponse, CgvSection, CgvSectionApiResponse } from "../../models/cgv";
import hauteAlpe from "../../medias/images/crochet-bg_files/haute-alpe.jpg";

interface CgvPageProps {}

/**
 * Récupère les données des CGV depuis l'API
 * @returns {Promise<CgvSection[]>} Les sections CGV triées par ordre
 * @throws {Error} Si la requête échoue
 */
async function getCgvData(): Promise<CgvSection[]> {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  try {
    const res = await fetch(`${STRAPI_URL}/api/cgv?populate=*`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch CGV data");
    }

    const data: CgvApiResponse = await res.json();
    const sections = data.data.sections || [];
    
    // Récupère les détails de chaque section
    const sectionsWithDetails = await Promise.all(
      sections.map(async (section) => {
        try {
          const sectionRes = await fetch(`${STRAPI_URL}/api/sections/${section.documentId}?populate=*`, {
            cache: "no-store",
          });
          
          if (!sectionRes.ok) {
            return section;
          }
          
          const sectionData: CgvSectionApiResponse = await sectionRes.json();
          return sectionData.data;
        } catch (error) {
          console.error(`Error fetching section ${section.documentId}:`, error);
          return section;
        }
      })
    );

    // Trie les sections par ordre
    return sectionsWithDetails.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error fetching CGV data:", error);
    throw error;
  }
}

export default async function CgvPage({}: CgvPageProps) {
  const cgvSections = await getCgvData();

  return (
    <div className="min-h-screen bg-base-100 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div 
          className="text-center mb-16 relative py-20 rounded-xl overflow-hidden"
          style={{
            backgroundImage: `url(${hauteAlpe.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Contenu du header */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              📋 Conditions Générales de Vente
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Découvrez les conditions générales de vente d'Audelweiss Craft
            </p>
          </div>
        </div>

        {/* Sections CGV */}
        <div className="space-y-8">
          {cgvSections.map((section) => (
            <div key={section.documentId} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#f7c0a6] mb-6">
                  {section.title}
                </h2>
                
                {/* Contenu de la section */}
                {section.content ? (
                  // Si la section a du contenu, l'afficher directement
                  <div className="prose prose-sm max-w-none">
                    {section.content.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="text-base-content/70 mb-3 last:mb-0">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                ) : (
                  // Si la section n'a pas de contenu, afficher les sous-sections
                  section.sections && section.sections.length > 0 && (
                    <div className="space-y-6">
                      {section.sections
                        .sort((a, b) => a.order - b.order)
                        .map((subsection) => (
                          <div
                            key={subsection.documentId}
                            className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow duration-300"
                          >
                            <div className="card-body">
                              <h3 className="card-title text-base-content mb-4">
                                {subsection.title}
                              </h3>
                              {subsection.content && (
                                <div className="prose prose-sm max-w-none">
                                  {subsection.content.split('\n').map((paragraph, index) => (
                                    paragraph.trim() && (
                                      <p key={index} className="text-base-content/70 mb-3 last:mb-0">
                                        {paragraph}
                                      </p>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
