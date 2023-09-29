import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class UpdateUserRoleDTO {
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsString({ each: true })
  roleNames: string[];
}
