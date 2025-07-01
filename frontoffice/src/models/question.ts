import { StrapiBase } from './base';

export interface Question extends StrapiBase {
  title: string;
  answer: string;
}