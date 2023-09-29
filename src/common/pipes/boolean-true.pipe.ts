import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isDefined } from 'class-validator';

@Injectable()
export class BooleanTruePipe implements PipeTransform<string, boolean> {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    return !isDefined(value) || value.toLowerCase() !== 'false';
  }
}
