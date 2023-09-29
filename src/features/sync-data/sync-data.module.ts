import adminConfig from '@/config/env.config/admin.config';
import { EntityType } from '@entities/entityType.entity';
import { Setting } from '@entities/setting.entity';
import { UserModule } from '@features/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncDataService } from './sync-data.service';
import seedDataConfig from '@config/env.config/seed-data.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting, EntityType]),
    ConfigModule.forFeature(adminConfig),
    ConfigModule.forFeature(seedDataConfig),
    UserModule,
  ],
  providers: [SyncDataService],
})
export class SyncDataModule {}
