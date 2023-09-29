import { registerAs } from '@nestjs/config';
import { GDRIVE_TOKEN } from '@common/constants/token.constant';

export interface GdriveEnv {
  folderId: string;
}

export default registerAs(
  GDRIVE_TOKEN,
  (): GdriveEnv => ({
    folderId: process.env.GOOGLE_DRIVE_FOLDER_UPLOAD_AUDIT_LOG_ID,
  }),
);
