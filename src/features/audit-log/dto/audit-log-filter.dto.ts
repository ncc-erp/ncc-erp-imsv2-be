import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PageOptionsDTO } from '@common/dto/page-options.dto';
import { OrderingDirection } from '@common/constants/order.constant';
import { enumTransform } from '@common/validator/enum.validator';
import { IsValidColumnNameConstraint } from '@common/decorators/valid-column-name.decorator';
import { AuditLog } from '@entities/audit-log.entity';
import { ISOStringToDate } from '@utils/date';
import { RequestMethod } from '@features/audit-log/dto/request-method.enum';

export class AuditLogFilter extends OmitType(PageOptionsDTO, [
  'search',
] as const) {
  @IsOptional()
  @ApiPropertyOptional({
    default: 'createdTime',
  })
  @Validate(IsValidColumnNameConstraint, [AuditLog.name])
  orderBy? = 'createdTime';

  @ApiPropertyOptional({
    enum: OrderingDirection,
    default: OrderingDirection.DESC,
  })
  @IsEnum(OrderingDirection)
  @IsOptional()
  @Transform(({ value }) => enumTransform(value, OrderingDirection))
  order?: OrderingDirection = OrderingDirection.DESC;

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

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  endpoint?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  createdBy?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  exception?: string;

  @IsOptional()
  @IsEnum(RequestMethod)
  @Transform(({ value }) => enumTransform(value, RequestMethod))
  @ApiPropertyOptional()
  method?: RequestMethod;

  get skip(): number {
    return (this.page - 1) * this.size;
  }
}
