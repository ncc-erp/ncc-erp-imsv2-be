import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import {
  PermitActions,
  RequireMission,
} from '@common/decorators/authorization.decorator';
import { Mission } from '@type/authorization/mission.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Action } from '@type/authorization/action.enum';
import { AuditLogFilter } from '@features/audit-log/dto/audit-log-filter.dto';
import { ApiPaginatedResponse } from '@common/decorators/paginated-response.decorator';
import { AuditLogDto } from '@features/audit-log/dto/audit-log.dto';

@Controller('audit-log')
@RequireMission(Mission.AUDIT_LOG)
@ApiBearerAuth()
@ApiTags('Audit Log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @PermitActions(Action.READ)
  @ApiPaginatedResponse({ model: AuditLogDto })
  async getAll(@Query() query: AuditLogFilter) {
    return await this.auditLogService.getAll(query);
  }
}
