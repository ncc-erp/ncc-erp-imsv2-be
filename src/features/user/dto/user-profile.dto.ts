import { User } from '@/entities/user.entity';
import { UserDTO } from './user.dto';

export class UserProfileDTO extends UserDTO {
  constructor(user: Partial<User>) {
    super(user);
  }
}
