import { StrapiBase } from './base';
import { Client } from './client';

export interface Comment extends StrapiBase {
  documentId: string;
  content: string;
  client?: Client;
}