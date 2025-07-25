import { Question } from '../../models/question';
import FaqClientComponent from './faq-client-component';

export interface QuestionsResponse {
  data: Question[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

/**
 * Gets the list of questions from the Strapi API.
 * @returns {Promise<Question[]>} A promise that resolves to an array of questions.
 * @throws {Error} If the fetch operation fails or the response is not ok.
 */
async function getQuestions(): Promise<Question[]> {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  try {
    const response = await fetch(`${STRAPI_URL}/api/questions`, { 
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      throw new Error('Impossible de récupérer les questions');
    }

    const data: QuestionsResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    return [];
  }
}

export default async function Faq() {
  const questions = await getQuestions();

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-orange-500">Foire Aux Questions</h1>
        <p className="text-xl text-center text-gray-600 mb-12">Trouvez les réponses aux questions les plus fréquentes</p>
        
        <div className="max-w-3xl mx-auto">
          {questions.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-xl text-gray-600">Aucune question disponible pour le moment.</p>
            </div>
          ) : (
            <FaqClientComponent questions={questions} />
          )}
        </div>
      </div>
    </div>
  );
}