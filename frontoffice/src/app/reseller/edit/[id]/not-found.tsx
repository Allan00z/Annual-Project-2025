import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <svg 
            className="w-24 h-24 mx-auto text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
            />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Revendeur introuvable
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Le revendeur que vous recherchez n'existe pas ou a été supprimé.
        </p>
        
        <Link
          href="/reseller"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Retour aux revendeurs
        </Link>
      </div>
    </section>
  );
}
