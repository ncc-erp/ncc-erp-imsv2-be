import { AdminCreEnv } from '@/config/env.config/admin.config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@features/user/user.service';
import { RoleName } from '@/types/authorization/role.enum';
import { SPLIT_SEPARATOR } from '@/common/constants/common.constant';
import { LoggerService } from '@/logger/logger.service';
import { SeedDataEnv } from '@type/seed-data.type';
import { SEED_DATA_TOKEN } from '@common/constants/token.constant';

@Injectable()
export class SyncDataService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(SyncDataService.name);
  }

  async onModuleInit() {
    await Promise.all([this.setAdminForUsers(), this.setRoleForUsers()]);
  }

  async setAdminForUsers() {
    if (
      !this.configService.get<SeedDataEnv>(SEED_DATA_TOKEN)
        .isSeedRoleAdminActive
    ) {
      this.logger.info('Seed role Admin for user is OFF');
      return;
    }
    const adminsCre = this.configService.get<AdminCreEnv>('admin');
    const adminsEmail = adminsCre.emails.trim().split(SPLIT_SEPARATOR);

    const admins = await Promise.all(
      adminsEmail.map((emailAddress) =>
        this.userService.findOneWhere({ emailAddress }),
      ),
    );

    return Promise.all(
      admins
        .filter((user) => !!user)
        .map((user) =>
          this.userService.updateRoles({ id: user.id }, [
            ...user.roles.map((role) => role.name),
            RoleName.ADMIN,
          ]),
        ),
    );
  }

  async setRoleForUsers() {
    if (
      !this.configService.get<SeedDataEnv>(SEED_DATA_TOKEN)
        .isSeedRoleStaffActive
    ) {
      this.logger.info('Seed role staff for user is OFF');
      return;
    }
    const users = await this.userService.findMany({});
    if (!users) return null;

    return Promise.all(
      users
        .filter((user) => !!user)
        .map((user) =>
          this.userService.updateRoles({ id: user.id }, [
            ...user.roles.map((role) => role.name),
            RoleName.STAFF,
          ]),
        ),
    );
  }
}
