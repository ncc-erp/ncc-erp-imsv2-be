import {
  PermitActions,
  RequireMission,
  RequireRoles,
} from '@/common/decorators/authorization.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '@/common/decorators/paginated-response.decorator';
import { PageOptionsDTO } from '@/common/dto/page-options.dto';
import { PageableDTO } from '@/common/dto/pageable.dto';
import { BooleanTruePipe } from '@/common/pipes/boolean-true.pipe';
import { User } from '@/entities/user.entity';
import { LoggerService } from '@/logger/logger.service';
import { Action } from '@/types/authorization/action.enum';
import { Mission } from '@/types/authorization/mission.enum';
import { StatusType } from '@/types/status.enum';
import { NewsDTO } from '@features/cms/dto/news.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleName } from '@/types/authorization/role.enum';
import { CMSService } from './cms.service';
import { NewsFilter } from './dto/news-filter.dto';
import { QuickNewsDTO } from './dto/quick-news.dto';
import { SaveNewsDTO } from './dto/save-news.dto';
import { SearchFilter } from './dto/search-filter.dto';

@RequireMission(Mission.CMS)
@Controller('news')
@ApiTags('CMS')
@ApiBearerAuth()
export class CMSController {
  constructor(
    private readonly cmsService: CMSService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CMSController.name);
  }

  /*
   *  Get news's categories
   */
  @PermitActions(Action.READ)
  @Get('search-filters')
  @ApiResponse({ type: SearchFilter })
  async getNewsCategories() {
    try {
      const res = await this.cmsService.getSearchFilter();
      return res;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   *  Get latest news
   */
  @PermitActions(Action.READ)
  @Get('latest')
  @ApiResponse({ type: [NewsDTO] })
  async getLatestNews() {
    try {
      const res = await this.cmsService.getLatestNews();
      return res;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   *  Get all news
   */
  @PermitActions(Action.READ)
  @Get()
  @ApiPaginatedResponse({ model: NewsDTO })
  async getAllNews(@Query() query: NewsFilter): Promise<PageableDTO<NewsDTO>> {
    try {
      query.status = StatusType.Approved;
      const res = await this.cmsService.getAllNews(query);
      return res;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   *  Get admin's news
   */
  @PermitActions(Action.MANAGE)
  @Get('admin')
  @ApiPaginatedResponse({ model: NewsDTO })
  async getAdminNews(
    @Query() query: NewsFilter,
  ): Promise<PageableDTO<NewsDTO>> {
    try {
      const res = await this.cmsService.getAllNews(query, true);
      return res;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   *  Save news (and submit) (Save draft)
   */
  @PermitActions(Action.MANAGE)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnailImageFile', maxCount: 1 },
      { name: 'coverImageFile', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Save news form',
    type: SaveNewsDTO,
  })
  async saveNews(
    @Body() createNewsDTO: SaveNewsDTO,
    @UploadedFiles()
    files: {
      thumbnailImageFile?: Express.Multer.File[];
      coverImageFile?: Express.Multer.File[];
    },
    @Query('submit', ParseBoolPipe) submit?: boolean,
  ) {
    try {
      createNewsDTO.thumbnailImageFile = files?.thumbnailImageFile?.[0];
      createNewsDTO.coverImageFile = files?.coverImageFile?.[0];
      createNewsDTO.status = StatusType.Draft;

      const newsId = await this.cmsService.saveNews(createNewsDTO);
      if (!newsId) throw new InternalServerErrorException('News not saved');
      if (submit)
        await this.cmsService.changeNewsStatus(StatusType.Waiting, newsId);
      return {
        status: HttpStatus.ACCEPTED,
        message: `News saved${submit ? ' and submitted' : ''}`,
        newsId,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /*
   *  Save and publish news
   */
  @PermitActions(Action.MANAGE)
  @Post('/save-publish')
  @RequireRoles(RoleName.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnailImageFile', maxCount: 1 },
      { name: 'coverImageFile', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update news form',
    type: SaveNewsDTO,
  })
  async saveAndPublishNews(
    @Body() updateNewsDTO: SaveNewsDTO,
    @UploadedFiles()
    files: {
      thumbnailImageFile?: Express.Multer.File[];
      coverImageFile?: Express.Multer.File[];
    },
    @Query('isNotify', BooleanTruePipe)
    isNotify = true,
  ) {
    try {
      updateNewsDTO.thumbnailImageFile = files?.thumbnailImageFile?.[0];
      updateNewsDTO.coverImageFile = files?.coverImageFile?.[0];
      updateNewsDTO.status = StatusType.Waiting;

      const newsId = await this.cmsService.saveNews(updateNewsDTO);
      if (!newsId)
        throw new InternalServerErrorException('News not saved and published');
      await this.cmsService.changeNewsStatus(
        StatusType.Approved,
        newsId,
        isNotify,
      );
      return {
        status: HttpStatus.ACCEPTED,
        message: `News's saved and published, id = ${newsId}`,
        news: newsId,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /*
   *  Get news details (Staff)
   */
  @PermitActions(Action.READ)
  @Get('details/:newsId')
  @ApiResponse({ type: NewsDTO })
  async getNewsDetails(@Param('newsId', ParseIntPipe) id: number) {
    try {
      return this.cmsService.getNewsDetails(id);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /*
   *  Get news details (Admin)
   */
  @PermitActions(Action.MANAGE)
  @Get('admin/details/:newsId')
  @ApiResponse({ type: NewsDTO })
  async getAdminNewsDetails(@Param('newsId', ParseIntPipe) id: number) {
    try {
      return this.cmsService.getNewsDetails(id, true);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /*
   *  Delete news
   */
  @PermitActions(Action.MANAGE)
  @Delete(':newsId')
  async deleteNews(@Param('newsId', ParseIntPipe) id: number) {
    try {
      await this.cmsService.deleteNews({ id });
      return {
        status: HttpStatus.OK,
        message: `Deleted news ,id: ${id}`,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   *  Soft delete news
   */
  @PermitActions(Action.MANAGE)
  @Put('soft-delete/:newsId')
  async softDeleteNews(@Param('newsId', ParseIntPipe) id: number) {
    try {
      await this.cmsService.softDeleteNews({ id });
      return {
        status: HttpStatus.ACCEPTED,
        message: `Soft deleted news ,id: ${id}`,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /*
   *  Submit news
   */
  @PermitActions(Action.READ, Action.MANAGE)
  @Post('submit/:newsId')
  async submitNews(@Param('newsId', ParseIntPipe) id: number) {
    try {
      await this.cmsService.changeNewsStatus(StatusType.Waiting, id);
      return {
        status: HttpStatus.OK,
        message: `News submitted, id = ${id}`,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   *  Publish news
   */
  @PermitActions(Action.MANAGE)
  @RequireRoles(RoleName.ADMIN)
  @Post('publish/:newsId')
  async publishNews(
    @Param('newsId', ParseIntPipe) id: number,
    @Query('isNotify', BooleanTruePipe)
    isNotify = true,
  ) {
    try {
      await this.cmsService.changeNewsStatus(StatusType.Approved, id, isNotify);
      return {
        status: HttpStatus.OK,
        message: `News publish, id = ${id}`,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   *  Unpublish news
   */
  @PermitActions(Action.MANAGE)
  @RequireRoles(RoleName.ADMIN)
  @Post('unpublish/:newsId')
  async unpublishNews(@Param('newsId', ParseIntPipe) id: number) {
    try {
      await this.cmsService.changeNewsStatus(StatusType.Hidden, id);
      return {
        status: HttpStatus.OK,
        message: `News unpublish, id = ${id}`,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   *  Reject news
   */
  @PermitActions(Action.MANAGE)
  @Post('reject/:newsId')
  async rejectNews(@Param('newsId', ParseIntPipe) id: number) {
    try {
      await this.cmsService.changeNewsStatus(StatusType.Draft, id);
      return {
        status: HttpStatus.OK,
        message: `News rejected, id = ${id}`,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   *  Draft news
   */
  @PermitActions(Action.MANAGE)
  @Post('draft/:newsId')
  async draftNews(@Param('newsId', ParseIntPipe) id: number) {
    try {
      await this.cmsService.changeNewsStatus(StatusType.Draft, id);
      return {
        status: HttpStatus.OK,
        message: `News drafted, id = ${id}`,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   * User like/unlike News
   */
  @PermitActions(Action.READ)
  @Post('like/:newsId')
  async saveLike(
    @Param('newsId') entityId: number,
    @Query('liked', ParseBoolPipe) liked: boolean,
    @CurrentUser() user: User,
  ) {
    try {
      await this.cmsService.saveLike(entityId, liked);
      return {
        status: HttpStatus.CREATED,
        message: `User ${user.emailAddress} has ${
          liked ? 'liked' : 'unliked'
        } News, id = ${entityId}`,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /*
   *  Get quick news
   */
  @PermitActions(Action.READ)
  @Get('quick-news')
  @ApiPaginatedResponse({ model: QuickNewsDTO })
  async getQuickNews(@Query() query: PageOptionsDTO) {
    try {
      const quickNews = await this.cmsService.getQuickNews(query);
      return quickNews;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
