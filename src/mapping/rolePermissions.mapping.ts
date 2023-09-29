import { RolePermission } from '@entities/role-permission.entity';
import { Action } from '@type/authorization/action.enum';
import { ClientRolePermission } from '@type/authorization/client-role-permission.interface';
import { Mission } from '@type/authorization/mission.enum';
import { permission } from '@type/authorization/permission';
import { RolePermissionDTO } from '@features/role/dto/role-permission.dto';

// Format Role's Permissions from Client To Server
export const formatRPC2S = (
  client: ClientRolePermission,
): RolePermissionDTO[] => {
  const rolePermission: RolePermissionDTO[] = [];
  let mission: Mission;
  for (mission in client) {
    const actions = Object.keys(client[mission])
      .map((act: Action) => (client[mission][act] ? act : null))
      .filter((act) => act);
    if (!actions.length) continue;
    rolePermission.push({
      mission: mission,
      actions,
    });
  }
  return rolePermission;
};

// Format Role's Permissions from Server To Client
export const toClientRolePermissionDTO = (
  server: RolePermission[],
): ClientRolePermission => {
  const client = constructClientFormatObj();
  server.forEach((rp) => {
    rp.actions.forEach((action) => {
      client[rp.mission][action] = true;
    });
  });
  return client;
};

export const constructClientFormatObj = (defaultPermission = false) => {
  let mission: Mission;
  let action: Action;
  const client = {} as ClientRolePermission;
  for (mission in permission) {
    client[mission] = {};
    for (action of permission[mission]) {
      client[mission][action] = defaultPermission;
    }
  }
  return client;
};

//? Client format
/*
{
    authorization: {
        create: true,
        update: false,
        read: true,
        delete: false
    },
    ...
}
*/

//? Server format
/*
[
    {
        mission: 'authorization',
        actions: ['create', 'read']
    },
    {

    },
    ...
]
*/
