import { Action } from '@/types/authorization/action.enum';
import { ClientRolePermission } from '@/types/authorization/client-role-permission.interface';
import { Mission } from '@/types/authorization/mission.enum';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'rolePermissionValidator', async: false })
export class RolePermissionValidate implements ValidatorConstraintInterface {
  validate(rolePermission: ClientRolePermission) {
    return this.validateRolePermission(rolePermission);
  }

  defaultMessage() {
    return 'Role permissions wrong format';
  }

  validateRolePermission(rolePermissions: ClientRolePermission) {
    if (!rolePermissions) return false;
    const isValid = Object.keys(rolePermissions).every((mission: Mission) => {
      if (!Object.values(Mission).includes(mission)) return false;
      return Object.keys(rolePermissions[mission]).every((act: Action) =>
        Object.values(Action).includes(act),
      );
    });
    if (!isValid) return false;
    return true;
  }
}
