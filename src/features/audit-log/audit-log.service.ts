import { Injectable } from '@nestjs/common';
import { BaseService } from '@features/base/base.service';
import { AuditLog } from '@entities/audit-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AuditLogFilter } from '@features/audit-log/dto/audit-log-filter.dto';
import { PageableDTO } from '@common/dto/pageable.dto';
import { RequestMethod } from '@features/audit-log/dto/request-method.enum';

@Injectable()
export class AuditLogService extends BaseService<AuditLog> {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {
    super(auditLogRepository, AuditLog);
  }

  async getAll(query: AuditLogFilter) {
    const {
      orderBy,
      order,
      size,
      skip,
      from,
      to,
      endpoint,
      exception,
      createdBy,
      method,
    } = query;

    const where: FindOptionsWhere<AuditLog> = {
      ...(endpoint && {
        endpoint: ILike(`%${endpoint}%`),
      }),
      ...(exception && {
        exception: ILike(`%${exception}%`),
      }),
      ...(createdBy && {
        createdBy: ILike(`%${createdBy}%`),
      }),
      ...(from &&
        !to && {
          createdTime: MoreThanOrEqual(from),
        }),
      ...(to &&
        !from && {
          createdTime: LessThanOrEqual(to),
        }),
      ...(from &&
        to && {
          createdTime: Between(from, to),
        }),
      ...(method && {
        method: RequestMethod[method],
      }),
    };

    const [auditLog, count] = await this.findAll({
      where,
      order: {
        [orderBy]: order,
      },
      skip: skip,
      take: size,
    });

    return new PageableDTO(auditLog, {
      pageOptionsDTO: query,
      itemCount: count,
    });
  }
}
