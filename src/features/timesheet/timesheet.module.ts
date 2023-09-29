import { ClientModule } from '@/client/client.module';
import { HostName } from '@/client/type/client-env.type';
import { Module } from '@nestjs/common';
import { TimeSheetController } from './timesheet.controller';
import { TimeSheetService } from './timesheet.service';

@Module({
  imports: [ClientModule.register({ hostName: HostName.TIMESHEET })],
  controllers: [TimeSheetController],
  providers: [TimeSheetService],
  exports: [TimeSheetService],
})
export class TimeSheetModule {}
