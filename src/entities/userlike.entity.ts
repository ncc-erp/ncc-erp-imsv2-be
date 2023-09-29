import { booleanTransform } from '@/common/validator/boolean.validator';
import { LikeableEntity } from '@/types/entityName.enum';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber()
  userId: number;

  @Column()
  @IsNumber()
  entityId: number;

  @Column({
    type: 'enum',
    enum: LikeableEntity,
    nullable: true,
  })
  @IsEnum(LikeableEntity)
  entityName: LikeableEntity;

  @Column({ default: true })
  @IsBoolean()
  @Transform(({ value }) => booleanTransform(value))
  liked?: boolean;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  imsv1EntityId?: number;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  imsv1EntityName?: string;

  @ManyToOne(() => User, (u) => u.userLike, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
