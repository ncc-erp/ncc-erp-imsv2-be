import { IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { NumberKeyEntity } from './base/numberkey.entity';

@Entity()
export class Setting extends NumberKeyEntity {
  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  value: string;
}
