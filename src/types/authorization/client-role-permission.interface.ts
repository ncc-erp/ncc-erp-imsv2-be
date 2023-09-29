import { Action } from './action.enum';
import { Mission } from './mission.enum';

export type ClientRolePermission = {
  [key in Mission]: {
    [idx in Action]?: boolean;
  };
};
