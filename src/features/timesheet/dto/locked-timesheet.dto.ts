export class LockedTimeSheet {
  amount: number;
  amountPM: number;
  lockedPM: number;
  isUnlockLog: boolean;
  isUnlockApprove: boolean;
  isPM: boolean;
  lockedEmployee: LockedEmployee;
  firstDateCanLogIfUnlock: Date;
}

export class LockedEmployee {
  startDate: Date;
  endDate: Date;
  day: Date;
}
