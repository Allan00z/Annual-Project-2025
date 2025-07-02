"use client";

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArticleCategory } from '../../../models/article-category';
import { AuthService } from "../../services/auth.service";

export default function AddArticle() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [readingTime, setReadingTime] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  useEffect(() => {
    const checkRole = async () => {
        const owner = await AuthService.checkUserRole('owner');
        setIsOwner(owner);
    };
    checkRole();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
      const response = await fetch(`${STRAPI_URL}/api/article-categories`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des catégories: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      setError("Impossible de charger les catégories d'articles");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !content || !categoryId || readingTime <= 0) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
      const jwt = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
      
      const articleData = {
        title,
        description,
        content,
        reading_time: readingTime,
        article_category: Number(categoryId)
      };
      
      let articleId;
      const articleResponse = await fetch(`${STRAPI_URL}/api/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt && { 'Authorization': `Bearer ${jwt}` }),
        },
        body: JSON.stringify({ data: articleData }),
        credentials: 'include'
      });

      if (!articleResponse.ok) {
        const errorData = await articleResponse.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la création de l\'article');
      }

      const articleResult = await articleResponse.json();
      articleId = articleResult.data.id;
      
      router.push('/blog');
    } catch (error: any) {
      console.error("Erreur lors de la création de l'article:", error);
      setError(error.message || "Une erreur s'est produite lors de la création de l'article");
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="container mx-auto px-6 py-10 text-center">
        <p>Vérification des autorisations...</p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Ajouter un nouvel article</h1>
        <Link 
          href="/blog" 
          className="flex items-center text-pink-500 hover:text-pink-600"
        >
          &larr; Retour au blog
        </Link>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="mb-6">
          <label htmlFor="title" className="block mb-2 font-medium">
            Titre de l'article *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Titre de l'article"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="category" className="block mb-2 font-medium">
            Catégorie *
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block mb-2 font-medium">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Brève description de l'article"
            rows={3}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="content" className="block mb-2 font-medium">
            Contenu *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Contenu de l'article"
            rows={10}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="readingTime" className="block mb-2 font-medium">
            Temps de lecture estimé (minutes) *
          </label>
          <input
            type="number"
            id="readingTime"
            value={readingTime}
            onChange={(e) => setReadingTime(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Temps de lecture en minutes"
            min="1"
            required
          />
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">
            <strong>Note :</strong> L'ajout d'images pour l'article doit être fait directement via l'interface de Strapi.
          </p>
        </div>
        
        <div className="flex justify-end gap-4">
          <Link
            href="/blog"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
            disabled={loading}
          >
            {loading ? 'Création en cours...' : 'Créer l\'article'}
          </button>
        </div>
      </form>
    </section>
  );
}
