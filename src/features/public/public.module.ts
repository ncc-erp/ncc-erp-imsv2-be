import { User } from '@/entities/user.entity';
import { CMSModule } from '@features/cms/cms.module';
import { Hrmv2Module } from '@features/hrmv2/hrmv2.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from '@features/role/role.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CMSModule,
    Hrmv2Module,
    RoleModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
