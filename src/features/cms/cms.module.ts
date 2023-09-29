import { NewsRelation } from '@/entities/news-relation.entity';
import { News } from '@entities/news.entity';
import { QuickNews } from '@entities/quicknews.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from '../comment/comment.module';
import { EntityTypeModule } from '../entity-type/entity-type.module';
import { FilesModule } from '../files/files.module';
import { Hrmv2Module } from '../hrmv2/hrmv2.module';
import { LikesModule } from '../likes/likes.module';
import { UserModule } from '../user/user.module';
import { CMSController } from './cms.controller';
import { CMSService } from './cms.service';
import { KomuModule } from '../komu/komu.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([News, QuickNews, NewsRelation]),
    FilesModule,
    Hrmv2Module,
    LikesModule,
    CommentModule,
    EntityTypeModule,
    UserModule,
    KomuModule,
  ],
  controllers: [CMSController],
  providers: [CMSService],
  exports: [CMSService],
})
export class CMSModule {}
