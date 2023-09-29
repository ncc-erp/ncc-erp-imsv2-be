import { User } from '@/entities/user.entity';
import {
  ACTION_KEY,
  MISSION_KEY,
  ROLE_KEY,
} from '@common/constants/author.constant';
import { RoleService } from '@features/role/role.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Action } from '@type/authorization/action.enum';
import { Mission } from '@type/authorization/mission.enum';
import { isPublicRequest } from './is-public-request.utils';
import { RoleName } from '@/types/authorization/role.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly roleService: RoleService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isPublicRequest(this.reflector, context, this.configService)) {
      return true;
    }

    const requiredMission = this.reflector.get<Mission>(
      MISSION_KEY,
      context.getClass(),
    );

    const permitActions = this.reflector.getAllAndMerge<Action[]>(ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requireRoles = this.reflector.getAllAndMerge<RoleName[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredMission) return true;

    const { user }: { user: User } = context.switchToHttp().getRequest();
    if (!user) throw new UnauthorizedException('Please log in');

    const { roles } = user;
    if (!roles) {
      return false;
    }

    if (
      requireRoles &&
      requireRoles.length !== 0 &&
      !roles.some((role) => requireRoles.includes(role.name as RoleName))
    ) {
      return false;
    }

    const userPermissions = await Promise.all(
      roles.map((role) => this.roleService.getRolePermissions(role.name)),
    );

    for (const rolePermissions of userPermissions) {
      if (!rolePermissions) continue;

      const missionPermission = rolePermissions.find(
        (p) => p.mission === requiredMission,
      );
      if (missionPermission === undefined) continue;

      if (!permitActions || permitActions.length === 0) return true;

      const roleAction = missionPermission.actions;
      if (roleAction.some((a) => permitActions.find((pA) => pA === a)))
        return true;
    }

    throw new ForbiddenException('You dont have permission to this resource');
  }
}
