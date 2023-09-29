import { registerAs } from '@nestjs/config';

export interface AdminCreEnv {
  emails: string;
}

export default registerAs(
  'admin',
  (): AdminCreEnv => ({
    emails: process.env.ADMIN_CREDENTIALS,
  }),
);
