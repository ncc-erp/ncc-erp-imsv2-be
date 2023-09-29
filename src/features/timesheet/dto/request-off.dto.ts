import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ISOStringToDate } from '@/utils/date';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { enumTransform } from '@common/validator/enum.validator';

export enum DateType {
  Fullday = 1,
  Morning = 2,
  Afternoon = 3,
  Custom = 4,
}

export enum AbsenceType {
  DiMuon = 1,
  VeSom = 3,
}

export class RequestOffDto {
  @IsNumber()
  dayOffTypeId: number;

  @IsString()
  reason: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Absences)
  absences: Absences[];
}

export class Absences {
  @IsDate()
  @Transform(({ value }) => ISOStringToDate(value))
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    example: '2022-01-01T10:30:00Z',
    description: 'The date in ISO 8601 format.',
  })
  dateAt: Date;

  @IsEnum(DateType)
  @ApiProperty({
    enum: Object.values(DateType),
    default: DateType.Fullday,
  })
  @Transform(({ value }) => enumTransform(value, DateType, true))
  dateType: DateType = DateType.Fullday;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    default: 0,
  })
  hour = 0;

  @IsEnum(AbsenceType)
  @ApiPropertyOptional({
    enum: Object.values(AbsenceType),
    default: 'null',
  })
  @Transform(({ value }) => enumTransform(value, AbsenceType, true))
  @IsOptional()
  absenceTime?: AbsenceType;
}

export class DayOffType {
  status: number;
  name: string;
  length: number;
  id: number;
}
