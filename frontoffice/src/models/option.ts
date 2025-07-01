import { StrapiBase } from './base';

export interface Option extends StrapiBase {
  name: string;
  priceModifier: number;
}