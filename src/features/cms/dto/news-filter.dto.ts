import { EntityName } from '@/types/entityName.enum';
import { PageOptionsDTO } from '@common/dto/page-options.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ISOStringToDate } from '@utils/date';

export class NewsFilter extends PageOptionsDTO {
  @ApiPropertyOptional({
    enum: EntityName,
  })
  @IsOptional()
  @IsEnum(EntityName)
  mainCategory?: EntityName;

  @ApiPropertyOptional()
  @IsOptional()
  subCategoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  status?: number;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => ISOStringToDate(value))
  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    example: '2022-01-01T10:30:00Z',
    description: 'The date in ISO 8601 format.',
  })
  from?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => ISOStringToDate(value))
  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    example: '2022-01-01T10:30:00Z',
    description: 'The date in ISO 8601 format.',
  })
  to?: Date;
}
