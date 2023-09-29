import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@/logger/logger.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import {
  SchedulerEnv,
  SchedulerEnvProp,
  SchedulerName,
} from '@type/hrm/scheduler-env.type';
import { SCHEDULER_TOKEN } from '@common/constants/token.constant';
import { AuditLogService } from '@features/audit-log/audit-log.service';
import * as moment from 'moment';
import { DataSource, LessThanOrEqual } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import * as path from 'path';
import { convertToCSV } from '@utils/csv';
import { zipAndSave } from '@utils/zip-string';
import checkExistFolder from '@utils/file';
import { GdriveService } from '@features/files/gdrive.service';

@Injectable()
export class ArchiveAuditLogTask implements OnModuleInit {
  private schedulerConfig: SchedulerEnvProp;

  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly configService: ConfigService,
    private readonly log: LoggerService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectDataSource('default')
    private readonly datasource: DataSource,
    private readonly gdriveService: GdriveService,
  ) {
    this.log.setContext(AuditLogService.name);
    this.schedulerConfig =
      this.configService.get<SchedulerEnv>(SCHEDULER_TOKEN)[
        SchedulerName.ARCHIVE_AUDIT_LOG
      ];
  }

  onModuleInit(): void {
    if (!this.schedulerConfig.isActive) {
      this.log.info(`Scheduler ${SchedulerName.ARCHIVE_AUDIT_LOG} is OFF`);
      return;
    }
    const job = new CronJob(this.schedulerConfig.cron, () => {
      this.archiveAuditLog();
    });

    this.schedulerRegistry.addCronJob(this.schedulerConfig.name, job);
    job.start();
    this.getCrons();
  }

  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDates();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      this.log.info(`job: ${key} -> next: ${next}`);
    });
  }

  async archiveAuditLog() {
    this.log.info(`Start scheduler ${SchedulerName.ARCHIVE_AUDIT_LOG}`);
    const timeAgo = moment(new Date())
      .subtract(this.schedulerConfig.remainWeek, 'weeks')
      .toDate();
    const numberRecord = await this.auditLogService.countBy({
      createdTime: LessThanOrEqual(timeAgo),
    });

    if (numberRecord === 0) {
      this.log.info('No audit log to archive');
      return;
    }

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (
        let i = 0;
        i < Math.ceil(numberRecord / this.schedulerConfig.numberRecordPerFile);
        i++
      ) {
        const result = await queryRunner.query(
          'select * from audit_log where "createdTime" <= $1 limit $2 offset $3',
          [
            timeAgo,
            this.schedulerConfig.numberRecordPerFile,
            this.schedulerConfig.numberRecordPerFile * i,
          ],
        );

        const csvData = convertToCSV(result);

        const dir = path.join(__dirname, '../../../logs');
        checkExistFolder(dir);
        const filename = path.join(
          dir,
          `${moment(timeAgo).format(
            'YYYY-MM-DD_HH:mm',
          )}_${this.configService.get('node_env')}_${i}.zip`,
        );

        await zipAndSave(csvData, filename);

        await this.gdriveService.uploadFolder(dir, '.zip', 'application/zip');

        await queryRunner.query(
          'delete from audit_log where "createdTime" <= $1',
          [timeAgo],
        );
      }
      await queryRunner.commitTransaction();
      this.log.info(
        `${SchedulerName.ARCHIVE_AUDIT_LOG} is success for date before ${timeAgo}`,
      );
    } catch (err) {
      this.log.error(
        err,
        `${SchedulerName.ARCHIVE_AUDIT_LOG} is fail for date before ${timeAgo}`,
      );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
