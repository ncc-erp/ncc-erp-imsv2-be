import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCommentQueryDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  newsId?: number;
}
