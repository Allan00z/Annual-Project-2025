import type { TermsAndConditionApiResponse, TermsAndConditionSection, TermsAndConditionSectionApiResponse } from "../../models/terms-and-condition";
import hauteAlpe from "../../medias/images/crochet-bg_files/haute-alpe.jpg";

interface TermsAndConditionPageProps {}

/**
 * Récupère les données des mentions légales depuis l'API
 * @returns {Promise<TermsAndConditionSection[]>} Les sections de mentions légales triées par ordre
 * @throws {Error} Si la requête échoue
 */
async function getTermsAndConditionData(): Promise<TermsAndConditionSection[]> {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  try {
    const res = await fetch(`${STRAPI_URL}/api/terms-and-condition?populate=*`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch terms and condition data");
    }

    const data: TermsAndConditionApiResponse = await res.json();
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
          
          const sectionData: TermsAndConditionSectionApiResponse = await sectionRes.json();
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
    console.error("Error fetching terms and condition data:", error);
    throw error;
  }
}

export default async function TermsAndConditionPage({}: TermsAndConditionPageProps) {
  const termsAndConditionSections = await getTermsAndConditionData();

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
              📄 Mentions Légales
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Informations légales concernant le site Audelweiss Craft
            </p>
          </div>
        </div>

        {/* Sections des mentions légales */}
        <div className="space-y-8">
          {termsAndConditionSections.map((section) => (
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

        {/* Section informative supplémentaire */}
        <div className="mt-16 card bg-[#f7c0a6] shadow-xl">
          <div className="card-body">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-black mb-4">
                💡 Informations de contact
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h4 className="font-semibold text-black mb-2">Email</h4>
                    <p className="text-black/80">
                      contact@audelweiss.fr
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h4 className="font-semibold text-black mb-2">Entreprise</h4>
                    <p className="text-black/80">
                      Audelweiss Craft<br />
                      SIRET : 83275167100047
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <h4 className="font-semibold text-black mb-2">Droit applicable</h4>
                    <p className="text-black/80">
                      Droit français - Tribunaux compétents français
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
