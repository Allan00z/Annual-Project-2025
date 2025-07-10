import { StrapiBase } from './base';

export interface User extends StrapiBase {
  username: string;
  email: string;
  provider?: string;
  confirmed: boolean;
  blocked: boolean;
  role?: {
    id: number;
    name: string;
    description: string;
    type: string;
  };
}