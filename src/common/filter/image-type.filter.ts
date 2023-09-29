import { extname } from 'path';
import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import { UnsupportedMediaTypeException } from '@nestjs/common';

export const imageTypeFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

  const fileExtension = extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(fileExtension)) {
    callback(null, true);
  } else {
    callback(new UnsupportedMediaTypeException('Only image files are allowed'));
  }
};
