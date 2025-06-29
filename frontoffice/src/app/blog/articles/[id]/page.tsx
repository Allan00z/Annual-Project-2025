// app/blog/articles/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import pelote from "../../../../medias/images/crochet-bg_files/0b0bc07c-1615-4152-b893-770a637929dc.webp";

// Interface pour typer les catégories d'articles
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

interface Props {
  params: { id: string };
}

export default function ArticlePage({ params }: Props) {
  const { id } = params;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';

  useEffect(() => {
    async function fetchArticle() {
      try {        
        setLoading(true);
        const response = await fetch(`${STRAPI_URL}/api/articles/${id}?populate=*`);
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération de l'article (${response.status})`);
        }
        
        const { data } = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Chargement de l'article...</div>
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
            <Link href="/blog" className="text-pink-500 hover:text-pink-600 transition">
              Retourner à la liste des articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article introuvable</h2>
          <div className="mt-4">
            <Link href="/blog" className="text-pink-500 hover:text-pink-600 transition">
              Retourner à la liste des articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formater la date de publication
  const publishDate = new Date(article.publishedAt);
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(publishDate);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Link href="/blog" className="text-pink-500 hover:text-pink-600 transition mb-8 inline-block">
        ← Retour aux articles
      </Link>
        <article className="prose lg:prose-xl mx-auto">
        {article.article_category && (
          <span className={`inline-block text-white text-xs font-medium px-3 py-1 rounded mb-4 ${
            article.article_category.name === "News" ? "bg-blue-600" :
            article.article_category.name === "Technologie" ? "bg-green-600" :
            article.article_category.name === "Mode de vie" ? "bg-purple-600" : "bg-black"
          }`}>
            {article.article_category.name}
          </span>
        )}
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex items-center text-gray-600 mb-8">
          <span>Publié le {formattedDate}</span>
          <span className="mx-2">•</span>
          <span>Temps de lecture: {article.readingTime} min</span>
        </div>
          {article.description && (
          <div className="bg-gray-100 p-4 rounded-lg mb-8 italic">
            {article.description}
          </div>
        )}
        <div className="mb-8 mx-auto max-w-2xl">
          <Image
            src={article.image && article.image.url ? 
              `${STRAPI_URL}${article.image.url}` : 
              pelote
            }
            alt={article.title}
            width={650}
            height={350}
            className="rounded-lg w-full h-auto object-cover"
            priority
          />
        </div>
        
        <div className="mt-8 leading-relaxed">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}