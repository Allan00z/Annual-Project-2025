import { StrapiBase } from './base';
import { Product } from './product';
import { Option } from './option';

export interface OrderedProduct extends StrapiBase {
  quantity: number;
  product?: Product;
  option?: Option;
}