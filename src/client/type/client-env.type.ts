export enum HostName {
  TIMESHEET = 'TIMESHEET',
  HRMV2 = 'HRMV2',
  FACEID = 'FACEID',
  KOMU = 'KOMU',
}

export type ClientEnv = {
  [idx in HostName]?: {
    baseURL: string;
    security: string;
    accountId?: string;
  };
};
