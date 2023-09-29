import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, DeleteDateColumn, Entity } from 'typeorm';
import { AutoIncrementEntity } from './base/auto-increment.entity';

@Entity()
export class UploadFile extends AutoIncrementEntity {
  @ApiProperty()
  @CreateDateColumn()
  createdTime: Date;

  @DeleteDateColumn()
  deletedTime?: Date;

  @ApiProperty()
  @Column()
  public key: string;

  @Column()
  public url: string;
}
