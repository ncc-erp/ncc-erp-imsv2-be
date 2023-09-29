import adminConfig from '@/config/env.config/admin.config';
import { EntityType } from '@entities/entityType.entity';
import { Setting } from '@entities/setting.entity';
import { AlbumsModule } from '@features/albums/albums.module';
import { CMSModule } from '@features/cms/cms.module';
import { CommentModule } from '@features/comment/comment.module';
import { LikesModule } from '@features/likes/likes.module';
import { UserModule } from '@features/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImsV1MigrateService } from './imsv1-seed.service';
import { Imsv1Service } from './imsv1.service';
import seedDataConfig from '@config/env.config/seed-data.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting, EntityType]),
    ConfigModule.forFeature(adminConfig),
    ConfigModule.forFeature(seedDataConfig),
    UserModule,
    CMSModule,
    CommentModule,
    LikesModule,
    AlbumsModule,
  ],
  providers: [Imsv1Service, ImsV1MigrateService],
})
export class Imsv1Module {}
