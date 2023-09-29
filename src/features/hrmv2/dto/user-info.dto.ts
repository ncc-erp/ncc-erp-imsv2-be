import { EmployeeStatus, Sex, UserType } from '@/types/hrmv2/hrmv2.enum';

export class UserInfoDTO {
  fullName: string;
  email: string;
  sex: Sex;
  status: EmployeeStatus;
  userType: UserType;
  skillNames: string[];
  teams: string[];
  teamIds: number[];
  phone: string;
  birthday: string;
  idCard: string;
  placeOfPermanent: string;
  address: string;
  bankAccountNumber: string;
  remainLeaveDay: number;
  taxCode: string;
  insuranceStatus: number;
  insuranceStatusName: string;
  branch: string;
  level: string;
  jobPosition: string;
  usertypeName: string;
  statusName: string;
}
