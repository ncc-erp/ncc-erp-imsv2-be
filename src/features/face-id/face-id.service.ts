import { ClientService } from '@/client/client.service';
import { ClientEnv, HostName } from '@/client/type/client-env.type';
import { AbsenceStatus } from '@/types/working-status.enum';
import { SettingService } from '@features/setting/setting.service';
import { TimeSheetService } from '@features/timesheet/timesheet.service';
import { UserService } from '@features/user/user.service';
import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import {
  CheckInDTO,
  ImagesInfoDTO,
  ImagesInfoUserDTO,
  ReturnCheckInDTO,
} from './dto/face-id.dto';

@Injectable()
export class FaceIdService {
  private clConfig;

  constructor(
    @Inject(HostName.FACEID)
    private readonly clientService: ClientService,
    private readonly timeSheetService: TimeSheetService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly settingService: SettingService,
  ) {
    this.clConfig = this.configService.get<ClientEnv>('client');
  }

  async getAllFacesAsync() {
    let listCheckInImage: ImagesInfoDTO[] = [];
    try {
      listCheckInImage = await this.clientService.get<ImagesInfoDTO[]>(
        '/employees/most-recent-images',
      );
    } catch (ex) {
      return [];
    }

    listCheckInImage.forEach((i) => {
      i.img = `${
        this.clConfig.FACEID.baseURL
      }/upload-image?pathValue=${i.img.replace('\\', '/')}`;
    });

    const listEmail = listCheckInImage.map((s) => s.email);
    const listInfoUserByEmail = await this.timeSheetService.getAllUserByEmail(
      listEmail,
    );

    const result = listCheckInImage
      .map((u) => {
        const k = listInfoUserByEmail.find((l) => l.emailAddress === u.email);
        const { email, ...imageInfo } = u;

        if (k) {
          return {
            ...k,
            ...imageInfo,
          } as ImagesInfoUserDTO;
        }

        return { ...imageInfo, emailAddress: email } as ImagesInfoUserDTO;
      })
      .filter((u) => !!u)
      .sort(
        (x, y) =>
          new Date(y.checkInAt).getTime() - new Date(x.checkInAt).getTime(),
      );

    return result;
  }

  private async isAllowedCheckInByIMS(email: string) {
    const {
      komu: { enableAllowCheckInIMSForAll },
    } = await this.settingService.getSettings();

    if (enableAllowCheckInIMSForAll) {
      return true;
    }
    const result = await this.timeSheetService.getWorkingStatusByUser(email);
    return result?.status === AbsenceStatus.Approved;
  }

  async checkInFaceId(userId: number, img: string) {
    const { emailAddress } = await this.userService.findOneWhere({
      id: userId,
    });

    if (!(await this.isAllowedCheckInByIMS(emailAddress))) {
      throw new BadGatewayException(
        'CHECKIN IMS is allowed only for approved WFH!',
      );
    }

    const data = new CheckInDTO();
    data.currentDateTime = moment().format('YYYY-MM-DDTHH:mm:ss');
    data.employeeFacialSetupDTO = {
      imgs: [img.replace('data:image/jpeg;base64,', '')],
      secondsTime: 0,
      timeVerify: '',
      email: emailAddress,
    };

    const result = await this.clientService.post<CheckInDTO, ReturnCheckInDTO>(
      '/employees/facial-recognition/ims-verify',
      data,
    );

    return result;
  }
}
