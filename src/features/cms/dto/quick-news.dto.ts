import { QuickNews } from '@/entities/quicknews.entity';
import { convertDiscordTextToHtml, convertHoverText } from '@/utils/string';

export class QuickNewsDTO {
  id: number;
  description: string;
  createdTime?: Date;
  content: string;
  hover: string;

  constructor(entity: QuickNews) {
    this.id = entity.id;
    this.description = entity.description;
    this.createdTime = entity.createdTime;
    this.content = convertDiscordTextToHtml(entity.description);
    this.hover = convertHoverText(entity.description);
  }
}
