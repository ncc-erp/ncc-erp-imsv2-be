import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TraditionalAlbums } from '@entities/album.entity';

export class SaveAlbumDTO extends OmitType(TraditionalAlbums, [
  'id',
  'thumbnailImage',
] as const) {
  @ApiHideProperty()
  id?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  thumbnailImage?: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  thumbnailImageFile?: Express.Multer.File;
}
