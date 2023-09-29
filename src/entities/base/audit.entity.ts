import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  createdBy?: number;

  @ApiHideProperty()
  @Exclude()
  @CreateDateColumn()
  createdTime?: Date;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  updatedBy?: number;

  @ApiHideProperty()
  @Exclude()
  @UpdateDateColumn()
  updatedTime?: Date;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  deletedBy?: number;

  @ApiHideProperty()
  @Exclude()
  @DeleteDateColumn()
  deletedTime?: Date;

  @ApiHideProperty()
  @Exclude()
  @Column({ default: false })
  isDeleted: boolean;
}
