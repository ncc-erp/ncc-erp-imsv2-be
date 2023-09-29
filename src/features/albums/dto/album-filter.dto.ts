import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { PageOptionsDTO } from '@common/dto/page-options.dto';
import { OrderingDirection } from '@common/constants/order.constant';
import { enumTransform } from '@common/validator/enum.validator';
import { IsValidColumnNameConstraint } from '@common/decorators/valid-column-name.decorator';
import { TraditionalAlbums } from '@entities/album.entity';
import { booleanTransform } from '@common/validator/boolean.validator';

export class AlbumFilter extends PageOptionsDTO {
  @IsOptional()
  @ApiPropertyOptional({
    default: 'albumTime',
  })
  @Validate(IsValidColumnNameConstraint, [TraditionalAlbums.name])
  orderBy? = 'albumTime';

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
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    minimum: 1970,
    maximum: 2100,
  })
  @IsOptional()
  @IsInt()
  @Min(1970)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => booleanTransform(value))
  isActive?: boolean;
}
