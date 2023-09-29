import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({
    message: 'Comment cannot be empty',
  })
  comment: string;

  @IsOptional()
  @IsInt()
  parentCommentId: number;

  @IsInt()
  newsId: number;
}
