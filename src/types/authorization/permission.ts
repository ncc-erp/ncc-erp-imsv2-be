import { Action } from './action.enum';
import { Mission } from './mission.enum';

const permission: {
  [key in Mission]: Action[];
} = {
  [Mission.TIMESHEET]: [Action.READ, Action.MANAGE],
  [Mission.HRM]: [Action.READ, Action.MANAGE],
  [Mission.HRMV2]: [Action.READ, Action.MANAGE],
  [Mission.AUTHORIZATION]: [Action.READ, Action.MANAGE],
  [Mission.CMS]: [Action.READ, Action.MANAGE],
  [Mission.ALBUM]: [Action.READ, Action.MANAGE],
  [Mission.COMMENT]: [Action.READ, Action.MANAGE],
  [Mission.LIKE]: [Action.READ, Action.MANAGE],
  [Mission.WIDGET]: [Action.READ, Action.MANAGE],
  [Mission.SETTING]: [Action.READ, Action.MANAGE],
  [Mission.ENTITY_TYPE]: [Action.READ, Action.MANAGE],
  [Mission.UPLOAD_FILE]: [Action.READ, Action.MANAGE],
  [Mission.USER]: [Action.READ, Action.MANAGE],
  [Mission.FACEID]: [Action.READ, Action.MANAGE],
  [Mission.AUDIT_LOG]: [Action.READ, Action.MANAGE],
};

export { permission };
