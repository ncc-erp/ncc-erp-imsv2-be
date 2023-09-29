import { IAudit } from './base/audit.interface';

export interface IAbpUsers extends IAudit {
  UserName: string;
  EmailAddress: string;
  Name: string;
  Surname: string;
  PhoneNumber: string;
  IsActive: boolean;
  Avatar: string;
  KomuUserName: string;
  UserCode: string;
  KomuUserId: string;
}
