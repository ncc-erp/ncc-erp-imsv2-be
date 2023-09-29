import awsConfig from '@/config/env.config/aws.config';
import { UploadFile } from '@/entities/upload-file.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import gdriveConfig from '@config/env.config/gdrive.config';
import { GdriveService } from '@features/files/gdrive.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadFile]),
    ConfigModule.forFeature(awsConfig),
    ConfigModule.forFeature(gdriveConfig),
  ],
  controllers: [FilesController],
  providers: [FilesService, GdriveService],
  exports: [FilesService, GdriveService],
})
export class FilesModule {}
