import { EntityName } from '@/types/entityName.enum';
import { PageOptionsDTO } from '@common/dto/page-options.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { booleanTransform } from '@/common/validator/boolean.validator';

export class EntityTypeFilter extends PageOptionsDTO {
  @ApiPropertyOptional({ enum: EntityName })
  @IsEnum(EntityName)
  @IsOptional()
  entityName?: EntityName;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => booleanTransform(value))
  isActive?: boolean;
}
