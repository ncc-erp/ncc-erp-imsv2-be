import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isDefined, isEnum } from 'class-validator';

@Injectable()
export class EnumValidationPipe<T extends object>
  implements PipeTransform<string, string>
{
  constructor(private enumEntity: T, private requireDefine: boolean) {}

  transform(value: string): string {
    if (!isDefined(value) || value === '')
      if (this.requireDefine)
        throw new BadRequestException("Missing fields's value");
      else return '';

    if (isEnum(value, this.enumEntity)) return value;

    const errorMessage = `The value ${value} is not valid. See the acceptable values: 
    ${Object.keys(this.enumEntity)}`;
    throw new BadRequestException(errorMessage);
  }
}
