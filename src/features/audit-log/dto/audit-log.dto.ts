import { PartialType } from '@nestjs/swagger';
import { AuditLog } from '@entities/audit-log.entity';

export class AuditLogDto extends PartialType(AuditLog) {}
