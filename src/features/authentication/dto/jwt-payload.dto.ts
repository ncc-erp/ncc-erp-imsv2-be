import { IsEmail, IsNumber } from 'class-validator';

export class JwtPayload {
  @IsEmail()
  emailAddress: string;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}
