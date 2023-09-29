import { Role } from '@/entities/role.entity';
import { OmitType, PartialType } from '@nestjs/swagger';

export class UpdateRoleDTO extends PartialType(
  OmitType(Role, ['rolePermissions', 'users'] as const),
) {}
