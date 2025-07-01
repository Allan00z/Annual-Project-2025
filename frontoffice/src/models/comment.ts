import { StrapiBase } from './base';
import { Client } from './client';

export interface Comment extends StrapiBase {
  content: string;
  client?: Client;
}