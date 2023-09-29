import { ClientService } from '@/client/client.service';
import { HostName } from '@/client/type/client-env.type';
import { AbpApiResponse } from '@/common/dto/abp-api-response.dto';
import { User } from '@/entities/user.entity';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
  CreateTimesheetLogDefaultToday,
  CreateTimesheetLogToday,
} from './dto/timesheet-log.dto';
import { TimeSheetProjectDto } from './dto/timesheet-project.dto';
import {
  TimeSheetUserInfoDTO,
  TopUnlockDTO,
  UnlockHistory,
  WorkingStatusUserDTO,
} from './dto/timesheet.dto';
import { DayOffType, RequestOffDto } from './dto/request-off.dto';
import { LockedTimeSheet } from './dto/locked-timesheet.dto';

@Injectable()
export class TimeSheetService {
  constructor(
    @Inject(HostName.TIMESHEET)
    private readonly clientService: ClientService,
    private readonly clsService: ClsService,
  ) {}

  async getTopUserUnlock() {
    const { result } = await this.clientService.get<
      AbpApiResponse<TopUnlockDTO>
    >('/api/services/app/Info/TopUserUnlock');
    return result;
  }

  async getAllHistory() {
    const { result } = await this.clientService.get<
      AbpApiResponse<UnlockHistory[]>
    >('/api/services/app/Info/GetAllHistory');
    return result;
  }

  async getAllUserByEmail(emails: string[]) {
    const { result } = await this.clientService.post<
      string[],
      AbpApiResponse<TimeSheetUserInfoDTO[]>
    >('/api/services/app/Public/GetAllUserByEmail', emails);
    return result;
  }

  async getWorkingStatusByUser(emailAddress: string) {
    const res = await this.clientService.get<
      AbpApiResponse<WorkingStatusUserDTO>
    >(
      `/api/services/app/Public/GetWorkingStatusByUser?emailAddress=${emailAddress}`,
    );

    return res.result;
  }

  async unlockToLogTimesheet() {
    try {
      const emailAddress = this.clsService.get<User>('user').emailAddress;
      const { success } = await this.clientService.post<
        null,
        AbpApiResponse<null>
      >(
        `/api/services/app/Info/UnlockToLogTimesheet?emailAddress=${emailAddress}`,
        null,
      );
      return success;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async unlockToApproveTimesheet() {
    try {
      const emailAddress = this.clsService.get<User>('user').emailAddress;
      const { success } = await this.clientService.post<
        null,
        AbpApiResponse<null>
      >(
        `/api/services/app/Info/UnlockToApproveTimesheet?emailAddress=${emailAddress}`,
        null,
      );
      return success;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async unlockSaturday() {
    try {
      const emailAddress = this.clsService.get<User>('user').emailAddress;
      const { success } = await this.clientService.post<
        null,
        AbpApiResponse<null>
      >(
        `/api/services/app/Info/UnlockSaturday1?emailAddress=${emailAddress}`,
        null,
      );
      return success;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async createTimesheetLogDefaultToday(
    payload: CreateTimesheetLogDefaultToday,
  ) {
    try {
      payload.emailAddress = this.clsService.get<User>('user').emailAddress;
      const result = await this.clientService.post<
        CreateTimesheetLogDefaultToday,
        AbpApiResponse<string>
      >('/api/services/app/MyTimesheets/CreateByKomu', payload);
      return result;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
  async createTimesheetLogToday(payload: CreateTimesheetLogToday) {
    try {
      payload.emailAddress = this.clsService.get<User>('user').emailAddress;
      const result = await this.clientService.post<
        CreateTimesheetLogToday,
        AbpApiResponse<string>
      >('/api/services/app/MyTimesheets/CreateFullByKomu', payload);
      return result;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getTimesheetProject() {
    try {
      const emailAddress = this.clsService.get<User>('user').emailAddress;
      const result = await this.clientService.get<
        AbpApiResponse<TimeSheetProjectDto[]>
      >(
        `/api/services/app/IMS/GetProjectsIncludingTasksByUserEmailIMS?email=${emailAddress}`,
      );
      return result;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getDayOffType() {
    try {
      const result = await this.clientService.get<AbpApiResponse<DayOffType[]>>(
        `/api/services/app/IMS/GetAllAbsenceTypeByIMS`,
      );
      return result;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async createRequestOff(payload: RequestOffDto) {
    try {
      const emailAddress = this.clsService.get<User>('user').emailAddress;
      const result = await this.clientService.post<
        RequestOffDto,
        AbpApiResponse<RequestOffDto>
      >(
        `api/services/app/IMS/SubmitToPendingNewByIMS?email=${emailAddress}`,
        payload,
      );
      return result;
    } catch (e) {
      if (e?.response?.data) return e.response.data;
      throw new InternalServerErrorException(e.message);
    }
  }

  async getLockedTimesheets() {
    try {
      const emailAddress = this.clsService.get<User>('user').emailAddress;
      const result = await this.clientService.get<
        AbpApiResponse<LockedTimeSheet>
      >(
        `api/services/app/Info/GetAllTimesheetLocked1?emailAddress=${emailAddress}`,
      );
      return result;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
