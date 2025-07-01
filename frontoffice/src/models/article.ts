import { StrapiBase, StrapiMedia } from './base';
import { ArticleCategory } from './article-category';
import { Comment } from './comment';

export interface Article extends StrapiBase {
  title: string;
  description: string;
  content: string;
  readingTime: number;
  image?: StrapiMedia;
  article_category?: ArticleCategory;
  comments?: Comment[];
}