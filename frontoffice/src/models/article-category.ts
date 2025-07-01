import { StrapiBase } from './base';

export interface ArticleCategory extends StrapiBase {
  documentId: string;
  name: string;
  description: string;
}