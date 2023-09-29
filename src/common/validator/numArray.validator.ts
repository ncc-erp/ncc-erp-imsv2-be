import { BadRequestException } from '@nestjs/common';

export const numberArrayTransform = (value: unknown) => {
  if (!value) return [];

  if (Array.isArray(value) && value.every((e) => Number.isInteger(e)))
    return value;

  if (typeof value === 'string')
    return value.split(',').map((e) => {
      const n = Number(e);
      if (isNaN(n))
        throw new BadRequestException(
          `Invalid format for array of numbers: ${n}`,
        );

      return n;
    });
  throw new BadRequestException(
    `Invalid format for array of numbers: ${value}`,
  );
};
