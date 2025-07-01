import { StrapiBase, LocationPicker } from './base';
import { User } from './user';

export interface Client extends StrapiBase {
  firstname: string;
  lastname: string;
  deliveryAddress?: LocationPicker;
  billingAddress?: LocationPicker;
  users_permissions_user?: User;
}