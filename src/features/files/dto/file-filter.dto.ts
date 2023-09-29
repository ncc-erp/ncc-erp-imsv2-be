import { PageOptionsDTO } from '@common/dto/page-options.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Validate } from 'class-validator';
import { OrderingDirection } from '@common/constants/order.constant';
import { Transform } from 'class-transformer';
import { enumTransform } from '@common/validator/enum.validator';
import { IsValidColumnNameConstraint } from '@common/decorators/valid-column-name.decorator';
import { UploadFile } from '@entities/upload-file.entity';

export class FileFilter extends PageOptionsDTO {
  @ApiPropertyOptional({
    enum: OrderingDirection,
    default: OrderingDirection.DESC,
  })
  @IsEnum(OrderingDirection)
  @IsOptional()
  @Transform(({ value }) => enumTransform(value, OrderingDirection, false))
  order?: OrderingDirection = OrderingDirection.DESC;

  @ApiPropertyOptional()
  @IsOptional()
  @Validate(IsValidColumnNameConstraint, [UploadFile.name])
  orderBy? = 'createdTime';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
