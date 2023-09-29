import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { drive_v3, google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { GdriveEnv } from '@config/env.config/gdrive.config';
import { GDRIVE_TOKEN } from '@common/constants/token.constant';
import * as fs from 'fs';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class GdriveService {
  private drive: drive_v3.Drive;
  private gdriveConfig: GdriveEnv;

  public constructor(
    private readonly configService: ConfigService,
    private readonly log: LoggerService,
  ) {
    this.initDrive();
    this.gdriveConfig = configService.get(GDRIVE_TOKEN);
  }

  private initDrive() {
    const keyFilePath = path.join(
      __dirname,
      '../../../google-service/imsdrive.json',
    );
    const scopes = ['https://www.googleapis.com/auth/drive'];

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: scopes,
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async uploadFile(fileName: string, filePath: string, mineType: string) {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [this.gdriveConfig.folderId],
        },
        media: {
          mimeType: mineType,
          body: fs.createReadStream(filePath),
        },
        fields: 'id,name',
      });
      this.log.info(
        `File uploaded to GDrive. File ID: ${response.data.id} - ${response.data.name}`,
      );
    } catch (e) {
      this.log.error(e, 'Error uploading file:');
      throw e;
    }
  }

  async uploadFolder(folderPath: string, extension: string, mineType: string) {
    const folder = await fs.promises.opendir(folderPath);
    for await (const dirent of folder) {
      if (dirent.isFile() && dirent.name.endsWith(extension)) {
        const filePath = path.join(folderPath, dirent.name);
        await this.uploadFile(dirent.name, filePath, mineType);
        await fs.promises.rm(filePath);
      }
    }
  }
}
