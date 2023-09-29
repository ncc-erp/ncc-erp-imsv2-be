import { ClientModule } from '@/client/client.module';
import { HostName } from '@/client/type/client-env.type';
import clientConfig from '@/config/env.config/client.config';
import { SettingModule } from '@features/setting/setting.module';
import { TimeSheetModule } from '@features/timesheet/timesheet.module';
import { UserModule } from '@features/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FaceIdController } from './face-id.controller';
import { FaceIdService } from './face-id.service';

@Module({
  imports: [
    ClientModule.register({ hostName: HostName.FACEID }),
    ConfigModule.forFeature(clientConfig),
    TimeSheetModule,
    UserModule,
    SettingModule,
  ],
  controllers: [FaceIdController],
  providers: [FaceIdService],
  exports: [FaceIdService],
})
export class FaceIdModule {}
