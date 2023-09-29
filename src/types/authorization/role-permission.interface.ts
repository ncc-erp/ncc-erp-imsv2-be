import { RolePermission } from '@entities/role-permission.entity';

export interface IRolePermissions {
  [key: string]: RolePermission[];
}

/*
  @format  
  {
    admin: [
      {
        mission: mission1,
        actions: ['C', 'R', 'U', 'D', 'action1', 'action2'],
      }, 
      {
        mission: mission2, 
        actions: ['C', 'R', 'D', 'action2'],
      }
    ],
    user: [
      {
        mission: mission1, 
        actions: ['R', 'action1'],
      },
      {
        mission: mission2,
        actions: ['C', 'R', 'action2'],
      }
    ],
  }
*/
