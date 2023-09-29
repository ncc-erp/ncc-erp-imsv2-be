import { ApiHideProperty, OmitType } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateTimesheetLogToday {
  @ApiHideProperty()
  emailAddress?: string;
  @IsString()
  projectCode: string;
  @IsString()
  taskName: string;
  @IsNumber()
  @Min(0)
  hour: number;
  @IsString()
  note: string;
}

export class CreateTimesheetLogDefaultToday extends OmitType(
  CreateTimesheetLogToday,
  ['projectCode', 'taskName'] as const,
) {
  @ApiHideProperty()
  dateAt: Date = new Date();
}
