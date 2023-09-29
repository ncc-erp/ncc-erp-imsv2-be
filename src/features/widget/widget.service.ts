import { OrderingDirection } from '@/common/constants/order.constant';
import { UserWidget } from '@/entities/user-widget.entity';
import { User } from '@/entities/user.entity';
import { LoggerService } from '@/logger/logger.service';
import {
  toUserWidgetDTO,
  toUserWidgetEntity,
  toWidgetDTO,
} from '@/mapping/widget.mapping';
import { EntityName } from '@/types/entityName.enum';
import { Widget } from '@entities/widget.entity';
import { EntityTypeService } from '@features/entity-type/entity-type.service';
import { FilesService } from '@features/files/files.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';

import { UpdateWidgetDTO } from './dto/update-widget.dto';
import { UserWidgetDTO } from './dto/user-widget.dto';
import { SettingService } from '@features/setting/setting.service';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(Widget)
    private readonly widgetRepository: Repository<Widget>,
    @InjectRepository(UserWidget)
    private readonly userWidgetRepository: Repository<UserWidget>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityService: EntityTypeService,
    private readonly settingService: SettingService,
    private readonly filesService: FilesService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(WidgetService.name);
  }

  async getManyWidget(filter: FindManyOptions<Widget>) {
    return this.widgetRepository.find(filter);
  }

  async saveManyWidget(data: Widget[]) {
    return this.widgetRepository.save(data);
  }

  async getWidgets(includeDisabled = false) {
    let where = {};
    if (!includeDisabled) {
      where = { isEnabled: true };
    }
    const widgets = await this.widgetRepository.find({
      where,
      order: { title: OrderingDirection.ASC },
    });

    return widgets.map((w) => toWidgetDTO(w));
  }

  private getMyLayouts(currentUserId: number, includeDisabled = false) {
    let where: FindOptionsWhere<UserWidget> = { user: { id: currentUserId } };

    if (!includeDisabled) {
      where = { ...where, widget: { isEnabled: true } };
    }

    return this.userWidgetRepository.find({
      relations: { widget: true, user: true },
      where: where,
    });
  }

  async returnDefaultWidgetLayout(currentUserId: number) {
    await this.userWidgetRepository.delete({
      user: {
        id: currentUserId,
      },
    });
  }

  async getMyDashBoard(currentUserId: number) {
    const userWidgets = await this.getMyLayouts(currentUserId);
    if (!userWidgets || userWidgets.length === 0) {
      return await this.settingService.getDefaultWidgetLayout();
    }
    return userWidgets.map((w) => toUserWidgetDTO(w));
  }

  async setMyLayoutToDefaultWidgetLayout(currentUserId: number) {
    const myWidgets = await this.getMyLayouts(currentUserId);
    await this.settingService.saveDefaultWidgetLayout(
      myWidgets.map((e) => {
        delete e.id;
        return toUserWidgetDTO(e);
      }),
    );
  }

  async updateMyDashboard(currentUserId: number, dtos: UserWidgetDTO[]) {
    const insertDTOs = dtos.filter((l) => !l.id);
    const updateDTOs = dtos.filter((l) => !!l.id);

    const user = await this.userRepository.findOneBy({ id: currentUserId });
    const widgets = await this.widgetRepository.findBy({
      id: In(insertDTOs.map((dto) => dto.widgetId)),
    });

    const insertUserWidgets = insertDTOs.map((dto) => {
      return toUserWidgetEntity(
        dto,
        user,
        widgets.find((u) => u.id === dto.widgetId),
      );
    });

    const existUserWidgets = await this.getMyLayouts(currentUserId, true);
    const deleteUserWidgetIds = existUserWidgets
      .filter((uw) => !updateDTOs.some((l) => l.id === uw.id))
      .map((uw) => uw.id);
    const updateUserWidgets = existUserWidgets
      .filter((uw) => updateDTOs.some((l) => l.id === uw.id))
      .map((uw) => {
        const uDTO = updateDTOs.find((l) => l.id === uw.id);
        uw.posX = uDTO.posX;
        uw.posY = uDTO.posY;
        uw.height = uDTO.height;
        uw.width = uDTO.width;
        uw.title = uDTO.title;
        return uw;
      });

    const updateCount = await this.userWidgetRepository.save(
      insertUserWidgets.concat(updateUserWidgets),
    );
    if (deleteUserWidgetIds.length === 0) {
      return `${updateCount.length} items were inserted/updated, 0 items were deleted`;
    } else {
      const deleteCount = await this.userWidgetRepository.delete(
        deleteUserWidgetIds,
      );
      return `${updateCount.length} items were inserted/updated, ${deleteCount.affected} items were deleted`;
    }
  }

  async updateWidget(dto: UpdateWidgetDTO) {
    if (dto.defaultHeight > dto.maxHeight || dto.defaultWidth > dto.maxWidth) {
      throw new BadRequestException('Kích thước không chính xác.');
    }

    const widget = await this.widgetRepository.findOneBy({ id: dto.id });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    //Check entityTypeId
    if (dto.entityTypeId) {
      const entityType = await this.entityService.findOne({
        where: {
          id: dto.entityTypeId,
          entityName: EntityName.Widgets,
        },
      });
      if (!entityType)
        throw new BadRequestException(
          'Entity type either not exist or not of Widgets type',
        );

      widget.entityType = entityType;
    }

    widget.title = dto.title;
    widget.description = dto.description;
    widget.defaultHeight = dto.defaultHeight;
    widget.defaultWidth = dto.defaultWidth;
    widget.maxHeight = dto.maxHeight;
    widget.maxWidth = dto.maxWidth;
    widget.url = dto.url;
    widget.isEnabled = dto.isEnabled;

    const proArr = [];
    const oldImg = widget.thumbnailImage;
    widget.thumbnailImage = dto.thumbnailImage;
    if (dto.thumbnailImageFile || !dto.thumbnailImage)
      proArr.push(
        this.filesService.deleteFile(oldImg).catch((e) => {
          this.logger.warn('thumbnailImage:', e);
          return;
        }),
      );
    if (dto.thumbnailImageFile)
      proArr.push(
        this.filesService
          .uploadFile(dto.thumbnailImageFile)
          .then((file) => (widget.thumbnailImage = file.key)),
      );
    await Promise.all(proArr);

    return this.widgetRepository.update({ id: widget.id }, widget);
  }

  async changeStatusWidget(id: number, status: boolean) {
    const widget = await this.widgetRepository.findOneBy({ id: id });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    widget.isEnabled = status;
    const res = await this.widgetRepository.save(widget);

    return res;
  }
}
