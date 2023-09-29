import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'RequireFields', async: false })
@Injectable()
export class RequireFieldsConstraint<T>
  implements ValidatorConstraintInterface
{
  async validate(value: T, args: ValidationArguments) {
    if (value) return true;

    const [fieldName]: string[] = args.constraints;
    const obj = args.object as { [key: string]: unknown };

    if (obj[fieldName]) return true;
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `Must either include ${args.property} or ${args.constraints[0]}`;
  }
}

export function RequireFields(
  fieldName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [fieldName],
      validator: RequireFieldsConstraint,
    });
  };
}
