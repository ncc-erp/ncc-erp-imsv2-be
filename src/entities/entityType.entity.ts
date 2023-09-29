import { booleanTransform } from '@/common/validator/boolean.validator';
import { EntityName } from '@/types/entityName.enum';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { TraditionalAlbums } from './album.entity';
import { NumberKeyEntity } from './base/numberkey.entity';
import { News } from './news.entity';
import { Widget } from './widget.entity';

@Entity()
export class EntityType extends NumberKeyEntity {
  @Column({
    type: 'enum',
    enum: EntityName,
    default: EntityName.Events,
  })
  @IsEnum(EntityName)
  @ApiProperty({ enum: EntityName })
  entityName: EntityName;

  @Column()
  @IsString()
  @ApiProperty()
  displayName: string;

  @Column({ nullable: true })
  imsv1EntityName: string;

  @Column({ nullable: true })
  imsv1EntityId: number;

  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => booleanTransform(value))
  isActive?: boolean;

  @Column({ nullable: true, default: null })
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Transform(({ value }) => (!value ? null : value))
  color?: string;

  @ApiHideProperty()
  @OneToMany(() => News, (news) => news.entityType)
  news?: News[];

  @ApiHideProperty()
  @OneToMany(() => Widget, (wid) => wid.entityType)
  widgets?: Widget[];

  @ApiHideProperty()
  @OneToMany(() => TraditionalAlbums, (al) => al.entityType)
  traditionAlbums?: TraditionalAlbums[];
}
