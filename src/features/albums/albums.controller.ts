import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { LoggerService } from '@/logger/logger.service';
import { Action } from '@/types/authorization/action.enum';
import { Mission } from '@/types/authorization/mission.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AlbumsService } from './albums.service';
import { SaveAlbumDTO } from './dto/save-album.dto';
import { EntityTypeDTO } from '@features/entity-type/dto/entity-type.dto';
import { AlbumsDTO } from '@features/albums/dto/albums.dto';
import { AlbumFilter } from '@features/albums/dto/album-filter.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageTypeFilter } from '@common/filter/image-type.filter';
import { ApiPaginatedResponse } from '@common/decorators/paginated-response.decorator';

@RequireMission(Mission.ALBUM)
@Controller('albums')
@ApiBearerAuth()
@ApiTags('Albums')
export class AlbumsController {
  constructor(
    private readonly albumsService: AlbumsService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AlbumsController.name);
  }

  @Get()
  @PermitActions(Action.READ)
  @ApiPaginatedResponse({ model: AlbumsDTO })
  async getAll(@Query() query: AlbumFilter) {
    return await this.albumsService.getAll(query);
  }

  @Get('admin')
  @PermitActions(Action.MANAGE)
  @ApiPaginatedResponse({ model: AlbumsDTO })
  async getAllAdmin(@Query() query: AlbumFilter) {
    return await this.albumsService.getAll(query, true);
  }

  @Get('search-filter')
  @PermitActions(Action.READ)
  @ApiResponse({ type: [EntityTypeDTO] })
  async getAlbumTypes() {
    return await this.albumsService.getSearchFilter();
  }

  @Get(':id')
  @PermitActions(Action.READ)
  async getOne(@Param('id') id: number) {
    return this.albumsService.getAlbumDetails(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnailImageFile', {
      limits: {
        fileSize: 5000000,
      },
      fileFilter: imageTypeFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Save album',
    type: SaveAlbumDTO,
  })
  @PermitActions(Action.MANAGE)
  async createAlbum(
    @Body() saveAlbumDTO: SaveAlbumDTO,
    @UploadedFile()
    thumbnailImageFile?: Express.Multer.File,
  ) {
    try {
      delete saveAlbumDTO.id;
      saveAlbumDTO.thumbnailImageFile = thumbnailImageFile;
      const albumId = await this.albumsService.saveAlbum(saveAlbumDTO);
      return {
        status: HttpStatus.CREATED,
        message: `Albums created, id = ${albumId}`,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('thumbnailImageFile', {
      limits: {
        fileSize: 5000000,
      },
      fileFilter: imageTypeFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update album',
    type: SaveAlbumDTO,
  })
  @PermitActions(Action.MANAGE)
  async updateAlbum(
    @Body() saveAlbumDTO: SaveAlbumDTO,
    @Param('id') id: number,
    @UploadedFile()
    thumbnailImageFile?: Express.Multer.File,
  ) {
    try {
      saveAlbumDTO.id = id;
      saveAlbumDTO.thumbnailImageFile = thumbnailImageFile;
      const albumId = await this.albumsService.saveAlbum(saveAlbumDTO);
      return {
        status: HttpStatus.ACCEPTED,
        message: `Albums updated, id = ${albumId}`,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  @Delete(':id')
  @PermitActions(Action.MANAGE)
  async deleteAlbum(@Param('id') id: number) {
    try {
      await this.albumsService.deleteById(id, true);
      return {
        status: HttpStatus.ACCEPTED,
        message: `Albums deleted, id = ${id}`,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
