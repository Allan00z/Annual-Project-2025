import { StrapiBase } from './base';

export interface Section extends StrapiBase {
  documentId: string;
  title: string;
  content: string | null;
  order: number;
  sections?: Section[];
}

export interface DeliveryData extends StrapiBase {
  documentId: string;
  sections: Section[];
}

export interface DeliveryApiResponse {
  data: DeliveryData;
  meta: Record<string, any>;
}

export interface SectionApiResponse {
  data: Section;
  meta: Record<string, any>;
}
