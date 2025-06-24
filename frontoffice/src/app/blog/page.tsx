import Image from "next/image";
import Link from "next/link";
import pelote from "../../medias/images/crochet-bg_files/0b0bc07c-1615-4152-b893-770a637929dc.webp";

interface ArticleCategory {
  id: number;
  documentId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface Article {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  description: string;
  content: string;
  readingTime: number;
  article_category: ArticleCategory;
  image?: {
    url: string;
    formats?: {
      thumbnail?: {
        url: string;
      }
    }
  } | null;
}

interface ArticlesResponse {
  data: Article[];
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
 * Get articles with optional pagination, search, and category filter.
 * @param page - The page number for pagination (default is 1).
 * @param pageSize - The number of articles per page (default is 6).
 * @param search - Optional search term to filter articles by title or description. 
 * @param categoryId - Optional category ID to filter articles by category.
 * @returns A promise that resolves to an object containing the articles and pagination metadata.
 */
async function getArticles(page: number = 1, pageSize: number = 5, search?: string, categoryId?: number): Promise<ArticlesResponse> {
  try {
    // Build the URL for fetching articles with pagination and optional filters
    let url = `http://localhost:1338/api/articles?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    
    // Add search filter if present
    if (search) {
      url += `&filters[$or][0][title][$containsi]=${encodeURIComponent(search)}`;
      url += `&filters[$or][1][description][$containsi]=${encodeURIComponent(search)}`;
    }
    
    // Add category filter if present
    if (categoryId) {
      url += `&filters[article_category][id]=${categoryId}`;
    }

    // Fetch articles from the API
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des articles: ${response.status}`);
    }

    // Return the articles and pagination metadata
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    return { data: [], meta: { pagination: { page: 1, pageSize, pageCount: 0, total: 0 } } };
  }
}

/**
 * Get all article categories.
 * @return A promise that resolves to an array of article categories.
 */
async function getCategories(): Promise<ArticleCategory[]> {
  try {
    // Fetch article categories from the API
    const response = await fetch("http://localhost:1338/api/article-categories", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des catégories: ${response.status}`);
    }

    // Return the categories data
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
}

/**
 * Calculate the estimated reading time for an article if not provided.
 * @param article - The article object containing content.
 * @return The estimated reading time in minutes.
 */
function getReadingTime(article: Article): number {
  if (article.readingTime !== undefined) {
    return article.readingTime;
  }
  const words = article.content.trim().split(/\s+/).length;
  return Math.ceil(words / 160);
}

/**
 * Format a date string to a localized French date format.
 * @param dateString - The date string to format.
 * @return The formatted date string in "dd/mm/yyyy" format.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function Blog({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract pagination, search, and category from searchParams
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const categoryId = typeof searchParams.category === 'string' ? parseInt(searchParams.category) : undefined;
  const pageSize = 5;

  // Fetch articles and categories based on the provided parameters
  const articlesResponse = await getArticles(page, pageSize, search, categoryId);
  const categories = await getCategories();
  const { data: articles, meta } = articlesResponse;

  return (
    <section>
      <div className="flex flex-col p-10">
        <h1 className="m-auto text-center text-5xl p-6">BLOG</h1>
        <p className="m-auto text-center">
          Actualités ou simplement informations complémentaires à mes créations
          😊
        </p>
      </div>

      <div className="container mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <form className="w-full md:w-1/2" action="/blog" method="get">
            <div className="relative">
              <input 
          type="text" 
          name="search" 
          placeholder="Rechercher un article..." 
          defaultValue={search || ''}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button 
          type="submit" 
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-pink-500"
          style={{ top: '50%' }}
              >
          🔍
              </button>
            </div>
            {categoryId && <input type="hidden" name="category" value={categoryId} />}
          </form>

          <div className="flex flex-wrap gap-2 items-center">
            <Link 
              href="/blog" 
              className={`flex items-center justify-center px-3 py-1 text-sm rounded-full ${!categoryId ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Tous
            </Link>
            {categories.map((category) => (
              <Link 
          key={category.id}
          href={`/blog?category=${category.id}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
          className={`flex items-center justify-center px-3 py-1 text-sm rounded-full ${categoryId === category.id ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
          {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="container mx-auto py-10 px-6 text-center">
          <p>Aucun article disponible pour le moment.</p>
        </div>
      ) : (
        articles.map((article, index) => (
          <div key={article.id} className="container mx-auto py-10 px-6">
            <div className={`${index % 2 === 0 ? 'flex flex-col md:flex-row' : 'flex flex-col md:flex-row-reverse'} gap-10 items-center`}>
              <div className={`${index % 2 === 0 ? 'md:w-1/2' : 'md:w-1/2'}`}>
                <span className={`inline-block text-white text-xs font-medium px-3 py-1 rounded mb-4 ${
                  article.article_category ? 
                    (article.article_category.name === "News" ? "bg-blue-600" :
                     article.article_category.name === "Technologie" ? "bg-green-600" :
                     article.article_category.name === "Mode de vie" ? "bg-purple-600" : "bg-black")
                   : "bg-black"
                }`}>
                  {article.article_category ? article.article_category.name : "Article"}
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold mb-3">
                  {article.title}
                </h2>
                <p className="text-sm text-pink-500 mb-4">
                  {(!article.publishedAt || article.publishedAt === article.updatedAt) ? 
                    <>Mis à jour le {formatDate(article.updatedAt)}</> : 
                    <>Publié le {formatDate(article.publishedAt)}</>
                  } | {getReadingTime(article)} minutes de lecture estimées
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {article.description}
                </p>
                <Link
                  href={`/blog/articles/${article.documentId}`}
                  className="text-pink-500 font-medium underline underline-offset-4 hover:text-pink-600 transition"
                >
                  Lire l'article
                </Link>
              </div>
              <div className={`w-full md:w-1/2`}>
                <Image
                  src={article.image && article.image.url ? 
                    `http://localhost:1338${article.image.url}` : 
                    pelote
                  }
                  alt={article.title}
                  className="rounded-lg object-cover w-full h-auto"
                  width={500}
                  height={400}
                  priority
                />
              </div>
            </div>
          </div>
        ))
      )}
      
      {meta.pagination.pageCount > 1 && (
        <div className="container mx-auto px-6 py-10 flex justify-center items-center">
          <nav className="flex items-center gap-1">
            {meta.pagination.page > 1 && (
              <Link
                href={`/blog?page=${meta.pagination.page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${categoryId ? `&category=${categoryId}` : ''}`}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
              >
                &laquo; Précédent
              </Link>
            )}
            
            {Array.from({ length: meta.pagination.pageCount }, (_, i) => i + 1).map(pageNum => (
              <Link
                key={pageNum}
                href={`/blog?page=${pageNum}${search ? `&search=${encodeURIComponent(search)}` : ''}${categoryId ? `&category=${categoryId}` : ''}`}
                className={`px-3 py-1 rounded ${pageNum === meta.pagination.page 
                  ? 'bg-pink-500 text-white' 
                  : 'border border-gray-300 hover:bg-gray-100'}`}
              >
                {pageNum}
              </Link>
            ))}
            
            {meta.pagination.page < meta.pagination.pageCount && (
              <Link
                href={`/blog?page=${meta.pagination.page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${categoryId ? `&category=${categoryId}` : ''}`}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
              >
                Suivant &raquo;
              </Link>
            )}
          </nav>
        </div>
      )}
      
      <div className="container mx-auto px-6 pb-10 text-center text-sm text-gray-500">
        {search && (
          <p>Résultats de recherche pour: "{search}"</p>
        )}
        <p>
          Affichage de {articles.length} article{articles.length > 1 ? 's' : ''} sur {meta.pagination.total} au total
          {categoryId ? ' (filtrés par catégorie)' : ''}
        </p>
      </div>
    </section>
  );
}
