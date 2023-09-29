import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ClsService } from 'nestjs-cls/dist/src/lib/cls.service';
import { AuditLogService } from '@features/audit-log/audit-log.service';
import { User } from '@entities/user.entity';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    const startAt = process.hrtime();
    const { method, baseUrl, query, body, headers } = request;
    response.on('finish', async () => {
      const { statusCode } = response;
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
      let createdBy = this.cls.get<User>('user')?.emailAddress;

      if (!createdBy) {
        createdBy = headers.origin ?? headers.referer ?? 'Anonymous';
      }

      const auditLog = this.auditLogService.create({
        id: this.cls.get<string>('requestId'),
        method,
        statusCode,
        params: query,
        body,
        createdBy,
        executionTime: Math.round((responseTime + Number.EPSILON) * 100) / 100,
        endpoint: baseUrl,
        exception: this.cls.get('error') ?? {},
      });

      await this.auditLogService.save(auditLog);
    });
    next();
  }
}
