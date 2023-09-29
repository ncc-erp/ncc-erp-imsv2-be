import { Module } from '@nestjs/common';
import { UserModule } from '@features/user/user.module';
import { ClientModule } from '@/client/client.module';
import { HostName } from '@/client/type/client-env.type';
import { SyncUserTask } from '@/schedulers/tasks/sync-user.task';
import { RoleModule } from '@features/role/role.module';
import { ConfigModule } from '@nestjs/config';
import schedulerConfig from '@/config/env.config/scheduler.config';
import { AuditLogModule } from '@features/audit-log/audit-log.module';
import { ArchiveAuditLogTask } from '@/schedulers/tasks/archive-audit-log.task';
import { FilesModule } from '@features/files/files.module';

@Module({
  imports: [
    ConfigModule.forFeature(schedulerConfig),
    ClientModule.register({ hostName: HostName.HRMV2 }),
    UserModule,
    RoleModule,
    AuditLogModule,
    FilesModule,
  ],
  providers: [SyncUserTask, ArchiveAuditLogTask],
})
export class SchedulersModule {}
