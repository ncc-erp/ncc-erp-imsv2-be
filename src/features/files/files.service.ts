import { ERROR_MESSAGE } from '@/common/constants/messages.constant';
import { AwsConfig } from '@/config/env.config/aws.config';
import { UploadFile } from '@/entities/upload-file.entity';
import { LoggerService } from '@/logger/logger.service';
import { stringFormat } from '@/utils/string';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  CompleteMultipartUploadCommandOutput,
  S3,
  S3Client,
} from '@aws-sdk/client-s3';
import { FileFilter } from './dto/file-filter.dto';
import { Upload } from '@aws-sdk/lib-storage';
import { BaseService } from '@features/base/base.service';
import { PageableDTO } from '@common/dto/pageable.dto';
import { UploadFileDTO } from '@features/files/dto/file.dto';
import { formatImageUrl } from '@utils/url';

@Injectable()
export class FilesService extends BaseService<UploadFile> {
  private s3: S3;
  private s3Client: S3Client;
  private awsConfig;

  constructor(
    @InjectRepository(UploadFile)
    private readonly uploadFileRepository: Repository<UploadFile>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    super(uploadFileRepository, UploadFile);
    this.awsConfig = this.configService.get<AwsConfig>('aws');

    const configObj = {
      credentials: {
        accessKeyId: this.awsConfig.accessKeyId,
        secretAccessKey: this.awsConfig.secretAccessKey,
      },
      region: this.awsConfig.region,
    };

    this.s3 = new S3(configObj);
    this.s3Client = new S3Client(configObj);

    this.logger.setContext(FilesService.name);
  }

  async getAllFiles(filter: FileFilter) {
    const { orderBy, search, order, skip, size } = filter;
    const [result, count] = await this.findAll({
      select: {
        id: true,
        key: true,
        createdTime: true,
      },
      ...(search && {
        where: {
          key: ILike(`%${search}%`),
        },
      }),
      order: {
        [orderBy]: order,
      },
      skip: skip,
      take: size,
    });
    return new PageableDTO(
      result.map((file) => new UploadFileDTO(file)),
      {
        pageOptionsDTO: filter,
        itemCount: count,
      },
    );
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      const uploadResult: CompleteMultipartUploadCommandOutput =
        await new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.awsConfig.bucket,
            Key: `${this.awsConfig.prefix}/${new Date().getTime()}-${
              file.originalname
            }`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentDisposition: 'inline',
          },
        }).done();

      const newFile = this.create({
        key: uploadResult.Key,
        url: formatImageUrl(uploadResult.Key),
      });
      await this.save(newFile);
      return newFile;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('File uploaded to S3 fail');
    }
  }

  async deleteFile(fileKey: string) {
    const file = await this.findOne({
      where: {
        key: fileKey ?? '',
      },
    });
    if (!file) {
      throw new NotFoundException(
        stringFormat(ERROR_MESSAGE.NOT_FOUND, 'File'),
      );
    }

    await this.s3.deleteObject(
      {
        Bucket: this.awsConfig.bucket,
        Key: fileKey,
      },
      async (err, data) => {
        if (err) {
          this.logger.error(err);
          throw new BadRequestException(err, err.stack);
        }
        await this.deleteById(file.id);
      },
    );
  }

  async getImagesKeys(newImg: Express.Multer.File, oldImg?: string) {
    const [newFile] = await Promise.all([
      this.uploadFile(newImg),
      oldImg
        ? this.deleteFile(oldImg).catch((e) => {
            this.logger.warn('Image not exist:', e);
            return;
          })
        : null,
    ]);
    return newFile.key;
  }

  async downloadFile(key: string) {
    const file = await this.findOne({
      where: {
        key,
      },
    });
    if (!file) {
      throw new NotFoundException(`File ${key} does not found`);
    }
    try {
      return await this.s3.getObject({
        Bucket: this.awsConfig.bucket,
        Key: key,
      });
    } catch (e) {
      throw new InternalServerErrorException(e, 'Error downloading the file');
    }
  }
}
