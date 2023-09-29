export interface IAudit {
  CreationTime: Date | null;
  CreatorUserId: string;
  DeletionTime: Date | null;
  DeleterUserId: string;
  LastModificationTime: Date | null;
  LastModifierUserId: string;
  IsDeleted: boolean;
  Id: string;
}
