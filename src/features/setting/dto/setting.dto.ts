import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SettingKomuDTO {
  @ApiProperty()
  @IsString()
  enableAllowCheckInIMSForAll: string;

  @ApiProperty()
  @IsString()
  enableToNoticeKomu: string;

  constructor(partial: Partial<SettingKomuDTO>) {
    Object.assign(this, partial);
  }
}

export class SettingEmailDTO {
  @ApiProperty()
  @IsString()
  host: string;

  @ApiProperty()
  @IsString()
  port: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsString()
  enableSsl: string;

  @ApiProperty()
  @IsString()
  defaultFromAddress: string;

  @ApiProperty()
  @IsString()
  defaultFromDisplayName: string;

  constructor(partial: Partial<SettingEmailDTO>) {
    Object.assign(this, partial);
  }
}
