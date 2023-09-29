import { BadRequestException } from '@nestjs/common';
import { isDate, isISO8601 } from 'class-validator';
import * as moment from 'moment';

interface DateOptions {
  includeTime?: boolean;
}

const ISOStringToDate = (iso: string | Date) => {
  if (!iso || isDate(iso)) return iso;
  if (isISO8601(iso, { strict: true })) return new Date(iso);

  throw new BadRequestException('Invalid ISO string Date');
};

const dateToString = (date: Date, option?: DateOptions) => {
  let format = 'DD-MM-YYYY';
  if (option.includeTime) format += ' HH:mm:ss';

  return moment(date).format(format);
};

const convertLocalDateTimeToUTC = (date: Date) => {
  if (!date) return null;
  return moment(date).subtract(7, 'hour').toDate();
};

export { dateToString, ISOStringToDate, convertLocalDateTimeToUTC };
