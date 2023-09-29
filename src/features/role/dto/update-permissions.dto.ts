import { RolePermissionValidate } from '@/common/validator/rolePermission.validator';
import { constructClientFormatObj } from '@/mapping/rolePermissions.mapping';
import { ClientRolePermission } from '@/types/authorization/client-role-permission.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';

export class UpdatePermissionsDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    default: constructClientFormatObj(),
  })
  @Validate(RolePermissionValidate)
  rolePermissions: ClientRolePermission;
}
