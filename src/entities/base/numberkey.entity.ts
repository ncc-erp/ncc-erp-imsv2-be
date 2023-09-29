import { PrimaryColumn } from 'typeorm';

export abstract class NumberKeyEntity {
  @PrimaryColumn()
  id: number;
}
