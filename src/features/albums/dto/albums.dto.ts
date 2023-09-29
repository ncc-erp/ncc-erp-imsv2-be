import { TraditionalAlbums } from '@/entities/album.entity';
import { IsString } from 'class-validator';

export class AlbumsDTO extends TraditionalAlbums {
  @IsString()
  category?: string;

  @IsString()
  categoryColor?: string;

  constructor(albums: Partial<TraditionalAlbums>) {
    super();
    Object.assign(this, albums);
    this.category = albums.entityType?.displayName;
    this.categoryColor = albums.entityType?.color;
  }
}
