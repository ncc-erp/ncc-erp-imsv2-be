import { Column, CreateDateColumn, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UuidEntity } from '@entities/base/uuid.enitty';

@Entity()
export class AuditLog extends UuidEntity {
  @Column()
  @ApiProperty()
  endpoint: string;

  @Column()
  @ApiProperty()
  method: string;

  @Column()
  @ApiProperty()
  statusCode: number;

  @Column({ type: 'simple-json', nullable: true })
  @ApiProperty()
  params?: object;

  @Column({ type: 'simple-json', nullable: true })
  @ApiProperty()
  body?: object;

  @Column({ type: 'double precision' })
  @ApiProperty()
  executionTime: number;

  @Column()
  @ApiProperty({ nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  @ApiProperty()
  @Index()
  createdTime: Date;

  @Column({ type: 'simple-json', nullable: true })
  @ApiPropertyOptional()
  exception?: object;
}
