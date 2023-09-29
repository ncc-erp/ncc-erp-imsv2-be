import { Comment } from '@/entities/comment.entity';
import { User } from '@/entities/user.entity';
import { OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { JoinColumn, ManyToOne } from 'typeorm';

export class CommentDto extends OmitType(Comment, ['createdTime'] as const) {
  @Transform(({ value }) => {
    if (value) {
      return {
        userId: value.id,
        name: value.name,
        avatar: value.avatar,
      };
    }
  })
  @ManyToOne((type) => User)
  @JoinColumn({ name: 'createdBy' })
  user?: User;

  createdTime: Date;

  likesCount: number;

  constructor(comment: Partial<CommentDto>) {
    super(comment);
    Object.assign(this, comment);
  }
}
