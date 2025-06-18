'use client';
import { useEffect, useState } from 'react';

export default function Account() {
  const [articles, setArticles] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('http://localhost:1338/api/articles');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setArticles(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue');
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mon Compte</h1>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Données des articles (brutes)</h2>
        
        {isLoading && <p>Chargement des articles...</p>}
        
        {error && <p className="text-red-500">Erreur: {error}</p>}
        
        {articles && (
          <div className="p-4 rounded overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap">{JSON.stringify(articles, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
