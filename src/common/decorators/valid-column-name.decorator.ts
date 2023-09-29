import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ async: true, name: 'isValidColumnName' })
@Injectable()
export class IsValidColumnNameConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly dataSource: DataSource) {}

  validate(columnName: string, args: ValidationArguments) {
    const columns = this.dataSource
      .getMetadata(args.constraints[0])
      .columns.map((column) => column.propertyName);
    return columns.includes(columnName);
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) is not a valid order options!';
  }
}
