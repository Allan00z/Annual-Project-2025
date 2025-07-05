import { StrapiBase } from './base';

export interface TermsAndConditionSection extends StrapiBase {
  documentId: string;
  title: string;
  content: string | null;
  order: number;
  sections?: TermsAndConditionSection[];
}

export interface TermsAndConditionData extends StrapiBase {
  documentId: string;
  sections: TermsAndConditionSection[];
}

export interface TermsAndConditionApiResponse {
  data: TermsAndConditionData;
  meta: Record<string, any>;
}

export interface TermsAndConditionSectionApiResponse {
  data: TermsAndConditionSection;
  meta: Record<string, any>;
}
