import { EntityType } from '@/entities/entityType.entity';
import { PartialType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class EntityTypeDTO extends PartialType(EntityType) {
  @Exclude()
  imsv1EntityName?: string;

  @Exclude()
  imsv1EntityId?: number;

  constructor(partial: Partial<EntityTypeDTO>) {
    super();
    Object.assign(this, partial);
  }
}
