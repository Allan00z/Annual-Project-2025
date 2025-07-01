import { StrapiBase } from './base';
import { Product } from './product';

export interface OrderedProduct extends StrapiBase {
  quantity: number;
  product?: Product;
}