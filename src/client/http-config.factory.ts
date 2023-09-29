import { HttpModuleOptions } from '@nestjs/axios';
import { RawAxiosRequestHeaders } from 'axios';
import { ClientEnv } from './type/client-env.type';
import { ClientOptions } from './type/client-options.interface';
import { httpsAgent } from '@/client/ssl.config';

export function HttpConfigFactory(
  options: ClientOptions,
  clConfig: ClientEnv,
): HttpModuleOptions {
  const { hostName } = options;
  const { security, baseURL, accountId } = clConfig[hostName];

  let headers: RawAxiosRequestHeaders = {
    'Content-Type': 'application/json',
    'X-Secret-Key': security,
    securityCode: security,
  };

  if (accountId) {
    headers = { ...headers, 'X-Account-Id': accountId };
  }

  if (options.headers) {
    headers = { ...headers, ...options.headers };
  }

  return { baseURL, headers, httpsAgent };
}
