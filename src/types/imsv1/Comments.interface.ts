import { IAudit } from './base/audit.interface';

export interface IComments extends IAudit {
  Comment: string;
  MainCommentId?: string | null;
  EntityId: string;
  EntityName: string;
}
