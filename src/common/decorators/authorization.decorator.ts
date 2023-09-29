import {
  ACTION_KEY,
  MISSION_KEY,
  PUBLIC_SECURITY,
  ROLE_KEY,
  SKIP_AUTH,
} from '@common/constants/author.constant';
import { SetMetadata } from '@nestjs/common';
import { Action } from '@type/authorization/action.enum';
import { Mission } from '@type/authorization/mission.enum';
import { RoleName } from '@/types/authorization/role.enum';

export const RequireRoles = (...roles: RoleName[]) =>
  SetMetadata(ROLE_KEY, roles);

export const RequireMission = (mission: Mission) =>
  SetMetadata(MISSION_KEY, mission);

export const PermitActions = (...actions: Action[]) =>
  SetMetadata(ACTION_KEY, actions);

export const Public = () => SetMetadata(SKIP_AUTH, true);

export const PublicSecurity = () => SetMetadata(PUBLIC_SECURITY, true);
