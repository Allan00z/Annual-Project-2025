'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Article } from '../../../../../models/article';
import { ArticleCategory } from '../../../../../models/article-category';
import AuthService from '../../../../services/auth.service';

interface Props {
  params: { id: string };
}

export default function EditArticlePage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [readingTime, setReadingTime] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';

  useEffect(() => {
    // Check if the user has the 'owner' role
    const checkOwnerRole = async () => {
      const isUserOwner = await AuthService.checkUserRole('owner');
      setIsOwner(isUserOwner);

      if (!isUserOwner) {
        setError("Vous n'avez pas les droits pour modifier cet article");
        return;
      }

      fetchArticleAndCategories();
    };

    checkOwnerRole();
  }, [id]);

  // fetch the article and categories from Strapi 
  const fetchArticleAndCategories = async () => {
    try {
      setLoading(true);
      
      const articleResponse = await fetch(`${STRAPI_URL}/api/articles/${id}?populate=*`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });

      if (!articleResponse.ok) {
        throw new Error(`Erreur lors de la récupération de l'article (${articleResponse.status})`);
      }

      const { data } = await articleResponse.json();
      const articleData: Article = data;
      
      setArticle(articleData);
      setTitle(articleData.title);
      setDescription(articleData.description || '');
      setContent(articleData.content);
      setReadingTime(articleData.readingTime);

      if (articleData.article_category) {
        setCategoryId(articleData.article_category.id.toString());
      }

      const categoriesResponse = await fetch(`${STRAPI_URL}/api/article-categories`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });

      if (!categoriesResponse.ok) {
        throw new Error(`Erreur lors de la récupération des catégories (${categoriesResponse.status})`);
      }

      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to update the article
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isOwner) {
      setError("Vous n'avez pas les droits pour modifier cet article");
      return;
    }

    try {
      setSaving(true);

      const token = AuthService.getToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour modifier un article");
      }

      const response = await fetch(`${STRAPI_URL}/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title,
            description,
            content,
            readingTime,
            article_category: categoryId ? parseInt(categoryId) : null,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erreur lors de la mise à jour de l'article (${response.status})`);
      }

      router.push(`/blog/articles/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Chargement...</div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p>{error}</p>
          <div className="mt-4">
            <Link href={`/blog/articles/${id}`} className="text-pink-500 hover:text-pink-600 transition">
              Retourner à l'article
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
          <p>Vous n'avez pas les droits nécessaires pour modifier cet article.</p>
          <div className="mt-4">
            <Link href="/blog" className="text-pink-500 hover:text-pink-600 transition">
              Retourner à la liste des articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <Link href={`/blog/articles/${id}`} className="text-pink-500 hover:text-pink-600 transition inline-block">
          ← Retour à l'article
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Modifier l'article</h1>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">
            <strong>Note :</strong> L'ajout d'images pour l'article doit être fait directement via l'interface de Strapi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titre *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenu *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="readingTime" className="block text-sm font-medium text-gray-700">
                Temps de lecture (min) *
              </label>
              <input
                type="number"
                id="readingTime"
                min="1"
                value={readingTime}
                onChange={(e) => setReadingTime(parseInt(e.target.value, 10))}
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={`/blog/articles/${id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Sauvegarde en cours...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
