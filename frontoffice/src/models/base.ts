export interface StrapiBase {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface StrapiMedia {
  id: number;
  name: string;
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

export interface LocationPicker {
  lat: number;
  lng: number;
  address?: string;
}