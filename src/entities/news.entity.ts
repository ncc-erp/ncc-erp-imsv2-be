import { Priority } from '@/types/priority.enum';
import { StatusType } from '@/types/status.enum';
import { AuditEntity } from '@entities/base/audit.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exclude, Transform } from 'class-transformer';
import { booleanTransform } from '@/common/validator/boolean.validator';
import { Comment } from './comment.entity';
import { EntityType } from './entityType.entity';
import { NewsRelation } from './news-relation.entity';
import { numberArrayTransform } from '@/common/validator/numArray.validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { enumTransform } from '@/common/validator/enum.validator';
import { ISOStringToDate } from '@/utils/date';

@Entity()
export class News extends AuditEntity {
  @Column()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  sapo?: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Column()
  @IsNumber()
  entityTypeId: number;

  @Column({
    type: 'enum',
    enum: StatusType,
    default: StatusType.Draft,
  })
  @IsEnum(StatusType)
  status: StatusType;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.High,
  })
  @IsEnum(Priority)
  @Transform(({ value }) => enumTransform(value, Priority))
  priority: Priority;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @Column({ nullable: true })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => ISOStringToDate(value))
  effectiveStartTime?: Date;

  @Column({ nullable: true })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => ISOStringToDate(value))
  effectiveEndTime?: Date;

  @Column({ default: true })
  @IsOptional()
  @Transform(({ value }) => booleanTransform(value))
  allowLike?: boolean;

  @Column({ nullable: true })
  imsv1EntityId: number;

  @Column({ nullable: true })
  imsv1EntityName: string;

  @Column({ nullable: true })
  publishedTime: Date;

  @Column({ nullable: true })
  publishedBy: number;

  @Column('int', { array: true, default: [] })
  @IsNumber({}, { each: true })
  @Transform(({ value }) => numberArrayTransform(value))
  teamIds?: number[] = [];

  @ApiHideProperty()
  @ManyToOne(() => EntityType, (en) => en.news)
  @JoinColumn({ name: 'entityTypeId' })
  entityType?: EntityType;

  @OneToMany(() => Comment, (comment) => comment.news)
  comments?: Comment[];

  @ApiHideProperty()
  @OneToMany(() => NewsRelation, (rel) => rel.firstNews)
  firstRelationNews?: NewsRelation[];

  @ApiHideProperty()
  @OneToMany(() => NewsRelation, (rel) => rel.secondNews)
  secondRelationNews?: NewsRelation[];
}
