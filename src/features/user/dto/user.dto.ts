import { User } from '@/entities/user.entity';

export class UserDTO extends User {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }
}
