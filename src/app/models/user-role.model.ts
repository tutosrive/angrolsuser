import { Role } from './role.model';
import { User } from './user.model';

export class UserRole {
  id?: string;
  startAt?: Date;
  endtAt?: Date;
  users?: User[]; // n users
  roles?: Role[]; // n roles
}
