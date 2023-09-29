import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { JwtPayload } from '../dto/jwt-payload.dto';

export class IJwtRequestUser {
  @ValidateNested({ each: true })
  @Type(() => JwtPayload)
  user: JwtPayload;
}
