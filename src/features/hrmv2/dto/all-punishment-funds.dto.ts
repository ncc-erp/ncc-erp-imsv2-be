import { Expose } from 'class-transformer';
import { GridParam } from './grid-param.dto';

export class AllPunishmentFundsDTO {
  @Expose()
  amount: number;
  @Expose()
  date: Date;
  @Expose()
  note: string;
}

export class InputToGetAllPagingDTO {
  gridParam: GridParam;
}
