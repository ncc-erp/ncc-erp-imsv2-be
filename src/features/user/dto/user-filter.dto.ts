import { IsValidColumnNameConstraint } from '@/common/decorators/valid-column-name.decorator';
import { PageOptionsDTO } from '@/common/dto/page-options.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Validate } from 'class-validator';

export class UserFilter extends PageOptionsDTO {
  @IsOptional()
  @Validate(IsValidColumnNameConstraint, ['User'], {})
  orderBy?: string;

  /*
   * Id of role
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  role?: number;
}
