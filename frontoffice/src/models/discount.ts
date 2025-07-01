import { StrapiBase } from './base';

export type DiscountType = 'prix' | 'pourcentage';

export interface Discount extends StrapiBase {
  type: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  code: string;
}