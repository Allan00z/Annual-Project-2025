import { StrapiBase } from './base';
import { Client } from './client';
import { OrderedProduct } from './ordered-product';

export interface Order extends StrapiBase {
  done?: boolean;
  client?: Client;
  ordered_products?: OrderedProduct[];
}