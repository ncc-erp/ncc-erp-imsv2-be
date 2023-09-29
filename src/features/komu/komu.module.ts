import { ClientModule } from '@/client/client.module';
import { HostName } from '@/client/type/client-env.type';
import { Module } from '@nestjs/common';
import { KomuServiceImpl } from './komu-impl.service';
import { KomuServiceMock } from './komu-mock.service';
import { KOMU_SERVICE_TOKEN } from '@/common/constants/token.constant';

const komuServiceProvider = {
  provide: KOMU_SERVICE_TOKEN,
  useClass: process.env.KOMU_SERVICE_SECURITY_CODE
    ? KomuServiceImpl
    : KomuServiceMock,
};

@Module({
  imports: [ClientModule.register({ hostName: HostName.KOMU })],
  providers: [komuServiceProvider],
  exports: [KOMU_SERVICE_TOKEN],
})
export class KomuModule {}
