import { StrapiBase } from './base';
import { Client } from './client';
import { OrderedProduct } from './ordered-product';

export interface Order extends StrapiBase {
  client?: Client;
  ordered_products?: OrderedProduct[];
}