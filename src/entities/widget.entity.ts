import { booleanTransform } from '@/common/validator/boolean.validator';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AutoIncrementEntity } from './base/auto-increment.entity';
import { EntityType } from './entityType.entity';
import { UserWidget } from './user-widget.entity';

@Entity()
export class Widget extends AutoIncrementEntity {
  @Column({ unique: true })
  @IsNumber()
  @Type(() => Number)
  code: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @Column({ default: 1 })
  @IsNumber()
  @Type(() => Number)
  defaultHeight: number;

  @Column({ default: 1 })
  @IsNumber()
  @Type(() => Number)
  defaultWidth: number;

  @Column({ default: 4 })
  @IsNumber()
  @Type(() => Number)
  maxHeight: number;

  @Column({ default: 4 })
  @IsNumber()
  @Type(() => Number)
  maxWidth: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  url?: string;

  @Column({ default: true })
  @IsBoolean()
  @Transform(({ value }) => booleanTransform(value))
  isEnabled: boolean;

  @OneToMany(() => UserWidget, (uw) => uw.widget)
  @JoinTable()
  userWidgets?: UserWidget[];

  @ManyToOne(() => EntityType, (enTy) => enTy.widgets)
  @JoinColumn({ name: 'entityTypeId', referencedColumnName: 'id' })
  entityType: EntityType;
}
