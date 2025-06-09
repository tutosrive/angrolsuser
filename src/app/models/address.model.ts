import { User } from './user.model';

export class Address {
  user?: User;
  id?: number;
  street?: string;
  number?: string;
  latitude?: number;
  longitude?: number;
}
