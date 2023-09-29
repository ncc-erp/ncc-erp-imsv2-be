import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from '@common/constants/query.constant';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { OrderingDirection } from '@common/constants/order.constant';
import { enumTransform } from '@common/validator/enum.validator';

export class PageOptionsDTO {
  @ApiPropertyOptional({
    minimum: DEFAULT_PAGE_INDEX,
    default: DEFAULT_PAGE_INDEX,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = DEFAULT_PAGE_INDEX;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  size?: number = DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    enum: OrderingDirection,
    default: OrderingDirection.ASC,
  })
  @IsEnum(OrderingDirection)
  @IsOptional()
  @Transform(({ value }) => enumTransform(value, OrderingDirection, false))
  readonly order?: OrderingDirection = OrderingDirection.ASC;

  @ApiPropertyOptional()
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  get skip(): number {
    return (this.page - 1) * this.size;
  }
}
