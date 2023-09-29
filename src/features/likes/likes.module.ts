import { UserLike } from '@entities/userlike.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { LikesService } from './likes.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserLike]), UserModule],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
