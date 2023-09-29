import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateEntityTypeDTO } from './create-entity-type.dto';

export class UpdateEntityTypeDTO extends PartialType(
  OmitType(CreateEntityTypeDTO, ['entityName'] as const),
) {}
