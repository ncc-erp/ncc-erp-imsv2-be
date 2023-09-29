import { IAudit } from './base/audit.interface';

export interface INews extends IAudit {
  Title: string;
  Description: string;
  ShortDescription: string;
  Piority: number;
  Status: number;
  EffectiveStartTime: Date;
  EffectiveEndTime: Date;
  Image: string;
  CoverImage: string;
  EntityTypeId: string;
}
