import { Widget } from '@/entities/widget.entity';
import { OmitType } from '@nestjs/swagger';

export class WidgetDTO extends OmitType(Widget, ['userWidgets'] as const) {}
