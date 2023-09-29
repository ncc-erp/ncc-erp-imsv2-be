import { OmitType } from '@nestjs/swagger';
import { EntityTypeDTO } from './entity-type.dto';

export class CreateEntityTypeDTO extends OmitType(EntityTypeDTO, [
  'id',
] as const) {}
