import { Widget } from '@/entities/widget.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class UpdateWidgetDTO extends OmitType(Widget, [
  'userWidgets',
  'code',
  'entityType',
  'id',
] as const) {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  thumbnailImageFile?: Express.Multer.File;

  @IsNumber()
  @Type(() => Number)
  entityTypeId: number;
}
