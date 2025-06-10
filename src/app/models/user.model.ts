import { Address } from './address.model';
import { Password } from './password.model';
import { Profile } from './profile.model';
import { Role } from './role.model';

export class User {
  id?: number;
  name?: string;
  email: string;
  password: string; // No tengo claro si es de tipo "Password" o string
  token?: string;
  address?: Address;
  profile?: Profile;
  roles?: Role[];
}
