import type { DeliveryApiResponse, Section, SectionApiResponse } from "../../models/delivery";
import hauteAlpe from "../../medias/images/crochet-bg_files/haute-alpe.jpg";

interface DeliveryPageProps {}

/**
 * Get delivery data from Strapi API.
 * @returns {Promise<Section[]>} A promise that resolves to an array of delivery sections.
 * @throws {Error} If the fetch operation fails or if the response is not ok.
 */
async function getDeliveryData(): Promise<Section[]> {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  try {
    const res = await fetch(`${STRAPI_URL}/api/delivery?populate=*`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch delivery data");
    }

    const data: DeliveryApiResponse = await res.json();
    const sections = data.data.sections || [];
    
    // Get detailed information for each section
    const sectionsWithDetails = await Promise.all(
      sections.map(async (section) => {
        try {
          const sectionRes = await fetch(`${STRAPI_URL}/api/sections/${section.documentId}?populate=*`, {
            cache: "no-store",
          });
          
          if (!sectionRes.ok) {
            return section;
          }
          
          const sectionData: SectionApiResponse = await sectionRes.json();
          return sectionData.data;
        } catch (error) {
          console.error(`Error fetching section ${section.documentId}:`, error);
          return section;
        }
      })
    );

    // Sort sections by order
    return sectionsWithDetails.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error fetching delivery data:", error);
    throw error;
  }
}

export default async function DeliveryPage({}: DeliveryPageProps) {
  const deliverySections = await getDeliveryData();

  return (
    <div className="min-h-screen bg-base-100 py-12">
      <div className="container mx-auto px-6">
        <div 
          className="text-center mb-16 relative py-20 rounded-xl overflow-hidden"
            style={{
                backgroundImage: `url(${hauteAlpe.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
          <div className="absolute inset-0 bg-black/50"></div>          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              🚚 Livraisons
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Découvrez nos différents modes de livraison pour recevoir vos créations tricotées avec soin
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {deliverySections.map((section) => (
            <div key={section.documentId} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#f7c0a6] mb-6">
                  {section.title}
                </h2>
                
                {section.content ? (
                  <div className="prose prose-sm max-w-none">
                    {section.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-base-content/70 mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  section.sections && section.sections.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
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
                                    <p key={index} className="text-base-content/70 mb-3 last:mb-0">
                                      {paragraph}
                                    </p>
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

        <div className="mt-16 card bg-[#f7c0a6] shadow-xl">
          <div className="card-body">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-black mb-4">
            💡 Informations importantes
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📦</span>
              <div>
                <h4 className="font-semibold text-black mb-2">Emballage soigné</h4>
                <p className="text-black/80">
                  Chaque commande est emballée avec soin pour protéger vos créations pendant le transport.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📞</span>
              <div>
                <h4 className="font-semibold text-black mb-2">Besoin d'aide&nbsp;?</h4>
                <p className="text-black/80">
                  Une question sur la livraison&nbsp;?{" "}
                  <a href="/contact" className="underline text-black font-semibold hover:text-base-200">
                Contactez-moi
                  </a>
                  .
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🏔️</span>
              <div>
                <h4 className="font-semibold text-black mb-2">Fait dans les Alpes</h4>
                <p className="text-black/80">
                  Toutes nos créations sont fabriquées artisanalement dans les Hautes-Alpes.
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
