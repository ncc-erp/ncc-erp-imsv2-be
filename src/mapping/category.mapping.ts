import { EntityType } from '@/entities/entityType.entity';
import { CategoryDTO } from '@/features/cms/dto/category.dto';

export const toCategoryDTOs = (entities: EntityType[]): CategoryDTO[] => {
  const list = entities.reduce((x, entity) => {
    if (x[entity.entityName] === undefined) {
      x[entity.entityName] = {
        categoryName: entity.entityName,
        subCategories: [
          {
            id: entity.id,
            categoryName: entity.displayName,
            categoryColor: entity.color,
          },
        ],
      };
    } else {
      x[entity.entityName].subCategories.push({
        id: entity.id,
        categoryName: entity.displayName,
        categoryColor: entity.color,
      });
    }

    return x;
  }, {} as any);

  return Object.keys(list).map((l) => list[l]);
};
