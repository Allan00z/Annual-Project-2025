import { StrapiBase } from './base';

export interface User extends StrapiBase {
  username: string;
  email: string;
  provider?: string;
  confirmed: boolean;
  blocked: boolean;
}