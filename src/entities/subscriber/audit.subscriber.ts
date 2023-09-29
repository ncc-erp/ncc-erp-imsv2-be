import { LoggerService } from '@/logger/logger.service';
import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RecoverEvent,
  SoftRemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AuditEntity } from '../base/audit.entity';
import { SYSTEM } from '@common/constants/common.constant';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<AuditEntity> {
  constructor(
    dataSource: DataSource,
    private readonly cls: ClsService,
    private readonly logger: LoggerService,
  ) {
    dataSource.subscribers.push(this);
    this.logger.setContext(AuditSubscriber.name);
  }

  listenTo() {
    return AuditEntity;
  }

  beforeInsert(event: InsertEvent<AuditEntity>) {
    if (!event.entity)
      return this.logger.warn(
        'Consider using .save() method because Subscriber can only be triggered that way',
      );
    const user = this.cls.get('user');
    if (!event.entity.createdBy) event.entity.createdBy = user?.id ?? SYSTEM;
  }

  beforeUpdate(event: UpdateEvent<AuditEntity>) {
    if (!event.entity)
      return this.logger.warn(
        'Consider using .save() method because Subscriber can only be triggered that way',
      );
    const user = this.cls.get('user');
    event.entity.updatedBy = user?.id ?? SYSTEM;
  }

  beforeSoftRemove({
    entity,
    manager,
    metadata,
  }: SoftRemoveEvent<AuditEntity>) {
    if (!entity)
      return this.logger.warn(
        'Consider using .softRemove() method because Subscriber can only be triggered that way',
      );
    const user = this.cls.get('user');
    entity.deletedBy = user?.id ?? SYSTEM;
    entity.isDeleted = true;
    return manager.getRepository(metadata.name).save(entity);
  }

  beforeRecover({ entity, manager, metadata }: RecoverEvent<AuditEntity>) {
    if (!entity)
      return this.logger.warn(
        'Consider using .recover() method because Subscriber can only be triggered that way',
      );
    entity.isDeleted = false;
    return manager.getRepository(metadata.name).save(entity);
  }
}
