import { ISOStringToDate } from '@/utils/date';
import { AuditEntity } from '@entities/base/audit.entity';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Exclude, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EntityType } from './entityType.entity';
import { formatImageUrl } from '@utils/url';
import { booleanTransform } from '@common/validator/boolean.validator';

@Entity()
export class TraditionalAlbums extends AuditEntity {
  @Column()
  @IsString()
  title: string;

  @Column({ nullable: true })
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  description?: string;

  @ApiHideProperty()
  @Column()
  @Exclude()
  entityTypeId: number;

  @Column()
  @IsString()
  @Transform(({ value }) => formatImageUrl(value), { toPlainOnly: true })
  thumbnailImage: string;

  @Column({ nullable: true })
  @IsOptional()
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  albumIndex?: number;

  @Column()
  @IsString()
  albumUrl: string;

  @Column()
  @IsDate()
  @Transform(({ value }) => ISOStringToDate(value))
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    example: '2022-01-01T10:30:00Z',
    description: 'The date in ISO 8601 format.',
  })
  albumTime: Date;

  @Column({ default: true })
  @ApiProperty({ type: Boolean, default: true })
  @IsBoolean()
  @Transform(({ value }) => booleanTransform(value))
  isActive: boolean;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  imsv1EntityId: number;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  imsv1EntityName: string;

  @ApiHideProperty()
  @ManyToOne(() => EntityType, (enTy) => enTy.traditionAlbums)
  @JoinColumn({ name: 'entityTypeId' })
  @Exclude()
  entityType?: EntityType;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true, select: false, update: false, insert: false })
  ftsTitle?: string;
}
