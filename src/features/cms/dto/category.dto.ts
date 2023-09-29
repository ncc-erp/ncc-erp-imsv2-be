import { ApiProperty } from '@nestjs/swagger';

export class SubCategoryDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  categoryColor: string;
}

export class CategoryDTO {
  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  subCategories: SubCategoryDTO[];
}
