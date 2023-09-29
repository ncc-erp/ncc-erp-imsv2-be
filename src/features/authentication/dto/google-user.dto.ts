import { IsEmail } from 'class-validator';

export class GoogleUserDto {
  @IsEmail()
  email: string;
}
