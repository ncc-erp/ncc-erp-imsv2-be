import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config/env.config/config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@common/filter/http-exception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOption } from '@config/data-source.config';
import { envFilePath } from '@config/env-path.config';
import { Imsv1Module } from '@features/imsv1/imsv1.module';
import { mssqlDataSourceOptions } from '@config/mssql.data-source.config';
import { AlbumsModule } from '@features/albums/albums.module';
import { CMSModule } from '@features/cms/cms.module';
import { LikesModule } from '@features/likes/likes.module';
import { UserModule } from '@features/user/user.module';
import { AuthenticationModule } from '@features/authentication/authentication.module';
import { RoleModule } from '@features/role/role.module';
import { SettingModule } from '@features/setting/setting.module';
import { WidgetModule } from '@features/widget/widget.module';
import { EntityTypeModule } from '@features/entity-type/entity-type.module';
import { FilesModule } from '@features/files/files.module';
import { SyncDataModule } from '@features/sync-data/sync-data.module';
import { CommentModule } from '@features/comment/comment.module';
import { Hrmv2Module } from '@features/hrmv2/hrmv2.module';
import { LoggerModule } from './logger/logger.module';
import { TimeSheetModule } from '@features/timesheet/timesheet.module';
import { PublicModule } from '@features/public/public.module';
import { FaceIdModule } from '@features/face-id/face-id.module';
import { AuditSubscriber } from '@entities/subscriber/audit.subscriber';
import { UserInterceptor } from '@common/interceptors/user.interceptor';
import { ClsModule } from 'nestjs-cls';
import { NewsSubscriber } from '@entities/subscriber/news.subscriber';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulersModule } from '@/schedulers/schedulers.module';
import { TypeormExceptionFilter } from '@common/filter/typeorm-exception.filter';
import { LogErrorInterceptor } from '@common/interceptors/log-error.interceptor';
import { AuditLogModule } from '@features/audit-log/audit-log.module';
import { KomuModule } from './features/komu/komu.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      envFilePath: envFilePath,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    TypeOrmModule.forRoot(dataSourceOption),
    TypeOrmModule.forRoot(mssqlDataSourceOptions),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthenticationModule,
    RoleModule,
    Imsv1Module,
    AlbumsModule,
    CMSModule,
    LikesModule,
    UserModule,
    CommentModule,
    AuthenticationModule,
    SettingModule,
    WidgetModule,
    EntityTypeModule,
    FilesModule,
    SyncDataModule,
    Hrmv2Module,
    TimeSheetModule,
    FaceIdModule,
    PublicModule,
    LoggerModule,
    SchedulersModule,
    AuditLogModule,
    KomuModule,
  ],
  providers: [
    AuditSubscriber,
    NewsSubscriber,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LogErrorInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: TypeormExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
