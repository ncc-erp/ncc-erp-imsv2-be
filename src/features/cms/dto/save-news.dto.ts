import { numberArrayTransform } from '@/common/validator/numArray.validator';
import { StatusType } from '@/types/status.enum';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';
import { NewsDTO } from './news.dto';
import { ISOStringToDate } from '@utils/date';
import { booleanTransform } from '@/common/validator/boolean.validator';

export class SaveNewsDTO extends OmitType(NewsDTO, [
  'id',
  'publishedBy',
  'entityTypeId',
  'subCategoryColor',
  'countComment',
  'countLike',
  'relationNews',
  'createdBy',
  'comments',
  'status',
  'hasCurrentUserLiked',
] as const) {
  /*
   * News Id, provide when need to update news
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  id?: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  thumbnailImageFile?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  coverImageFile?: Express.Multer.File;

  @IsNumber({}, { each: true })
  @Transform(({ value }) => numberArrayTransform(value))
  relationNewsIds?: number[] = [];

  @ApiHideProperty()
  status: StatusType;

  @ApiProperty()
  @IsDate()
  @Transform(({ value }) => ISOStringToDate(value))
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    example: '2022-01-01T10:30:00Z',
    description: 'The date in ISO 8601 format.',
  })
  publishedTime: Date;
}
