import { AuditEntity } from '@entities/base/audit.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { News } from './news.entity';
import { User } from './user.entity';

@Entity()
export class Comment extends AuditEntity {
  @Column()
  comment: string;

  @JoinColumn({ name: 'parentCommentId' })
  @ManyToOne(() => Comment, (comment) => comment.childrenComments, {})
  parentComment?: Comment;

  @Column({ nullable: true })
  parentCommentId: number;

  @OneToMany(() => Comment, (comment) => comment.parentComment, {
    cascade: true,
  })
  childrenComments?: Comment[];

  @Column({ nullable: true })
  newsId: number;

  @Exclude()
  @Column({ nullable: true })
  imsv1EntityId: number;

  @Exclude()
  @Column({ nullable: true })
  imsv1EntityName: string;

  @ManyToOne(() => News, (news) => news.comments)
  @JoinColumn({ name: 'newsId' })
  news?: News;

  @ManyToOne((type) => User)
  @JoinColumn({ name: 'createdBy' })
  user?: User;

  constructor(partial: Partial<Comment>) {
    super();
    Object.assign(this, partial);
  }
}
