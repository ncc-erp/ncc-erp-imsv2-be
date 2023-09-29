import { EntityTypeDTO } from '@/features/entity-type/dto/entity-type.dto';
import { IFilterItem } from '@/types/id-label-filter.interface';

export class SearchFilter {
  mainCategories: IFilterItem[];
  subCategories: EntityTypeDTO[];
}
