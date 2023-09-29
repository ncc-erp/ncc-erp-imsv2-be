import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RolePermission } from '@entities/role-permission.entity';
import { Role } from '@entities/role.entity';
import { RoleSeedService } from './role-seed.service';
import { PermissionGuard } from '@/common/guards/permission.guard';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import seedDataConfig from '@config/env.config/seed-data.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RolePermission]),
    ConfigModule.forFeature(seedDataConfig),
  ],
  controllers: [RoleController],
  providers: [
    RoleService,
    RoleSeedService,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
  exports: [RoleService],
})
export class RoleModule {}
