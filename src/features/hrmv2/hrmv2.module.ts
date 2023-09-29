import { Hrmv2Controller } from './hrmv2.controller';
import { ClientModule } from '@/client/client.module';
import { HostName } from '@/client/type/client-env.type';
import { Module } from '@nestjs/common';
import { Hrmv2Service } from './hrmv2.service';

@Module({
  imports: [ClientModule.register({ hostName: HostName.HRMV2 })],
  controllers: [Hrmv2Controller],
  providers: [Hrmv2Service],
  exports: [Hrmv2Service],
})
export class Hrmv2Module {}
