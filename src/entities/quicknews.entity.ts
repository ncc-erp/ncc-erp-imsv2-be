import { AuditEntity } from '@entities/base/audit.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class QuickNews extends AuditEntity {
  @Column()
  description: string;

  @Column({ nullable: true })
  imsv1EntityId: number;

  @Column({ nullable: true })
  imsv1EntityName: string;
}
