import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PageMetaDTOParameters } from './page-meta-dto-parameters.interface';

export class PageableDTO<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly size: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor(data: T[], { pageOptionsDTO, itemCount }: PageMetaDTOParameters) {
    this.data = data;
    this.page = pageOptionsDTO.page;
    this.size = pageOptionsDTO.size;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.size);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
