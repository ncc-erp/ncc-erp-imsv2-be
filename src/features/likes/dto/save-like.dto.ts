import { UserLike } from '@/entities/userlike.entity';
import { OmitType } from '@nestjs/swagger';

export class SaveLikeDTO extends OmitType(UserLike, [
  'id',
  'user',
  'userId',
] as const) {}
