import { formatImageUrl } from '@/utils/url';
import { NewsDTO } from '@features/cms/dto/news.dto';
import { News } from '@/entities/news.entity';

export const toNewsDTO = (
  entity: any | News,
  currentUserHasLikedNewsId?: number[],
): NewsDTO => {
  const dto = new NewsDTO();

  dto.id = entity.news_id ?? entity.id;
  dto.title = entity.news_title ?? entity.title;
  dto.sapo = entity.news_sapo ?? entity.sapo;
  dto.description = entity.news_description ?? entity.description;
  dto.createdTime = entity.news_createdTime ?? entity.createdTime;
  dto.createdBy = `${entity.user_surname + ' ' ?? ''}${entity.user_name ?? ''}`;
  dto.entityTypeId = entity.news_entityTypeId ?? entity.entityTypeId;
  dto.status = +(entity.news_status ?? entity.status);
  dto.priority = +(entity.news_priority ?? entity.priority);
  dto.thumbnailImage = formatImageUrl(
    entity.news_thumbnailImage ?? entity.thumbnailImage,
  );
  dto.coverImage = formatImageUrl(entity.news_coverImage ?? entity.coverImage);
  dto.effectiveStartTime =
    entity.news_effectiveStartTime ?? entity.effectiveStartTime;
  dto.effectiveEndTime =
    entity.news_effectiveEndTime ?? entity.effectiveEndTime;
  dto.publishedTime = entity.news_publishedTime ?? entity.publishedTime;
  dto.mainCategory = entity.news_mainCategory ?? entity.entityType?.entityName;
  dto.subCategory = entity.news_subCategory ?? entity.entityType?.displayName;
  dto.subCategoryColor =
    entity.news_subCategoryColor ?? entity.entityType?.color;
  dto.relationNews =
    entity.relationNews?.map((news: News) => toNewsDTO(news)) ?? [];
  dto.teamIds = entity.teamIds ?? entity.news_teamIds ?? [];
  dto.allowLike = entity.news_allowLike ?? entity.allowLike;
  dto.hasCurrentUserLiked = currentUserHasLikedNewsId?.includes(dto.id);
  return dto;
};
