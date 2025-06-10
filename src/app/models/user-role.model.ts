import { Role } from './role.model';
import { User } from './user.model';

export class UserRole {
  id?: string; // Asumiendo que el ID de UserRole es un string como en tu Postman
  startAt?: Date;
  endAt?: Date;
  user?: User;
  role?: Role;

  constructor(user?: User, role?: Role, startAt?: Date, endAt?: Date, id?: string) {
    this.user = user;
    this.role = role;
    this.startAt = startAt;
    this.endAt = endAt;
    this.id = id;
  }
}
