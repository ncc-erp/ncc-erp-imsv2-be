import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LoggerService } from '@/logger/logger.service';
import { Action } from '@/types/authorization/action.enum';
import { Mission } from '@/types/authorization/mission.enum';
import { EntityName } from '@/types/entityName.enum';
import { EntityTypeDTO } from '@features/entity-type/dto/entity-type.dto';
import { EntityTypeService } from '@features/entity-type/entity-type.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateWidgetDTO } from './dto/update-widget.dto';
import { UserWidgetDTO } from './dto/user-widget.dto';
import { WidgetDTO } from './dto/widget.dto';
import { WidgetService } from './widget.service';

@RequireMission(Mission.WIDGET)
@ApiBearerAuth()
@Controller('widgets')
@ApiTags('Widgets')
export class WidgetController {
  constructor(
    private readonly widgetService: WidgetService,
    private readonly entityService: EntityTypeService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(WidgetController.name);
  }

  /*
   * Get all enabled widgets
   */
  @PermitActions(Action.READ)
  @Get()
  @ApiOkResponse({
    description: 'List of widgets on dashboard',
    type: [WidgetDTO],
  })
  async getWidgets() {
    try {
      const res = await this.widgetService.getWidgets();
      return res;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   * Get my dashboard
   */
  @PermitActions(Action.READ)
  @Get('my-dashboard')
  @ApiOkResponse({
    description: 'List of userWidgets',
    type: [UserWidgetDTO],
  })
  async getMyDashBoard(@CurrentUser('id') userId: number) {
    try {
      const res = await this.widgetService.getMyDashBoard(userId);
      return res;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   * Update my dashboard
   */
  @PermitActions(Action.READ, Action.MANAGE)
  @Post('my-dashboard')
  @ApiBody({
    type: [UserWidgetDTO],
  })
  async updateMyDashBoard(
    @Body() data: UserWidgetDTO[],
    @CurrentUser('id') userId: number,
  ) {
    try {
      const res = await this.widgetService.updateMyDashboard(userId, data);
      return res;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   * Update widget
   */
  @PermitActions(Action.MANAGE)
  @Put()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('thumbnailImageFile'))
  @ApiBody({
    type: UpdateWidgetDTO,
    description: 'Update widget',
  })
  async updateWidget(
    @Body() data: UpdateWidgetDTO,
    @UploadedFile() thumbnailImageFile?: Express.Multer.File,
  ) {
    try {
      data.thumbnailImageFile = thumbnailImageFile;
      const res = await this.widgetService.updateWidget(data);
      return {
        status: HttpStatus.ACCEPTED,
        message: `Updated ${res.affected} widget(s)`,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   * Enable widget
   */
  @PermitActions(Action.MANAGE)
  @Get(':id/enable')
  async enableWidget(@Param('id') id: number) {
    try {
      const res = await this.widgetService.changeStatusWidget(id, true);
      return res.id;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   * Disable widget
   */
  @PermitActions(Action.MANAGE)
  @Get(':id/disable')
  async disableWidget(@Param('id') id: number) {
    try {
      const res = await this.widgetService.changeStatusWidget(id, false);
      return res.id;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   * Get categories
   */
  @PermitActions(Action.READ)
  @Get('categories')
  @ApiResponse({ type: [EntityTypeDTO] })
  async getWidgetCategories() {
    try {
      const res = await this.entityService.getCategories([EntityName.Widgets]);
      return res;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /*
   * Get all widgets (including disable ones)
   */
  @PermitActions(Action.MANAGE)
  @Get('list')
  @ApiOkResponse({
    description: 'List of widgets on admin page',
    type: [WidgetDTO],
  })
  async getWidgetList() {
    try {
      const res = await this.widgetService.getWidgets(true);
      return res;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @PermitActions(Action.MANAGE)
  @Get('set-my-layout-to-default-layout')
  async setMyLayoutToDefaultLayoutWidget(@CurrentUser('id') id: number) {
    await this.widgetService.setMyLayoutToDefaultWidgetLayout(id);
  }

  @PermitActions(Action.READ)
  @Get('restore-default-layout')
  async restoreDefaultLayout(@CurrentUser('id') id: number) {
    await this.widgetService.returnDefaultWidgetLayout(id);
  }
}
