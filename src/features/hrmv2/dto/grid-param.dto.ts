import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ComparisonOperator } from '@common/dto/comparison.enum';
import { enumTransform } from '@common/validator/enum.validator';

export class GridParam {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  maxResultCount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  skipCount: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiPropertyOptional()
  amount?: number;

  @ApiPropertyOptional({
    enum: ComparisonOperator,
  })
  @IsOptional()
  @IsEnum(ComparisonOperator)
  @Transform(({ value }) => enumTransform(value, ComparisonOperator))
  comparisonOperator?: ComparisonOperator;
}

export class GridResult<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly items: T[];

  @ApiProperty()
  readonly totalCount: number;

  constructor(items: T[], totalCount: number) {
    this.items = items;
    this.totalCount = totalCount;
  }
}
