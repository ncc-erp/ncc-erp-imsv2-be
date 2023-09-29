import { TraditionalAlbums } from '@entities/album.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityTypeModule } from '../entity-type/entity-type.module';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { FilesModule } from '@features/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TraditionalAlbums]),
    EntityTypeModule,
    FilesModule,
  ],
  providers: [AlbumsService],
  controllers: [AlbumsController],
  exports: [AlbumsService],
})
export class AlbumsModule {}
