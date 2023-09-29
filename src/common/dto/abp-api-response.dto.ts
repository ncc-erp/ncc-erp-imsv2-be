export class AbpApiResponse<T> {
  result: T;
  targetUrl?: string;
  success: boolean;
  error?: object;
  unAuthorizedRequest: boolean;
  __abp: boolean;

  constructor(data: T) {
    this.result = data;
  }
}
