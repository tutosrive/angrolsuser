import { User } from './user.model';

export class Role {
  id?: number;
  name?: string;
  description?: string;
  users?: User[];
}
