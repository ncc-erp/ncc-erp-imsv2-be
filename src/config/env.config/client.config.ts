import { registerAs } from '@nestjs/config';
import { ClientEnv, HostName } from '@/client/type/client-env.type';

const configObj: ClientEnv = {};

for (const name in HostName) {
  configObj[name as HostName] = {
    baseURL: process.env[`${name}_SERVICE_URL`],
    security: process.env[`${name}_SERVICE_SECURITY_CODE`],
    accountId: process.env[`${name}_SERVICE_ACCOUNT_ID`],
  };
}

export default registerAs('client', () => configObj);
