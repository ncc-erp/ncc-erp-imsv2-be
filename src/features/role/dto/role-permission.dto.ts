import { RolePermission } from '@entities/role-permission.entity';

export type RolePermissionDTO = Omit<RolePermission, 'id' | 'role'>;
