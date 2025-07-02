import { StrapiBase } from './base';

export interface ContactMsg extends StrapiBase {
    documentId: string;
    firstname: string;
    lastname: string;
    email: string;
    content: string;
}