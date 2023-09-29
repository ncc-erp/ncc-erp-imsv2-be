import { UserWidget } from '@/entities/user-widget.entity';
import { User } from '@/entities/user.entity';
import { Widget } from '@entities/widget.entity';
import { EntityTypeModule } from '@features/entity-type/entity-type.module';
import { FilesModule } from '@features/files/files.module';
import { RoleModule } from '@features/role/role.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetSeedService } from './widget-seed.service';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { ConfigModule } from '@nestjs/config';
import seedDataConfig from '@config/env.config/seed-data.config';
import { SettingModule } from '@features/setting/setting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Widget, UserWidget, User]),
    RoleModule,
    FilesModule,
    EntityTypeModule,
    SettingModule,
    ConfigModule.forFeature(seedDataConfig),
  ],
  controllers: [WidgetController],
  providers: [WidgetService, WidgetSeedService],
  exports: [WidgetService],
})
export class WidgetModule {}
