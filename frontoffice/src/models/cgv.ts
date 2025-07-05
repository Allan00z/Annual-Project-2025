import { StrapiBase } from './base';

export interface CgvSection extends StrapiBase {
  documentId: string;
  title: string;
  content: string | null;
  order: number;
  sections?: CgvSection[];
}

export interface CgvData extends StrapiBase {
  documentId: string;
  sections: CgvSection[];
}

export interface CgvApiResponse {
  data: CgvData;
  meta: Record<string, any>;
}

export interface CgvSectionApiResponse {
  data: CgvSection;
  meta: Record<string, any>;
}
