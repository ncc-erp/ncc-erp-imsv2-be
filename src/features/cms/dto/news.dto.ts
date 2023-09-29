import { News } from '@/entities/news.entity';
import { OmitType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class NewsDTO extends OmitType(News, [
  'imsv1EntityId',
  'imsv1EntityName',
  'entityType',
  'firstRelationNews',
  'secondRelationNews',
  'createdBy',
] as const) {
  @IsString()
  mainCategory: string;

  @IsString()
  subCategory: string;

  @IsString()
  subCategoryColor?: string;

  @IsNumber()
  countLike: number;

  @IsNumber()
  countComment: number;

  relationNews: NewsDTO[];

  createdBy: string;

  hasCurrentUserLiked?: boolean;
}
