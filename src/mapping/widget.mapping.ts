import { UserWidget } from '@/entities/user-widget.entity';
import { User } from '@/entities/user.entity';
import { Widget } from '@/entities/widget.entity';
import { UserWidgetDTO } from '@/features/widget/dto/user-widget.dto';
import { WidgetDTO } from '@/features/widget/dto/widget.dto';
import { formatImageUrl } from '@/utils/url';

export const toWidgetDTO = (entity: Widget): WidgetDTO => {
  const dto = new WidgetDTO();

  dto.id = entity.id;
  dto.code = entity.code;
  dto.title = entity.title;
  dto.description = entity.description;
  dto.defaultHeight = entity.defaultHeight;
  dto.defaultWidth = entity.defaultWidth;
  dto.thumbnailImage = formatImageUrl(entity.thumbnailImage);
  dto.url = entity.url;
  dto.maxHeight = entity.maxHeight;
  dto.maxWidth = entity.maxWidth;
  dto.isEnabled = entity.isEnabled;

  return dto;
};

export const toUserWidgetDTO = (entity: UserWidget): UserWidgetDTO => {
  const dto = new UserWidgetDTO();

  dto.id = entity.id;
  dto.posX = entity.posX;
  dto.posY = entity.posY;
  dto.width = entity.width;
  dto.height = entity.height;
  dto.title = entity.title;
  dto.thumbnailImage = formatImageUrl(entity.widget.thumbnailImage);
  dto.url = entity.widget.url;
  dto.widgetCode = entity.widget.code;
  dto.maxHeight = entity.widget.maxHeight;
  dto.maxWidth = entity.widget.maxWidth;

  return dto;
};

export const toUserWidgetEntity = (
  dto: UserWidgetDTO,
  user: User,
  widget: Widget,
): UserWidget => {
  const newEntity = new UserWidget();

  newEntity.posX = dto.posX;
  newEntity.posY = dto.posY;
  newEntity.width = dto.width;
  newEntity.height = dto.height;
  newEntity.title = dto.title;
  newEntity.user = user;
  newEntity.widget = widget;

  return newEntity;
};
