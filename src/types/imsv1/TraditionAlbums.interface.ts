import { IAudit } from './base/audit.interface';

export interface ITraditionAlbums extends IAudit {
  Title: string;
  Description: string;
  Image: string;
  AlbumIndex: string;
  AlbumUrl: string;
  AlbumTime: Date;
  ParentId: string;
}
