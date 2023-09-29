import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { Action } from '@/types/authorization/action.enum';
import { Mission } from '@/types/authorization/mission.enum';
import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DateType, RequestOffDto } from './dto/request-off.dto';
import {
  CreateTimesheetLogDefaultToday,
  CreateTimesheetLogToday,
} from './dto/timesheet-log.dto';
import { TopUnlockDTO, UnlockHistory } from './dto/timesheet.dto';
import { TimeSheetService } from './timesheet.service';

@RequireMission(Mission.TIMESHEET)
@ApiTags('TimeSheet')
@Controller('time-sheet')
@ApiBearerAuth()
export class TimeSheetController {
  constructor(private readonly timeSheetService: TimeSheetService) {}

  @PermitActions(Action.READ)
  @Get('unlock/top-user')
  @ApiResponse({ type: TopUnlockDTO })
  async getTopUserUnlock() {
    return await this.timeSheetService.getTopUserUnlock();
  }

  @PermitActions(Action.READ)
  @Get('unlock/histories')
  @ApiResponse({ type: [UnlockHistory] })
  async getAllHistory() {
    return await this.timeSheetService.getAllHistory();
  }

  @PermitActions(Action.READ)
  @Post('unlock/log-timesheet')
  async unlockToLogTimesheet() {
    const success = await this.timeSheetService.unlockToLogTimesheet();
    if (!success) throw new BadGatewayException('Remote service error');
    return {
      status: HttpStatus.ACCEPTED,
    };
  }

  @PermitActions(Action.MANAGE)
  @Post('unlock/approve-timesheet')
  async unlockToApproveTimesheet() {
    const success = await this.timeSheetService.unlockToApproveTimesheet();
    if (!success) throw new BadGatewayException('Remote service error');
    return {
      status: HttpStatus.ACCEPTED,
    };
  }

  @PermitActions(Action.MANAGE)
  @Post('unlock/saturday')
  async unlockSaturday() {
    const success = await this.timeSheetService.unlockSaturday();
    if (!success) throw new BadGatewayException('Remote service error');
    return {
      status: HttpStatus.ACCEPTED,
    };
  }

  @PermitActions(Action.READ)
  @Post('timesheet-log-today')
  async createTimeSheetLogToday(@Body() payload: CreateTimesheetLogToday) {
    const data = await this.timeSheetService.createTimesheetLogToday(payload);
    if (!data.success) throw new BadRequestException(data.result);
    return data.result;
  }

  @PermitActions(Action.READ)
  @Post('timesheet-log-default-today')
  async createTimeSheetLogDefaultToday(
    @Body() payload: CreateTimesheetLogDefaultToday,
  ) {
    const data = await this.timeSheetService.createTimesheetLogDefaultToday(
      payload,
    );
    if (!data.success) throw new BadRequestException(data.result);
    return data.result;
  }

  @PermitActions(Action.READ)
  @Get('project')
  async getTimesheetProject() {
    const data = await this.timeSheetService.getTimesheetProject();
    if (!data.success) throw new BadGatewayException(data.result);
    return data.result;
  }

  @PermitActions(Action.READ)
  @Get('dayoff-type')
  async getDayOffType() {
    const data = await this.timeSheetService.getDayOffType();
    if (!data.success) throw new BadGatewayException(data.error);
    return data.result;
  }

  @PermitActions(Action.READ)
  @Post('submit-request-off')
  @ApiBody({
    type: RequestOffDto,
    examples: {
      FullDay: {
        value: {
          dayOffTypeId: 1,
          reason: 'caused',
          absences: [
            {
              dateAt: new Date(),
              dateType: DateType.Fullday,
              hour: 0,
              absenceTime: null,
            },
          ],
        } as RequestOffDto,
      },
      Morning: {
        value: {
          dayOffTypeId: 1,
          reason: 'caused',
          absences: [
            {
              dateAt: new Date(),
              dateType: DateType.Morning,
              hour: 0,
              absenceTime: null,
            },
          ],
        } as RequestOffDto,
      },
      Afternoon: {
        value: {
          dayOffTypeId: 1,
          reason: 'caused',
          absences: [
            {
              dateAt: new Date(),
              dateType: DateType.Afternoon,
              hour: 0,
              absenceTime: null,
            },
          ],
        } as RequestOffDto,
      },
      DiMuon: {
        value: {
          dayOffTypeId: 1,
          reason: 'caused',
          absences: [
            {
              dateAt: new Date(),
              dateType: DateType.Custom,
              hour: 2,
              absenceTime: 1,
            },
          ],
        } as RequestOffDto,
      },
      VeSom: {
        value: {
          dayOffTypeId: 1,
          reason: 'caused',
          absences: [
            {
              dateAt: new Date(),
              dateType: DateType.Custom,
              hour: 2,
              absenceTime: 3,
            },
          ],
        } as RequestOffDto,
      },
    },
  })
  async createRequestOff(@Body() payload: RequestOffDto) {
    const data = await this.timeSheetService.createRequestOff(payload);
    if (!data.success) throw new BadRequestException(data.error);
    return data.result;
  }

  @PermitActions(Action.READ)
  @Get('locked-timesheets')
  async getLockedTimesheets() {
    const data = await this.timeSheetService.getLockedTimesheets();
    if (!data.success) throw new BadRequestException(data.error);
    return data.result;
  }
}
