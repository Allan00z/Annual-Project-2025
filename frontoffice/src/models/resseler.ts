import { StrapiBase, StrapiMedia } from './base';
import { Product } from './product';

export interface ResellerAddress {
  address: string;
  geohash: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Reseller extends StrapiBase {
  documentId: string;
  name: string;
  description: string;
  address: ResellerAddress;
  products?: Product[];
  image?: StrapiMedia & {
    formats?: {
      thumbnail?: StrapiMedia;
      small?: StrapiMedia;
    };
  };
}