import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class AutoIncrementEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;
}
