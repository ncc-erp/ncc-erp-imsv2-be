import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import {
  PermitActions,
  RequireMission,
} from '@common/decorators/authorization.decorator';
import { RoleService } from './role.service';
import { UpdatePermissionsDTO } from './dto/update-permissions.dto';
import { toClientRolePermissionDTO } from '@/mapping/rolePermissions.mapping';
import { Mission } from '@/types/authorization/mission.enum';
import { Action } from '@/types/authorization/action.enum';

@RequireMission(Mission.AUTHORIZATION)
@ApiBearerAuth()
@Controller('roles')
@ApiTags('Roles')
export class RoleController {
  constructor(private readonly authorService: RoleService) {}

  /*
   * Get all roles
   */
  @PermitActions(Action.MANAGE)
  @Get()
  async getAllRole() {
    return this.authorService.getManyRole({});
  }

  /*
   * Get role's permissions
   */
  @PermitActions(Action.MANAGE)
  @Get('permissions')
  async getRolePermissions(@Query('role') role: string) {
    const res = await this.authorService.getRolePermissions(role);
    if (!res) throw new BadRequestException('Role not exist');
    return toClientRolePermissionDTO(res);
  }

  /*
   * Update role's permissions
   */
  @PermitActions(Action.MANAGE)
  @Put('permissions')
  @ApiBody({ type: UpdatePermissionsDTO })
  async updateRolePermissions(
    @Body() updateRolePermissionsDTO: UpdatePermissionsDTO,
  ) {
    await this.authorService.updateRolePermission(updateRolePermissionsDTO);
    return {
      status: HttpStatus.ACCEPTED,
      message: `Updated ${updateRolePermissionsDTO.name}`,
    };
  }
}
