import { UserWidget } from '@/entities/user-widget.entity';
import { OmitType } from '@nestjs/swagger';

export class UserWidgetDTO extends OmitType(UserWidget, [
  'id',
  'user',
  'widget',
] as const) {
  id?: number;
  widgetId: number;
  widgetCode: number;
  maxHeight?: number;
  maxWidth?: number;
  thumbnailImage?: string;
  url?: string;
}
