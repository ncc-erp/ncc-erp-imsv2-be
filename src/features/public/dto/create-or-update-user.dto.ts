import { UserType } from '@/types/hrmv2/hrmv2.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateUserDTO {
  @IsString()
  EmailAddress: string;

  @IsOptional()
  @IsEnum(UserType)
  UserType?: UserType;

  @IsOptional()
  @IsString()
  Surname?: string;

  @IsOptional()
  @IsString()
  Name?: string;
}
