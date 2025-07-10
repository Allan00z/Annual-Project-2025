import { StrapiBase } from './base';
import { ProductCategory } from './product-category';
import { Option } from './option';
import { Discount } from './discount';
import { Feedback } from './feedback';

export interface Product extends StrapiBase {
  name: string;
  description: string;
  price: number;
  product_categories?: ProductCategory[];
  options?: Option[];
  discounts?: Discount[];
  feedbacks?: Feedback[];
}