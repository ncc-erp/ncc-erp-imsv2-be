import { HostName } from './client-env.type';

export interface ClientOptions {
  hostName: HostName;
  headers?: {
    [key in string]: string;
  };
}
