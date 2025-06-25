import { Question, QuestionsResponse } from './types';
import FaqClientComponent from './faq-client-component';

async function getQuestions(): Promise<Question[]> {
  try {
    const response = await fetch('http://localhost:1338/api/questions', { 
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