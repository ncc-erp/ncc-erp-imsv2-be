import { UploadFile } from '@/entities/upload-file.entity';
import { OmitType } from '@nestjs/swagger';

export class UploadFileDTO extends OmitType(UploadFile, [
  'url',
  'deletedTime',
]) {
  constructor(partial: Partial<UploadFile>) {
    super();
    Object.assign(this, partial);
  }
}
