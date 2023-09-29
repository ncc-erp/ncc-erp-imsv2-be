import { LoggerService } from '@/logger/logger.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class ClientService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ClientService.name);
  }

  async get<R>(pathName: string, options?: AxiosRequestConfig): Promise<R> {
    const request = this.httpService
      .get(pathName, options)
      .pipe(map((res) => res.data))
      .pipe(
        catchError((e) => {
          this.logger.error(e);
          throw e;
        }),
      );
    const data = await lastValueFrom(request);

    return data;
  }

  async post<T, R>(
    pathName: string,
    body: T,
    options?: AxiosRequestConfig,
  ): Promise<R> {
    const request = this.httpService
      .post(pathName, body, options)
      .pipe(map((res) => res.data))
      .pipe(
        catchError((e) => {
          this.logger.error(e);
          throw e;
        }),
      );
    const data = await lastValueFrom(request);

    return data;
  }

  async patch<T, R>(
    pathName: string,
    body: T,
    options?: AxiosRequestConfig,
  ): Promise<R> {
    const request = this.httpService
      .patch(pathName, body, options)
      .pipe(map((res) => res.data))
      .pipe(
        catchError((e) => {
          this.logger.error(e);
          throw e;
        }),
      );
    const data = await lastValueFrom(request);

    return data;
  }

  async delete<R>(pathName: string, options?: AxiosRequestConfig): Promise<R> {
    const request = this.httpService
      .delete(pathName, options)
      .pipe(map((res) => res.data))
      .pipe(
        catchError((e) => {
          this.logger.error(e);
          throw e;
        }),
      );
    const data = await lastValueFrom(request);

    return data;
  }
}
