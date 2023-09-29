import { registerAs } from '@nestjs/config';

export interface AwsConfig {
  profile: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  prefix: string;
  bucket: string;
}

export default registerAs(
  'aws',
  (): AwsConfig => ({
    bucket: process.env.AWS_S3_BUCKET,
    profile: process.env.AWS_REGION,
    prefix: process.env.AWS_PREFIX,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  }),
);
