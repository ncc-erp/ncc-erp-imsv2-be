import { TimeSheetUserInfoDTO } from '@/features/timesheet/dto/timesheet.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImagesInfoDTO {
  email: string;
  img: string;
  checkInAt: Date;
}

export class ImagesInfoUserDTO extends TimeSheetUserInfoDTO {
  img: string;
  checkInAt: Date;
}

export class CheckIn {
  @IsString()
  @IsNotEmpty()
  img: string;
}

class EmployeeFacialSetupDTO {
  imgs: string[];
  secondsTime: number;
  timeVerify: string;
  email: string;
}

export class CheckInDTO {
  currentDateTime: string;
  employeeFacialSetupDTO: EmployeeFacialSetupDTO;
}

export class ReturnCheckInDTO {
  facialRecognitionStatus: string;
  imageVerifyId: string;
  employeeId: string;
  accountEmployeeId: string;
  firstName: string;
  lastName: string;
  showMessage: boolean;
}
