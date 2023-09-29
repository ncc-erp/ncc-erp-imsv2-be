import { AbsenceStatus } from '@/types/working-status.enum';

export class UnlockRankDTO {
  rank: number;
  fullName: string;
  amount: number;
}

export class TopUnlockDTO {
  totalAmount: number;
  listUnlock: UnlockRankDTO[];
}

export class UnlockHistory {
  content: string;
  day: string;
  fullName: string;
}

export class Pto {
  projectId: number;
  projectName: string;
  pms: string[];
}

export class TimeSheetUserInfoDTO {
  fullName: string;
  emailAddress: string;
  type: string;
  branch: string;
  projectUsers: Pto[];
}

export class WorkingStatusUserDTO {
  emailAddress: string;
  dateAt: Date;
  requestType: number;
  dayType: number;
  hour: number;
  status: AbsenceStatus;
  message: string;
}
