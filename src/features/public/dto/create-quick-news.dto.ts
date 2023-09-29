import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateQuickNewsDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  Content: string;
}
