import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '@features/user/user.service';
import { HostName } from '@/client/type/client-env.type';
import { ClientService } from '@/client/client.service';
import { LoggerService } from '@/logger/logger.service';
import { HrmUser, HrmUserResult } from '@type/hrm/user.interface';
import { User } from '@entities/user.entity';
import { Role } from '@entities/role.entity';
import { RoleService } from '@features/role/role.service';
import { RoleName } from '@type/authorization/role.enum';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import {
  SchedulerEnv,
  SchedulerEnvProp,
  SchedulerName,
} from '@type/hrm/scheduler-env.type';
import { SCHEDULER_TOKEN } from '@common/constants/token.constant';

@Injectable()
export class SyncUserTask implements OnModuleInit {
  private schedulerConfig: SchedulerEnvProp;

  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly configService: ConfigService,
    private readonly log: LoggerService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(HostName.HRMV2) private readonly clientService: ClientService,
  ) {
    this.log.setContext(SyncUserTask.name);
    this.schedulerConfig =
      this.configService.get<SchedulerEnv>(SCHEDULER_TOKEN)[
        SchedulerName.SYNC_ACTIVE_USER
      ];
  }

  onModuleInit(): void {
    if (!this.schedulerConfig.isActive) return;
    const job = new CronJob(this.schedulerConfig.cron, () => {
      this.syncActiveUser();
    });

    this.schedulerRegistry.addCronJob(this.schedulerConfig.name, job);
    job.start();
  }

  async syncActiveUser() {
    this.log.info('***** Start sync active user from HRM *****');
    const hrmUsers = await this.clientService.get<HrmUserResult>(
      'api/services/app/CheckIn/GetUserForCheckIn',
    );
    if (!hrmUsers.result) {
      this.log.info('No user to sync with hrm');
      return;
    }

    const existUserEmails = await this.userService.getAllUserEmailsForSync();
    const roleStaff = await this.roleService.getRoleByname(RoleName.STAFF);
    const newUsers = hrmUsers.result
      .filter((hrmUser) => !existUserEmails.includes(hrmUser.email))
      .map((hrmUser) => this.toUser(hrmUser, [roleStaff]));
    await this.userService.add(newUsers);
    this.log.info(`${newUsers.length} active user sync from HRM successfully`);
  }

  private toUser(hrmUser: HrmUser, roles: Role[]): User {
    const user = new User();
    user.userName = hrmUser.email;
    user.emailAddress = hrmUser.email;
    user.name = hrmUser.firstName;
    user.surname = hrmUser.lastName;
    user.roles = roles;
    user.isActive = true;
    return user;
  }
}
