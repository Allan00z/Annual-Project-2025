import { StrapiBase, StrapiMedia } from './base';
import { ArticleCategory } from './article-category';
import { Comment } from './comment';

export interface Article extends StrapiBase {
  documentId: string;
  title: string;
  description: string;
  content: string;
  readingTime: number;
  image?: (StrapiMedia & {
    formats?: {
      thumbnail?: {
        url: string;
      }
    }
  }) | null;
  article_category?: ArticleCategory;
  comments?: Comment[];
}