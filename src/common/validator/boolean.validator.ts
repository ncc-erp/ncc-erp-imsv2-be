import { isBoolean, isString } from 'class-validator';

export const booleanTransform = (value: unknown) => {
  if (isBoolean(value)) return value;
  if (isString(value) && value.toLowerCase() === 'true') return true;
  return false;
};
