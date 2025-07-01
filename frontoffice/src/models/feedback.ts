import { StrapiBase } from './base';
import { Client } from './client';
import { Product } from './product';

export interface Feedback extends StrapiBase {
  grade: number;
  content: string;
  client?: Client;
  product?: Product;
}