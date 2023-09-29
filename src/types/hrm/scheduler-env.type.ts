export enum SchedulerName {
  SYNC_ACTIVE_USER = 'SYNC_ACTIVE_USER',
  ARCHIVE_AUDIT_LOG = 'ARCHIVE_AUDIT_LOG',
}

export type SchedulerEnvProp = {
  name: string;
  isActive: boolean;
  cron: string;
  remainWeek?: number;
  numberRecordPerFile?: number;
};

export type SchedulerEnv = {
  [idx in SchedulerName]?: SchedulerEnvProp;
};
