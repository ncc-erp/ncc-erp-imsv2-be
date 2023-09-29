import { Role } from '@/entities/role.entity';
import { RoleName } from '@/types/authorization/role.enum';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { In } from 'typeorm';
import { RoleService } from './role.service';
import { UpdatePermissionsDTO } from './dto/update-permissions.dto';
import { constructClientFormatObj } from '@/mapping/rolePermissions.mapping';
import { LoggerService } from '@/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { SEED_DATA_TOKEN } from '@common/constants/token.constant';
import { SeedDataEnv } from '@type/seed-data.type';

@Injectable()
export class RoleSeedService implements OnModuleInit {
  constructor(
    private readonly roleService: RoleService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(RoleSeedService.name);
  }

  async onModuleInit() {
    if (
      !this.configService.get<SeedDataEnv>(SEED_DATA_TOKEN).isSeedRoleActive
    ) {
      this.logger.info('Seed data role is OFF');
      return;
    }
    const newRole = await this.seedRole();
    this.logger.info('Seed data for Role successfully!', newRole);

    await this.seedAdminPermission();
    this.logger.info('Seed data for Admin permission successfully!');
  }

  async seedRole() {
    const roleNames = Object.keys(RoleName).map(
      (key: keyof typeof RoleName) => RoleName[key],
    );
    const existRoles = await this.roleService.getManyRole({
      where: {
        name: In(roleNames),
      },
    });

    const insertRoles = roleNames
      .filter((role) => !existRoles.find((eR) => eR.name === role))
      .map((role) => {
        const newRole = new Role();
        newRole.name = role;
        return newRole;
      });

    return this.roleService.saveManyRole(insertRoles);
  }

  async seedAdminPermission() {
    const admin: UpdatePermissionsDTO = {
      name: RoleName.ADMIN,
      rolePermissions: constructClientFormatObj(true),
    };

    return this.roleService.updateRolePermission(admin);
  }
}
