import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { ApiPaginatedResponse } from '@/common/decorators/paginated-response.decorator';
import { Action } from '@/types/authorization/action.enum';
import { Mission } from '@/types/authorization/mission.enum';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileFilter } from './dto/file-filter.dto';
import { UploadFileDTO } from './dto/file.dto';
import { FileUploadDto } from './dto/new-file.dto';
import { FilesService } from './files.service';
import { Response } from 'express';

@ApiTags('Files')
@RequireMission(Mission.UPLOAD_FILE)
@ApiBearerAuth()
@Controller('file')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @PermitActions(Action.READ)
  @Get()
  @ApiPaginatedResponse({
    model: UploadFileDTO,
  })
  async getFiles(@Query() query: FileFilter) {
    return await this.filesService.getAllFiles(query);
  }

  @PermitActions(Action.READ)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5000000,
      },
    }),
  )
  @Post()
  @ApiBody({
    description: 'New file to upload',
    type: FileUploadDto,
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const uploadedFile = await this.filesService.uploadFile(file);
    return uploadedFile;
  }

  @PermitActions(Action.MANAGE)
  @Delete(':key')
  async deleteFile(@Param('key') fileKey: string) {
    await this.filesService.deleteFile(fileKey);
  }

  @PermitActions(Action.READ)
  @Get('/download/:key')
  async downloadFile(@Param('key') fileKey: string, @Res() res: Response) {
    const data = await this.filesService.downloadFile(fileKey);
    res.type(data.ContentType);
    res.attachment(fileKey);
    (data.Body as any).pipe(res);
  }
}
